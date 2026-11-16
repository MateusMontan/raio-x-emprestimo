import { simulationIdSchema } from '@raiox/contracts';
import { PAGE_SECURITY_HEADERS } from '../security/pageHeaders';
import type { ApiApp, AssetsFetcher, ServicesResolver } from '../types';

/**
 * Páginas do front (SPA) em /s/*. Só `/s/:id` com link válido e existente → 200.
 * Qualquer outro caminho em /s/ (vazio, id malformado, mais segmentos, barra final) → 404
 * com o mesmo HTML, para o front mostrar a página amigável de "expirado".
 * A resposta nunca vai para cache e leva os headers de segurança da página.
 */
export function registerSharedPageRoute<B extends object>(
  app: ApiApp<B>,
  resolve: ServicesResolver<B>,
): void {
  app.get('/s/:id', async (c) => {
    const services = resolve(c.env);
    const id = c.req.param('id');
    const exists =
      simulationIdSchema.safeParse(id).success &&
      (await services.checkSharedSimulation.execute(id));
    return servePage(services.assets, c.req.url, exists);
  });

  app.get('/s/*', (c) => servePage(resolve(c.env).assets, c.req.url, false));
}

async function servePage(
  assets: AssetsFetcher,
  requestUrl: string,
  found: boolean,
): Promise<Response> {
  const page = await assets.fetch(new Request(`${new URL(requestUrl).origin}/`));
  const headers = new Headers(page.headers);
  for (const [name, value] of Object.entries(PAGE_SECURITY_HEADERS)) {
    headers.set(name, value);
  }
  return new Response(page.body, {
    status: found ? 200 : 404,
    headers,
  });
}
