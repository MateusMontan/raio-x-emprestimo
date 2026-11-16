import { describe, expect, it } from 'vitest';
import { annuityFactor } from './annuity';

describe('annuityFactor a(i) = (1 − (1 + i)^−n) / i', () => {
  it('com taxa zero o fator é o número de parcelas', () => {
    expect(annuityFactor(0, 12)).toBe(12);
  });

  it('coincide com a fórmula direta em taxas comuns', () => {
    const direct = (1 - 1.02 ** -12) / 0.02;
    expect(annuityFactor(0.02, 12)).toBeCloseTo(direct, 12);
  });

  it('com taxa muito pequena segue a expansão n − n(n + 1)i/2 (sem cancelamento)', () => {
    const i = 1e-9;
    const n = 420;
    const series = n - (n * (n + 1) * i) / 2;
    expect(Math.abs(annuityFactor(i, n) - series) / series).toBeLessThan(1e-12);
  });

  it('cresce com n para taxa positiva (mais parcelas, maior fator)', () => {
    expect(annuityFactor(0.01, 24)).toBeGreaterThan(annuityFactor(0.01, 12));
  });
});
