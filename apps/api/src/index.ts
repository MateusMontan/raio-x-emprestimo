/**
 * Composition root: o ÚNICO lugar que instancia as implementações concretas.
 * Application e http só conhecem ports e casos de uso.
 */
import {
  AnalyzeOffer,
  CalculateSimulation,
  CheckSharedSimulation,
  GetSharedSimulation,
  PurgeExpiredSimulations,
  ShareSimulation,
} from './application';
import {
  CloudflareRateLimiter,
  CryptoIdGenerator,
  D1SimulationRepository,
  SystemClock,
} from './infrastructure';
import type { Env } from './env';
import { createApp } from './http/createApp';
import type { AppServices } from './http/types';
import { purgeOnSchedule } from './scheduled/purgeOnSchedule';

/** Monta os serviços de uma requisição a partir dos bindings. */
function buildServices(env: Env): AppServices {
  const repository = new D1SimulationRepository(env.DB);
  const clock = new SystemClock();
  const ids = new CryptoIdGenerator();
  return {
    calculateSimulation: new CalculateSimulation(),
    analyzeOffer: new AnalyzeOffer(),
    shareSimulation: new ShareSimulation(repository, ids, clock),
    getSharedSimulation: new GetSharedSimulation(repository, clock),
    checkSharedSimulation: new CheckSharedSimulation(repository, clock),
    shareLimiter: new CloudflareRateLimiter(env.SHARE_LIMITER),
    assets: env.ASSETS,
  };
}

const app = createApp<Env>(buildServices);

export default {
  fetch: app.fetch,
  scheduled(_controller, env, ctx) {
    const purge = new PurgeExpiredSimulations(
      new D1SimulationRepository(env.DB),
      new SystemClock(),
    );
    ctx.waitUntil(purgeOnSchedule(purge));
  },
} satisfies ExportedHandler<Env>;
