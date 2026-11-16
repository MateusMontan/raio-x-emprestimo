import { describe, expect, it, vi, afterEach } from 'vitest';
import { aSimulationInput } from '../../application/testing/fixtures';
import { createTestHarness, get, postJson } from '../testing/harness';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('headers da API', () => {
  it('respostas JSON trazem nosniff, no-store e CSP restritiva', async () => {
    const { app } = createTestHarness();

    const res = await get(app, '/api/health');

    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(res.headers.get('content-security-policy')).toContain("default-src 'none'");
    expect(res.headers.get('content-security-policy')).toContain("frame-ancestors 'none'");
  });

  it('erros da API são application/problem+json e também levam os headers de segurança', async () => {
    const { app } = createTestHarness();

    const res = await postJson(
      app,
      '/api/v1/simulations/calculate',
      aSimulationInput({ installments: 0 }),
    );

    expect(res.status).toBe(422);
    expect(res.headers.get('content-type')).toContain('application/problem+json');
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it('/api/docs usa a CSP que libera só o CDN do Scalar', async () => {
    const { app } = createTestHarness();

    const res = await get(app, '/api/docs');

    expect(res.headers.get('content-security-policy')).toBe(
      "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https:; font-src 'self' data: https://cdn.jsdelivr.net https://fonts.scalar.com; connect-src 'self'; frame-ancestors 'none'",
    );
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
  });

  it('o 404 de /api também recebe os headers da API', async () => {
    const { app } = createTestHarness();

    const res = await get(app, '/api/inexistente');

    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
  });
});
