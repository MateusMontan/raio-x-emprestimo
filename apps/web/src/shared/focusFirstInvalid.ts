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
  const campo = order.find((key) => errors[key] !== undefined);
  if (campo === undefined) return;
  const target = root.querySelector<HTMLElement>(targets[campo]);
  if (!target) return;
  const details = target.closest('details');
  if (details) details.open = true;
  target.focus();
}
