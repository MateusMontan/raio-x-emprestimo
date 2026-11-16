import { describe, expect, it } from 'vitest';
import { SystemClock } from './SystemClock';

describe('SystemClock', () => {
  it('devolve um Date próximo do relógio real', () => {
    const before = Date.now();
    const now = new SystemClock().now();
    const after = Date.now();

    expect(now).toBeInstanceOf(Date);
    expect(now.getTime()).toBeGreaterThanOrEqual(before);
    expect(now.getTime()).toBeLessThanOrEqual(after);
  });
});
