/**
 * Menor valor entre os itens e os ids de todos os que empatam nele.
 * Só compara: não calcula nada. Devolve null sem itens.
 */
export function bestBy<Item extends { id: string }>(
  items: readonly Item[],
  getValue: (item: Item) => number,
): { value: number; ids: ReadonlySet<string> } | null {
  if (items.length === 0) return null;
  const values = items.map(getValue);
  const lowest = Math.min(...values);
  const ids = new Set(items.filter((item) => getValue(item) === lowest).map((item) => item.id));
  return { value: lowest, ids };
}
