/**
 * Menor valor entre os itens e os ids de todos os que empatam nele.
 * Só compara: não calcula nada. Devolve null sem itens.
 */
export function bestBy<Item extends { id: string }>(
  itens: readonly Item[],
  valorDe: (item: Item) => number,
): { value: number; ids: ReadonlySet<string> } | null {
  if (itens.length === 0) return null;
  const valores = itens.map(valorDe);
  const menor = Math.min(...valores);
  const ids = new Set(itens.filter((item) => valorDe(item) === menor).map((item) => item.id));
  return { value: menor, ids };
}
