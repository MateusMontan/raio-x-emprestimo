import { FORM_FIELDS, type FormErrors, type FormField } from './simulationForm';

/** Alvo de foco de cada campo. Radios apontam para o primeiro do grupo. */
const ALVO: Record<FormField, string> = {
  amountCents: '#valor',
  monthlyRate: '#taxa',
  installments: '#prazo',
  system: 'input[name="sistema"]',
  contractDate: '#contratacao',
  firstDueDate: '#primeiro-vencimento',
  feesCents: '#tarifas',
  iofMode: 'input[name="iof"]',
};

/** Leva o foco ao primeiro campo com erro, abrindo o <details> que o contém se estiver fechado. */
export function focusFirstInvalid(root: HTMLElement, errors: FormErrors): void {
  const campo = FORM_FIELDS.find((chave) => errors[chave] !== undefined);
  if (campo === undefined) return;
  const alvo = root.querySelector<HTMLElement>(ALVO[campo]);
  if (!alvo) return;
  const detalhes = alvo.closest('details');
  if (detalhes) detalhes.open = true;
  alvo.focus();
}
