import { analyzeOfferRoute } from '../definitions/offerDefinitions';
import type { ApiApp, ServicesResolver } from '../types';

/** Rotas do Raio-X de oferta (F2). */
export function registerOfferRoutes<B extends object>(
  app: ApiApp<B>,
  resolve: ServicesResolver<B>,
): void {
  app.openapi(analyzeOfferRoute, (c) => {
    const analysis = resolve(c.env).analyzeOffer.execute(c.req.valid('json'));
    return c.json(analysis, 200);
  });
}
