import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { aSimulationInput } from '../../application/testing/fixtures';
import { get, postJson, createTestHarness, SHARE_IDS } from '../testing/harness';

describe('POST /api/v1/simulations/calculate', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calcula a Price do critério 1 da SPEC: 1ª parcela e total pago', async () => {
    const { app } = createTestHarness();

    const res = await postJson(app, '/api/v1/simulations/calculate', aSimulationInput());

    expect(res.status).toBe(200);
    const body = await res.json<{
      schedule: { payment: number }[];
      totals: { paidCents: number };
    }>();
    expect(body.schedule[0]?.payment).toBe(94560);
    expect(body.totals.paidCents).toBe(1134715);
  });

  it('aplica os defaults quando iofMode e feesCents não são enviados (IOF financiado)', async () => {
    const { app } = createTestHarness();
    const semDefaults = {
      amountCents: 1_000_000,
      monthlyRate: 0.02,
      installments: 12,
      system: 'PRICE',
      contractDate: '2026-01-10',
    };

    const res = await postJson(app, '/api/v1/simulations/calculate', semDefaults);

    expect(res.status).toBe(200);
    const body = await res.json<{
      iof: { mode: string; totalCents: number };
      totals: { paidCents: number };
    }>();
    expect(body.iof.mode).toBe('FINANCED');
    expect(body.iof.totalCents).toBeGreaterThan(0);
    expect(body.totals.paidCents).toBeGreaterThan(0);
  });

  it('responde 422 com errors[] apontando o campo e a mensagem em pt-BR', async () => {
    const { app } = createTestHarness();

    const res = await postJson(
      app,
      '/api/v1/simulations/calculate',
      aSimulationInput({ installments: 421 }),
    );

    expect(res.status).toBe(422);
    expect(res.headers.get('content-type')).toContain('application/problem+json');
    const body = await res.json<{
      type: string;
      title: string;
      status: number;
      errors: { path: string; message: string }[];
    }>();
    expect(body.type).toBe('urn:raiox:problem:validation');
    expect(body.title).toBe('Dados inválidos');
    expect(body.status).toBe(422);
    expect(body.errors).toEqual([
      { path: 'installments', message: 'O prazo vai de 1 a 420 meses.' },
    ]);
  });

  it('responde 400 quando o JSON é malformado', async () => {
    const { app } = createTestHarness();

    const res = await app.request('/api/v1/simulations/calculate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{"amountCents": ',
    });

    expect(res.status).toBe(400);
    expect(res.headers.get('content-type')).toContain('application/problem+json');
    const body = await res.json<{ type: string; detail: string }>();
    expect(body.type).toBe('urn:raiox:problem:malformed-json');
    expect(body.detail).toBe('O corpo da requisição não é um JSON válido.');
  });

  it('responde 413 quando o corpo passa de 16 KB', async () => {
    const { app } = createTestHarness();
    const corpoGrande = JSON.stringify({ ...aSimulationInput(), extra: 'x'.repeat(17 * 1024) });

    const res = await app.request('/api/v1/simulations/calculate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: corpoGrande,
    });

    expect(res.status).toBe(413);
    expect(res.headers.get('content-type')).toContain('application/problem+json');
    const body = await res.json<{ type: string }>();
    expect(body.type).toBe('urn:raiox:problem:payload-too-large');
  });

  it('responde 422 com code TAX_POLICY_NOT_FOUND quando não há política de IOF para a data', async () => {
    const { app } = createTestHarness();

    const res = await postJson(
      app,
      '/api/v1/simulations/calculate',
      aSimulationInput({ contractDate: '2021-06-01', iofMode: 'FINANCED' }),
    );

    expect(res.status).toBe(422);
    const body = await res.json<{ code: string; detail: string }>();
    expect(body.code).toBe('TAX_POLICY_NOT_FOUND');
    expect(body.detail).toBe('Nenhuma política de IOF vigente em 2021-06-01');
  });

  it('responde 500 sem vazar a mensagem quando o caso de uso lança erro inesperado', async () => {
    const { app } = createTestHarness({
      calculateSimulation: {
        execute: () => {
          throw new Error('segredo interno do banco');
        },
      },
    });

    const res = await postJson(app, '/api/v1/simulations/calculate', aSimulationInput());

    expect(res.status).toBe(500);
    expect(res.headers.get('content-type')).toContain('application/problem+json');
    const texto = await res.text();
    expect(texto).not.toContain('segredo interno');
    expect(console.error).toHaveBeenCalled();
  });
});

