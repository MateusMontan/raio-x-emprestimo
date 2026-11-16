import type { SimulationInput } from '@raiox/contracts';
import { formatDate, formatMoney, formatPercent } from '../../shared/format';

const SYSTEM_NAME = { PRICE: 'Price', SAC: 'SAC' } as const;

/** Frase com as entradas da simulação, já formatadas para leitura. */
export function describeInput(input: SimulationInput): string {
  const prazo = input.installments === 1 ? '1 mês' : `${input.installments} meses`;
  const sistema = SYSTEM_NAME[input.system];
  return (
    `Empréstimo de ${formatMoney(input.amountCents)}, em ${prazo}, ` +
    `a ${formatPercent(input.monthlyRate)} ao mês, sistema ${sistema}, ` +
    `contratado em ${formatDate(input.contractDate)}.`
  );
}

/** Data de validade (ISO com hora) como dd/mm/aaaa. A data vem em UTC, então não depende do fuso. */
export function expiryDate(expiresAt: string): string {
  return formatDate(expiresAt.slice(0, 10));
}
