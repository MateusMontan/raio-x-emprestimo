import type { MiddlewareHandler } from 'hono';
import { secureHeaders } from 'hono/secure-headers';

export const DOCS_PATH = '/api/docs';

/** Headers da API: CSP restritiva e no-store nas respostas JSON; /api/docs fica sem CSP (carrega o Scalar). */
export function apiHeaders(): MiddlewareHandler {
  const jsonHeaders = secureHeaders({
    contentSecurityPolicy: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] },
  });
  const docsHeaders = secureHeaders();

  return async (c, next) => {
    if (c.req.path === DOCS_PATH) {
      await docsHeaders(c, next);
      return;
    }
    await jsonHeaders(c, next);
    c.res.headers.set('Cache-Control', 'no-store');
  };
}