describe('POST /api/v1/simulations (compartilhar)', () => {
  it('grava e devolve 201 com id, url com /s/{id} e expiresAt', async () => {
    const { app, repository, limiter } = createTestHarness();

    const res = await postJson(app, '/api/v1/simulations', aSimulationInput(), {
      'cf-connecting-ip': '203.0.113.7',
    });

    expect(res.status).toBe(201);
    const body = await res.json<{ id: string; url: string; expiresAt: string }>();
    expect(body.id).toBe(SHARE_IDS[0]);
    expect(body.url).toBe(`http://localhost/s/${SHARE_IDS[0]}`);
    expect(body.expiresAt).toBe('2027-05-14T12:00:00.000Z');
    expect(repository.size).toBe(1);
    expect(limiter.keys).toEqual(['203.0.113.7']);
  });

  it('usa a chave "unknown" quando o cabeçalho cf-connecting-ip não existe', async () => {
    const { app, limiter } = createTestHarness();

    await postJson(app, '/api/v1/simulations', aSimulationInput());

    expect(limiter.keys).toEqual(['unknown']);
  });

  it('depois de compartilhar, GET /api/v1/simulations/{id} devolve entrada e resultado', async () => {
    const { app } = createTestHarness();
    const criada = await (
      await postJson(app, '/api/v1/simulations', aSimulationInput())
    ).json<{
      id: string;
    }>();

    const res = await get(app, `/api/v1/simulations/${criada.id}`);

    expect(res.status).toBe(200);
    const body = await res.json<{
      id: string;
      input: { amountCents: number; system: string };
      result: { schedule: unknown[]; totals: { paidCents: number } };
    }>();
    expect(body.id).toBe(criada.id);
    expect(body.input.amountCents).toBe(1_000_000);
    expect(body.input.system).toBe('PRICE');
    expect(body.result.schedule).toHaveLength(12);
    expect(body.result.totals.paidCents).toBe(1134715);
  });

  it('responde 429 com Retry-After e não grava nada quando o limitador nega', async () => {
    const { app, repository, limiter } = createTestHarness();
    limiter.setAllowed(false);

    const res = await postJson(app, '/api/v1/simulations', aSimulationInput());

    expect(res.status).toBe(429);
    expect(res.headers.get('retry-after')).toBe('60');
    expect(res.headers.get('content-type')).toContain('application/problem+json');
    const body = await res.json<{ type: string }>();
    expect(body.type).toBe('urn:raiox:problem:rate-limited');
    expect(repository.size).toBe(0);
  });
});

describe('GET /api/v1/simulations/{id}', () => {
  it('responde 404 para id inexistente', async () => {
    const { app } = createTestHarness();

    const res = await get(app, '/api/v1/simulations/zzzzzzzzzz');

    expect(res.status).toBe(404);
    const body = await res.json<{ code: string }>();
    expect(body.code).toBe('SIMULATION_NOT_FOUND');
  });

  it('responde 404 para id expirado (o relógio avança os 180 dias de validade)', async () => {
    const { app, clock } = createTestHarness();
    const criada = await (
      await postJson(app, '/api/v1/simulations', aSimulationInput())
    ).json<{
      id: string;
    }>();
    clock.advanceMs(180 * 86_400_000);

    const res = await get(app, `/api/v1/simulations/${criada.id}`);

    expect(res.status).toBe(404);
  });

  it('responde 404 para id malformado, sem consultar o banco', async () => {
    const { app } = createTestHarness();

    const res = await get(app, '/api/v1/simulations/curto');

    expect(res.status).toBe(404);
    const body = await res.json<{ code: string }>();
    expect(body.code).toBe('SIMULATION_NOT_FOUND');
  });
});
