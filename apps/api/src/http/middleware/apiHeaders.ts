import type { MiddlewareHandler } from 'hono';
import { secureHeaders } from 'hono/secure-headers';

export const DOCS_PATH = '/api/docs';

/**
 * Headers da API: CSP restritiva e no-store nas respostas JSON. /api/docs tem CSP própria,
 * que libera só o CDN do Scalar (script, estilo e fontes), sem no-store.
 */
export function apiHeaders(): MiddlewareHandler {
  const jsonHeaders = secureHeaders({
    contentSecurityPolicy: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] },
  });
  const docsHeaders = secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'data:', 'https://cdn.jsdelivr.net', 'https://fonts.scalar.com'],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
    },
  });

  return async (c, next) => {
    if (c.req.path === DOCS_PATH) {
      await docsHeaders(c, next);
      return;
    }
    await jsonHeaders(c, next);
    c.res.headers.set('Cache-Control', 'no-store');
  };
}
