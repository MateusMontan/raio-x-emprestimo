import { describe, expect, it } from 'vitest';
import { createTestHarness, get } from '../testing/harness';
import { SCALAR_CDN_URL } from './systemRoutes';

describe('rotas de sistema', () => {
  it('GET /api/health responde 200 com status ok', async () => {
    const { app } = createTestHarness();

    const res = await get(app, '/api/health');

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
  });

  it('GET /api/openapi.json descreve OpenAPI 3.1 com as rotas da v1', async () => {
    const { app } = createTestHarness();

    const res = await get(app, '/api/openapi.json');

    expect(res.status).toBe(200);
    const doc = await res.json<{
      openapi: string;
      info: { title: string };
      paths: Record<string, unknown>;
    }>();
    expect(doc.openapi.startsWith('3.1')).toBe(true);
    expect(doc.info.title).toBe('Raio-X do Empréstimo API');
    expect(Object.keys(doc.paths)).toEqual(
      expect.arrayContaining([
        '/api/v1/simulations/calculate',
        '/api/v1/offers/analyze',
        '/api/v1/simulations',
        '/api/v1/simulations/{id}',
        '/api/health',
      ]),
    );
  });

  it('GET /api/docs responde 200 em HTML com a CSP específica do Scalar', async () => {
    // Antes este teste afirmava ausência de CSP. Agora a página tem uma CSP própria, que só
    // libera o CDN do Scalar (ver apiHeaders.test.ts para a string exata).
    const { app } = createTestHarness();

    const res = await get(app, '/api/docs');

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    expect(res.headers.get('content-security-policy')).toContain('https://cdn.jsdelivr.net');
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
  });

  it('GET /api/docs carrega o Scalar de uma versão fixa do CDN', async () => {
    const { app } = createTestHarness();

    const html = await (await get(app, '/api/docs')).text();

    expect(html).toContain(SCALAR_CDN_URL);
    expect(SCALAR_CDN_URL).toMatch(/@scalar\/api-reference@\d+\.\d+\.\d+$/);
  });

  it('responde 404 em problem+json para rota /api desconhecida', async () => {
    const { app } = createTestHarness();

    const res = await get(app, '/api/nao-existe');

    expect(res.status).toBe(404);
    expect(res.headers.get('content-type')).toContain('application/problem+json');
    const body = await res.json<{ type: string; status: number }>();
    expect(body.type).toBe('urn:raiox:problem:route-not-found');
    expect(body.status).toBe(404);
  });

  it('responde 404 em texto simples para caminhos fora de /api', async () => {
    const { app } = createTestHarness();

    const res = await get(app, '/nada-aqui');

    expect(res.status).toBe(404);
    expect(res.headers.get('content-type')).not.toContain('problem+json');
  });
});
