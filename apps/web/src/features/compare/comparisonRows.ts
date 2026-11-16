import { formatMoney, formatPercent } from '../../shared/format';
import type { ComparedResult } from './normalizeResult';

/** Selo de texto marcado nas células vencedoras. */
export type SealKind = 'cet' | 'total';

export interface ComparisonRow {
  key: string;
  label: string;
  cell: (result: ComparedResult) => string;
  seal?: SealKind;
}

function formatInstallments(quantidade: number): string {
  return `${quantidade} ${quantidade === 1 ? 'mês' : 'meses'}`;
}

function formatPayment(result: ComparedResult): string {
  if (result.firstPaymentCents === result.lastPaymentCents) {
    return formatMoney(result.firstPaymentCents);
  }
  return `de ${formatMoney(result.firstPaymentCents)} a ${formatMoney(result.lastPaymentCents)}`;
}

/** Linhas da tabela de comparação, na ordem em que aparecem. */
export const COMPARISON_ROWS: readonly ComparisonRow[] = [
  { key: 'released', label: 'Você recebe', cell: (r) => formatMoney(r.releasedCents) },
  { key: 'payment', label: 'Parcela', cell: formatPayment },
  { key: 'installments', label: 'Prazo', cell: (r) => formatInstallments(r.installments) },
  { key: 'rate', label: 'Taxa ao mês', cell: (r) => formatPercent(r.monthlyRate) },
  {
    key: 'cetMonthly',
    label: 'CET ao mês',
    cell: (r) => formatPercent(r.cetMonthly),
    seal: 'cet',
  },
  { key: 'cetAnnual', label: 'CET ao ano', cell: (r) => formatPercent(r.cetAnnual) },
  {
    key: 'total',
    label: 'Total pago',
    cell: (r) => formatMoney(r.totalPaidCents),
    seal: 'total',
  },
  { key: 'cost', label: 'Custo do crédito', cell: (r) => formatMoney(r.costCents) },
];

/** Texto do selo de cada tipo de vencedor. */
export const SEAL_TEXT: Record<SealKind, string> = {
  cet: 'Menor CET',
  total: 'Menor total pago',
};
