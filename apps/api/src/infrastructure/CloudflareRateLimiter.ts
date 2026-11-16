import type { RateLimiter } from '../application/ports/RateLimiter';

/** Adapter do binding `ratelimits` do Workers. */
export class CloudflareRateLimiter implements RateLimiter {
  constructor(private readonly binding: RateLimit) {}

  async allow(key: string): Promise<boolean> {
    const { success } = await this.binding.limit({ key });
    return success;
  }
}
