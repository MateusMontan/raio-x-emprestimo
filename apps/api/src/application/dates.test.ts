import { describe, expect, it } from 'vitest';
import { addDays, isExpired } from './dates';

describe('addDays', () => {
  it('soma dias corridos de 24 horas sem alterar a data original', () => {
    const start = new Date('2026-01-01T00:00:00.000Z');

    const later = addDays(start, 2);

    expect(later.toISOString()).toBe('2026-01-03T00:00:00.000Z');
    expect(start.toISOString()).toBe('2026-01-01T00:00:00.000Z');
  });
});

describe('isExpired', () => {
  const now = new Date('2026-06-01T12:00:00.000Z');

  it('considera expirado quando expiresAt é igual a agora', () => {
    expect(isExpired('2026-06-01T12:00:00.000Z', now)).toBe(true);
  });

  it('considera expirado quando expiresAt já passou', () => {
    expect(isExpired('2026-06-01T11:59:59.999Z', now)).toBe(true);
  });

  it('não considera expirado quando expiresAt ainda não chegou', () => {
    expect(isExpired('2026-06-01T12:00:00.001Z', now)).toBe(false);
  });

  it('trata data inválida como expirada', () => {
    expect(isExpired('não é uma data', now)).toBe(true);
  });
});
