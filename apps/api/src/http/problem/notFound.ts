import type { Context } from 'hono';
import { problemResponse } from './problemResponse';
import { routeNotFoundProblem } from './problems';

/** Rotas /api/* desconhecidas viram 404 em problem+json; o resto segue o padrão do Hono. */
export function notFoundHandler(c: Context): Response {
  if (c.req.path.startsWith('/api/')) {
    return problemResponse(routeNotFoundProblem());
  }
  return c.text('Não encontrado', 404);
}
