import { LIMITS } from './limits';

/** Formata centavos como moeda brasileira curta, ex.: 1000000 -> "R$ 10.000,00". */
export function formatBrl(cents: number): string {
  const reais = Math.floor(cents / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const centavos = (cents % 100).toString().padStart(2, '0');
  return `R$ ${reais},${centavos}`;
}

/** Mensagens de validação exibidas ao usuário (pt-BR). */
export const MSG = {
  amountRequired: 'Informe o valor.',
  amountInt: 'O valor deve estar em centavos inteiros.',
  amountRange: `O valor vai de ${formatBrl(LIMITS.amountCents.min)} a ${formatBrl(LIMITS.amountCents.max)}.`,
  installmentsRequired: 'Informe o prazo.',
  installmentsInt: 'O prazo deve ser um número inteiro de meses.',
  installmentsRange: `O prazo vai de ${LIMITS.installments.min} a ${LIMITS.installments.max} meses.`,
  rateRequired: 'Informe a taxa mensal.',
  rateRange: `A taxa mensal vai de ${LIMITS.monthlyRate.min * 100}% a ${LIMITS.monthlyRate.max * 100}%.`,
  systemRequired: 'Escolha o sistema de amortização.',
  system: 'O sistema deve ser Price ou SAC.',
  iofMode: 'Escolha se o IOF será financiado, pago à vista ou não calculado.',
  feesRequired: 'Informe as tarifas e o seguro.',
  feesInt: 'As tarifas devem estar em centavos inteiros.',
  feesNegative: 'As tarifas não podem ser negativas.',
  feesRatio: `Tarifas e seguro não podem passar de ${LIMITS.feesMaxRatio * 100}% do valor.`,
  dateRequired: 'Informe a data.',
  dateFormat: 'Use a data no formato AAAA-MM-DD.',
  dateRange: 'A data deve estar entre 2000 e 2100.',
  dateInvalid: 'Esta data não existe no calendário.',
  contractDateRequired: 'Informe a data da contratação.',
  firstDueDateInvalid: 'Use a data do primeiro vencimento no formato AAAA-MM-DD.',
  firstDueBeforeContract: 'O primeiro vencimento não pode ser antes da contratação.',
  paymentRequired: 'Informe o valor da parcela.',
  paymentInt: 'O valor da parcela deve estar em centavos inteiros.',
  paymentRange: `O valor da parcela vai de ${formatBrl(1)} a ${formatBrl(LIMITS.amountCents.max)}.`,
  simulationIdFormat: 'O identificador deve ter 10 letras ou números.',
  simulationIdRequired: 'Informe o identificador da simulação.',
} as const;
