/**
 * Leva o foco ao primeiro campo com erro, na ordem dada. Se o campo está dentro
 * de um <details> fechado, abre o <details> antes.
 */
export function focusFirstInvalid<Field extends string>(
  root: HTMLElement,
  errors: Partial<Record<Field, string>>,
  order: readonly Field[],
  targets: Record<Field, string>,
): void {
  const campo = order.find((chave) => errors[chave] !== undefined);
  if (campo === undefined) return;
  const alvo = root.querySelector<HTMLElement>(targets[campo]);
  if (!alvo) return;
  const detalhes = alvo.closest('details');
  if (detalhes) detalhes.open = true;
  alvo.focus();
}
