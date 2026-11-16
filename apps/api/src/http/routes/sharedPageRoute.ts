import { simulationIdSchema } from '@raiox/contracts';
import type { ApiApp, ServicesResolver } from '../types';

/**
 * GET /s/:id: devolve a página do front (SPA). Link válido → 200; qualquer outro caso → 404
 * com o mesmo HTML, para o front mostrar a página amigável de "expirado".
 * A resposta nunca vai para cache: o status muda quando o link expira.
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

    const page = await services.assets.fetch(new Request(`${new URL(c.req.url).origin}/`));
    const headers = new Headers(page.headers);
    headers.set('Cache-Control', 'no-store');
    return new Response(page.body, {
      status: exists ? 200 : 404,
      headers,
    });
  });
}
