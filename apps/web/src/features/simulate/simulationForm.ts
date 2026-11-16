import type { AmortizationSystem, IofMode, SimulationInput } from '@raiox/contracts';

/** Campos do formulário, na ordem em que aparecem na tela. */
export const FORM_FIELDS = [
  'amountCents',
  'monthlyRate',
  'installments',
  'system',
  'contractDate',
  'firstDueDate',
  'feesCents',
  'iofMode',
] as const;

export type FormField = (typeof FORM_FIELDS)[number];
export type FormErrors = Partial<Record<FormField, string>>;

/** Estado editável do formulário. Campos vazios ficam null (ou '' nas datas). */
export interface SimulationFormState {
  amountCents: number | null;
  monthlyRate: number | null;
  installments: number | null;
  system: AmortizationSystem;
  contractDate: string;
  firstDueDate: string;
  feesCents: number | null;
  iofMode: IofMode;
}

/** Exemplo inicial: R$ 10.000,00, 2% a.m., 12 meses, Price, IOF financiado, sem tarifas. */
export function createDefaultForm(contractDate: string): SimulationFormState {
  return {
    amountCents: 1_000_000,
    monthlyRate: 0.02,
    installments: 12,
    system: 'PRICE',
    contractDate,
    firstDueDate: '',
    feesCents: 0,
    iofMode: 'FINANCED',
  };
}

/** Converte o formulário na entrada crua do schema: data vazia vira ausente. */
export function toCandidate(form: SimulationFormState): Record<string, unknown> {
  return {
    amountCents: form.amountCents,
    monthlyRate: form.monthlyRate,
    installments: form.installments,
    system: form.system,
    contractDate: form.contractDate === '' ? undefined : form.contractDate,
    firstDueDate: form.firstDueDate === '' ? undefined : form.firstDueDate,
    feesCents: form.feesCents,
    iofMode: form.iofMode,
  };
}

/** Preenche o formulário a partir de uma entrada já validada. */
export function fromInput(input: SimulationInput): SimulationFormState {
  return {
    amountCents: input.amountCents,
    monthlyRate: input.monthlyRate,
    installments: input.installments,
    system: input.system,
    contractDate: input.contractDate,
    firstDueDate: input.firstDueDate ?? '',
    feesCents: input.feesCents,
    iofMode: input.iofMode,
  };
}

/** Alvo de foco de cada campo. Radios apontam para o primeiro do grupo. */
export const FOCUS_TARGETS: Record<FormField, string> = {
  amountCents: '#valor',
  monthlyRate: '#taxa',
  installments: '#prazo',
  system: 'input[name="sistema"]',
  contractDate: '#contratacao',
  firstDueDate: '#primeiro-vencimento',
  feesCents: '#tarifas',
  iofMode: 'input[name="iof"]',
};
