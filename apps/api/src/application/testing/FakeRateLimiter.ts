import type { RateLimiter } from '../ports/RateLimiter';

/** Limitador configurável: permite ou nega tudo, e guarda as chaves consultadas. */
export class FakeRateLimiter implements RateLimiter {
  readonly keys: string[] = [];
  private allowed: boolean;

  constructor(allowed = true) {
    this.allowed = allowed;
  }

  setAllowed(allowed: boolean): void {
    this.allowed = allowed;
  }

  allow(key: string): Promise<boolean> {
    this.keys.push(key);
    return Promise.resolve(this.allowed);
  }
}
