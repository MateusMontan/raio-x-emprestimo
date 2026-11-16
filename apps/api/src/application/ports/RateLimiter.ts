/** Limita a frequência de uma ação por chave (ex.: IP). Devolve `true` se a ação é permitida. */
export interface RateLimiter {
  allow(key: string): Promise<boolean>;
}
