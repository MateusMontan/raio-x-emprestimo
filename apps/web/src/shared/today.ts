/**
 * Data de hoje no fuso local, em YYYY-MM-DD.
 * É o único lugar do front que lê o relógio (`new Date()`).
 */
export function todayIso(now: Date = new Date()): string {
  const year = String(now.getFullYear()).padStart(4, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
