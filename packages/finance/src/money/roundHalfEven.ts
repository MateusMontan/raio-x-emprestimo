/**
 * Arredondamento "banqueiro" (half-even) para inteiro.
 * Empates (x.5 exato) vão para o inteiro par, evitando viés acumulado nas parcelas.
 */
export function roundHalfEven(value: number): number {
  if (!Number.isFinite(value)) {
    throw new RangeError(`roundHalfEven: valor não finito (${String(value)})`);
  }
  const floor = Math.floor(value);
  const fraction = value - floor;
  if (fraction < 0.5) return floor;
  if (fraction > 0.5) return floor + 1;
  return floor % 2 === 0 ? floor : floor + 1;
}
