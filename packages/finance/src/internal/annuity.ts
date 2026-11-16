/**
 * Fator de anuidade `a(i) = (1 − (1 + i)^−n) / i`. Usado por PMT = PV / a(i) (R1) e pela
 * taxa implícita (R5). Escrito com `expm1`/`log1p`: calculado direto, `1 − (1 + i)^−n`
 * perde quase todos os dígitos quando `i` é muito pequeno.
 */
export function annuityFactor(rate: number, installments: number): number {
  if (rate === 0) return installments;
  return -Math.expm1(-installments * Math.log1p(rate)) / rate;
}
