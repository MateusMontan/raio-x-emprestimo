import { describe, expect, it } from 'vitest';
import { aSimulationInput } from '../../application/testing/fixtures';
import { FAKE_PAGE_HTML } from '../testing/FakeAssets';
import { createTestHarness, get, postJson } from '../testing/harness';

async function compartilhar(app: ReturnType<typeof createTestHarness>['app']): Promise<string> {
  const res = await postJson(app, '/api/v1/simulations', aSimulationInput());
  const body = await res.json<{ id: string }>();
  return body.id;
}

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
  });

  it('devolve 404 com o mesmo HTML para id inexistente', async () => {
    const { app } = createTestHarness();

    const res = await get(app, '/s/zzzzzzzzzz');

    expect(res.status).toBe(404);
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
});
