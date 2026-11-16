import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CloudflareRateLimiter } from './CloudflareRateLimiter';

describe('CloudflareRateLimiter', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

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

  it('permite e registra um aviso quando o binding lança erro (falha aberta)', async () => {
    const binding: RateLimit = {
      limit: () => Promise.reject(new Error('limitador fora do ar')),
    };

    expect(await new CloudflareRateLimiter(binding).allow('203.0.113.7')).toBe(true);
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  it('permite quando o binding lança erro de forma síncrona', async () => {
    const binding = {
      limit: () => {
        throw new Error('binding quebrado');
      },
    } as unknown as RateLimit;

    expect(await new CloudflareRateLimiter(binding).allow('203.0.113.7')).toBe(true);
  });
});
