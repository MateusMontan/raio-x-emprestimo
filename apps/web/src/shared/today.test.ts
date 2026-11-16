import { describe, expect, it } from 'vitest';
import { todayIso } from './today';

describe('todayIso', () => {
  it('devolve a data local em YYYY-MM-DD com zeros à esquerda', () => {
    expect(todayIso(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });

  it('usa a data local e não a UTC', () => {
    expect(todayIso(new Date(2026, 10, 15, 0, 30))).toBe('2026-11-15');
  });
});
