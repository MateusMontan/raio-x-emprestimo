/**
 * Data de hoje no fuso local, em YYYY-MM-DD.
 * É o único lugar do front que lê o relógio (`new Date()`).
 */
export function todayIso(agora: Date = new Date()): string {
  const ano = String(agora.getFullYear()).padStart(4, '0');
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}
