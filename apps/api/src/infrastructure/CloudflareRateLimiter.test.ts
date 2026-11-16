import { describe, expect, it } from 'vitest';
import { CloudflareRateLimiter } from './CloudflareRateLimiter';

describe('CloudflareRateLimiter', () => {
  it('repassa a chave ao binding e permite quando o binding responde success', async () => {
    const chamadas: string[] = [];
    const binding: RateLimit = {
      limit: ({ key }) => {
        chamadas.push(key);
        return Promise.resolve({ success: true });
      },
    };

    const permitido = await new CloudflareRateLimiter(binding).allow('203.0.113.7');

    expect(permitido).toBe(true);
    expect(chamadas).toEqual(['203.0.113.7']);
  });

  it('nega quando o binding responde success falso', async () => {
    const binding: RateLimit = { limit: () => Promise.resolve({ success: false }) };

    expect(await new CloudflareRateLimiter(binding).allow('unknown')).toBe(false);
  });
});
