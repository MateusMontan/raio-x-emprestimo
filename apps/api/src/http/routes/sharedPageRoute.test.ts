import { describe, expect, it } from 'vitest';
import { aSimulationInput } from '../../application/testing/fixtures';
import { FAKE_PAGE_HTML } from '../testing/FakeAssets';
import { createTestHarness, get, postJson } from '../testing/harness';

async function compartilhar(app: ReturnType<typeof createTestHarness>['app']): Promise<string> {
  const res = await postJson(app, '/api/v1/simulations', aSimulationInput());
  const body = await res.json<{ id: string }>();
  return body.id;
}

const PAGE_CSP_LITERAL =
  "default-src 'self'; script-src 'self'; style-src 'self'; style-src-attr 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";

describe('GET /s/:id', () => {
  it('devolve 200 com o HTML do front e os headers dos assets para um link válido', async () => {
    const { app, assets } = createTestHarness();
    const id = await compartilhar(app);

    const res = await get(app, `/s/${id}`);

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('text/html; charset=utf-8');
    expect(res.headers.get('x-asset-source')).toBe('fake');
    expect(await res.text()).toBe(FAKE_PAGE_HTML);
    expect(assets.requestedUrls).toEqual(['http://localhost/']);
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it('devolve 404 com o mesmo HTML para id inexistente', async () => {
    const { app } = createTestHarness();

    const res = await get(app, '/s/zzzzzzzzzz');

    expect(res.status).toBe(404);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(await res.text()).toBe(FAKE_PAGE_HTML);
  });

  it('devolve 404 com o mesmo HTML para link expirado', async () => {
    const { app, clock } = createTestHarness();
    const id = await compartilhar(app);
    clock.advanceMs(180 * 86_400_000);

    const res = await get(app, `/s/${id}`);

    expect(res.status).toBe(404);
    expect(await res.text()).toBe(FAKE_PAGE_HTML);
  });

  it('devolve 404 com o mesmo HTML para id malformado', async () => {
    const { app } = createTestHarness();

    const res = await get(app, '/s/a!');

    expect(res.status).toBe(404);
    expect(await res.text()).toBe(FAKE_PAGE_HTML);
  });
  it.each(['/s/', '/s/a/b', '/s/x/'])('devolve 404 com a SPA para caminho %s', async (path) => {
    const { app } = createTestHarness();

    const res = await get(app, path);

    expect(res.status).toBe(404);
    expect(await res.text()).toBe(FAKE_PAGE_HTML);
  });

  it('aplica CSP, nosniff, Referrer-Policy e no-store em 200 e em 404', async () => {
    const { app } = createTestHarness();
    const id = await compartilhar(app);

    for (const path of [`/s/${id}`, '/s/zzzzzzzzzz']) {
      const res = await get(app, path);
      expect(res.headers.get('content-security-policy')).toBe(PAGE_CSP_LITERAL);
      expect(res.headers.get('x-content-type-options')).toBe('nosniff');
      expect(res.headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
      expect(res.headers.get('cache-control')).toBe('no-store');
    }
  });
});
