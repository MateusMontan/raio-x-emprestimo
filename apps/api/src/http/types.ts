import type { OpenAPIHono } from '@hono/zod-openapi';
import type {
  AnalyzeOffer,
  CalculateSimulation,
  CheckSharedSimulation,
  GetSharedSimulation,
  RateLimiter,
  ShareSimulation,
} from '../application';

/** Assets estáticos do front (binding ASSETS). Só `fetch` é usado pela API. */
export interface AssetsFetcher {
  fetch(request: Request): Promise<Response>;
}

/** Casos de uso e ports que as rotas usam. Montados pelo composition root. */
export interface AppServices {
  readonly calculateSimulation: CalculateSimulation;
  readonly analyzeOffer: AnalyzeOffer;
  readonly shareSimulation: ShareSimulation;
  readonly getSharedSimulation: GetSharedSimulation;
  readonly checkSharedSimulation: CheckSharedSimulation;
  readonly shareLimiter: RateLimiter;
  readonly assets: AssetsFetcher;
}

/** Resolve os serviços a partir dos bindings do Worker, a cada requisição. */
export type ServicesResolver<B extends object> = (env: B) => AppServices;

/** App Hono com OpenAPI, tipado pelos bindings `B`. */
export type ApiApp<B extends object> = OpenAPIHono<{ Bindings: B }>;
