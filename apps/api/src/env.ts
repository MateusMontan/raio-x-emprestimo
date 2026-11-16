/** Bindings do Worker (ver wrangler.jsonc). */
export interface Env {
  readonly DB: D1Database;
  readonly ASSETS: Fetcher;
  readonly SHARE_LIMITER: RateLimit;
}
