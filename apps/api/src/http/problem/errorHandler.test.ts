import { HTTPException } from 'hono/http-exception';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DomainError, InvalidInputError } from '@raiox/finance';
import { StoredSimulationInvalidError, IdCollisionError } from '../../application';
import { handleError } from './errorHandler';
import { ProblemError } from './ProblemError';
import { buildProblem } from './problems';

describe('handleError', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('devolve o problema de um ProblemError com os headers dele', async () => {
    const erro = new ProblemError(
      buildProblem({ status: 429, slug: 'x', title: 'T', detail: 'D' }),
      { 'Retry-After': '60' },
    );

    const res = handleError(erro);

    expect(res.status).toBe(429);
    expect(res.headers.get('retry-after')).toBe('60');
    expect(await res.json()).toMatchObject({ type: 'urn:raiox:problem:x', status: 429 });
  });

  it('traduz HTTPException 400 para JSON malformado', async () => {
    const res = handleError(new HTTPException(400, { message: 'Malformed JSON' }));

    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ type: 'urn:raiox:problem:malformed-json' });
  });

  it('mantém o status de outras HTTPException', async () => {
    const res = handleError(new HTTPException(415));

    expect(res.status).toBe(415);
    expect(await res.json()).toMatchObject({ type: 'urn:raiox:problem:http-error' });
  });

  it('traduz erro de domínio de entrada inválida para 422 com code', async () => {
    const res = handleError(new InvalidInputError('valor inválido'));

    expect(res.status).toBe(422);
    expect(await res.json()).toMatchObject({
      code: 'INVALID_INPUT',
      detail: 'valor inválido',
      type: 'urn:raiox:problem:invalid-input',
    });
  });

  it('trata erro de domínio sem mapeamento para o cliente como 500 genérico', async () => {
    const res = handleError(new DomainError('ALGUM_CODIGO', 'detalhe interno'));

    expect(res.status).toBe(500);
    const texto = await res.text();
    expect(texto).not.toContain('detalhe interno');
    expect(console.error).toHaveBeenCalledOnce();
  });

  it('responde 410 Gone para STORED_SIMULATION_INVALID, com problema descritivo e log', async () => {
    const res = handleError(new StoredSimulationInvalidError());

    expect(res.status).toBe(410);
    expect(res.headers.get('content-type')).toContain('application/problem+json');
    expect(await res.json()).toEqual({
      type: 'urn:raiox:problem:stored-simulation-invalid',
      title: 'Link indisponível',
      status: 410,
      detail:
        'Esta simulação foi salva em um formato que não é mais aceito. Faça uma nova simulação.',
      code: 'STORED_SIMULATION_INVALID',
    });
    expect(console.error).toHaveBeenCalledOnce();
  });

  it('responde 500 para ID_COLLISION sem vazar a mensagem', async () => {
    const colisao = handleError(new IdCollisionError(3));

    expect(colisao.status).toBe(500);
    expect(await colisao.text()).not.toContain('tentativas');
  });

  it('responde 500 e registra com console.error para erro comum', () => {
    const res = handleError(new TypeError('quebrou'));

    expect(res.status).toBe(500);
    expect(res.headers.get('content-type')).toContain('application/problem+json');
    expect(console.error).toHaveBeenCalledOnce();
  });
});
