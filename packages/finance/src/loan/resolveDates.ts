import { InvalidInputError } from '../errors';
import { IsoDate } from '../date/IsoDate';

export const DEFAULT_FIRST_DUE_OFFSET_DAYS = 30;

export interface LoanDates {
  readonly contract: IsoDate;
  readonly firstDue: IsoDate;
}

/** R6: 1º vencimento padrão = contratação + 30 dias; não pode ser anterior à contratação. */
export function resolveDates(contractDate: string, firstDueDate?: string): LoanDates {
  const contract = IsoDate.parse(contractDate);
  const firstDue =
    firstDueDate === undefined
      ? contract.addDays(DEFAULT_FIRST_DUE_OFFSET_DAYS)
      : IsoDate.parse(firstDueDate);
  if (contract.daysUntil(firstDue) < 0) {
    throw new InvalidInputError('Primeiro vencimento não pode ser anterior à contratação');
  }
  return { contract, firstDue };
}

/** R6: mesmo dia nos meses seguintes, com clamp no último dia do mês. */
export function dueDatesFrom(firstDue: IsoDate, installments: number): IsoDate[] {
  return Array.from({ length: installments }, (_, index) => firstDue.addMonths(index));
}
