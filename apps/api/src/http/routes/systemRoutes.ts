import { Scalar } from '@scalar/hono-api-reference';
import { OPENAPI_DOCUMENT } from '../openapi/documentConfig';
import { healthRoute } from '../definitions/systemDefinitions';
import type { ApiApp } from '../types';

export const OPENAPI_PATH = '/api/openapi.json';
export const DOCS_UI_PATH = '/api/docs';

/** Health check, documento OpenAPI 3.1 e a interface Scalar. */
export function registerSystemRoutes<B extends object>(app: ApiApp<B>): void {
  app.openapi(healthRoute, (c) => c.json({ status: 'ok' as const }, 200));

  app.doc31(OPENAPI_PATH, OPENAPI_DOCUMENT);

  app.get(DOCS_UI_PATH, Scalar({ url: OPENAPI_PATH, pageTitle: 'Raio-X do Empréstimo API' }));
}
