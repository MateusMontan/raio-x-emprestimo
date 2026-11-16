import type { RateLimiter } from '../application/ports/RateLimiter';

/**
 * Adapter do binding `ratelimits` do Workers. Falha aberta: se o limitador não responder,
 * a ação é permitida e o erro vai para o log, para que uma indisponibilidade não derrube o compartilhamento.
 */
export class CloudflareRateLimiter implements RateLimiter {
  constructor(private readonly binding: RateLimit) {}

  async allow(key: string): Promise<boolean> {
    try {
      const { success } = await this.binding.limit({ key });
      return success;
    } catch (error) {
      console.warn('Rate limiter indisponível: a ação foi permitida.', error);
      return true;
    }
  }
}
