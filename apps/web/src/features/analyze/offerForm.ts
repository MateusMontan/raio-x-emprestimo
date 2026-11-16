/** Campos do formulário da oferta, na ordem em que aparecem na tela. */
export const OFFER_FIELDS = [
  'releasedCents',
  'paymentCents',
  'installments',
  'contractDate',
  'firstDueDate',
] as const;

export type OfferField = (typeof OFFER_FIELDS)[number];

/** Estado editável do formulário da oferta. Campos vazios ficam null (ou '' nas datas). */
export interface OfferFormState {
  releasedCents: number | null;
  paymentCents: number | null;
  installments: number | null;
  contractDate: string;
  firstDueDate: string;
}

/** Exemplo inicial: recebe R$ 5.000,00, parcela de R$ 500,00, 12 meses. */
export function createDefaultOfferForm(contractDate: string): OfferFormState {
  return {
    releasedCents: 500_000,
    paymentCents: 50_000,
    installments: 12,
    contractDate,
    firstDueDate: '',
  };
}

/** Converte o formulário na entrada crua do schema: data vazia vira ausente. */
export function toOfferCandidate(form: OfferFormState): Record<string, unknown> {
  return {
    releasedCents: form.releasedCents,
    paymentCents: form.paymentCents,
    installments: form.installments,
    contractDate: form.contractDate === '' ? undefined : form.contractDate,
    firstDueDate: form.firstDueDate === '' ? undefined : form.firstDueDate,
  };
}
