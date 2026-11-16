import type { Context } from 'hono';
import { simulationIdSchema } from '@raiox/contracts';
import { SimulationNotFoundError } from '../../application';
import { calculateRoute, getSharedRoute, shareRoute } from '../definitions/simulationDefinitions';
import { ProblemError } from '../problem/ProblemError';
import { rateLimitedProblem } from '../problem/problems';
import { asMutable } from '../mutable';
import type { ApiApp, ServicesResolver } from '../types';

/** Janela do limite de compartilhamento, em segundos (Retry-After). */
const RETRY_AFTER_SECONDS = '60';
const UNKNOWN_CLIENT = 'unknown';

/** Chave do limitador: IP do cliente informado pela Cloudflare. */
function clientKey(c: Context): string {
  return c.req.header('cf-connecting-ip') ?? UNKNOWN_CLIENT;
}

/** Rotas de simulação: cálculo (F1), compartilhamento (F4) e leitura (F4). */
export function registerSimulationRoutes<B extends object>(
  app: ApiApp<B>,
  resolve: ServicesResolver<B>,
): void {
  app.openapi(calculateRoute, (c) => {
    const result = resolve(c.env).calculateSimulation.execute(c.req.valid('json'));
    return c.json(asMutable(result), 200);
  });

  app.openapi(shareRoute, async (c) => {
    const services = resolve(c.env);
    const allowed = await services.shareLimiter.allow(clientKey(c));
    if (!allowed) {
      throw new ProblemError(rateLimitedProblem(), { 'Retry-After': RETRY_AFTER_SECONDS });
    }
    const shared = await services.shareSimulation.execute(c.req.valid('json'));
    return c.json(
      {
        id: shared.id,
        url: `${new URL(c.req.url).origin}/s/${shared.id}`,
        expiresAt: shared.expiresAt,
      },
      201,
    );
  });

  app.openapi(getSharedRoute, async (c) => {
    const { id } = c.req.valid('param');
    // Id malformado nem chega ao banco: vira o mesmo 404 de "não encontrada".
    if (!simulationIdSchema.safeParse(id).success) {
      throw new SimulationNotFoundError();
    }
    const simulation = await resolve(c.env).getSharedSimulation.execute(id);
    return c.json(asMutable(simulation), 200);
  });
}
