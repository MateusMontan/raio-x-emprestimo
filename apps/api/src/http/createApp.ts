import { OpenAPIHono } from '@hono/zod-openapi';
import { handleError } from './problem/errorHandler';
import { notFoundHandler } from './problem/notFound';
import { validationHook } from './problem/validationHook';
import { apiHeaders } from './middleware/apiHeaders';
import { limitPostBody } from './middleware/bodyLimit';
import { registerOfferRoutes } from './routes/offerRoutes';
import { registerSharedPageRoute } from './routes/sharedPageRoute';
import { registerSimulationRoutes } from './routes/simulationRoutes';
import { registerSystemRoutes } from './routes/systemRoutes';
import type { ApiApp, ServicesResolver } from './types';

/**
 * Monta o app uma vez. Cada rota chama `resolve(c.env)` para obter os serviços
 * do próprio request, então o composition root decide as implementações.
 */
export function createApp<B extends object>(resolve: ServicesResolver<B>): ApiApp<B> {
  const app: ApiApp<B> = new OpenAPIHono<{ Bindings: B }>({ defaultHook: validationHook });

  app.onError((error) => handleError(error));
  app.notFound(notFoundHandler);
  app.use('/api/*', apiHeaders());
  app.use('/api/v1/*', limitPostBody());

  registerSystemRoutes(app);
  registerSimulationRoutes(app, resolve);
  registerOfferRoutes(app, resolve);
  registerSharedPageRoute(app, resolve);

  return app;
}
