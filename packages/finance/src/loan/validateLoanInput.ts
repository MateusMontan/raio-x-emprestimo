import { InvalidInputError } from '../errors';
import { assertInstallments } from '../amortization/assertInstallments';
import { Money } from '../money/Money';
import { Rate } from '../rate/Rate';
import type { IsoDate } from '../date/IsoDate';
import { resolveDates } from './resolveDates';
import type { IofMode, LoanInput } from './types';
import type { AmortizationSystem } from '../amortization/types';

export interface NormalizedLoan {
  readonly amount: Money;
  readonly fees: Money;
  readonly rate: Rate;
  readonly installments: number;
  readonly system: AmortizationSystem;
  readonly contract: IsoDate;
  readonly firstDue: IsoDate;
  readonly iofMode: IofMode;
}

const SYSTEMS: readonly AmortizationSystem[] = ['PRICE', 'SAC'];
const IOF_MODES: readonly IofMode[] = ['FINANCED', 'CASH', 'NONE'];

export function normalizeLoanInput(input: LoanInput): NormalizedLoan {
  const amount = Money.fromCents(input.amountCents);
  if (!amount.isPositive()) {
    throw new InvalidInputError('Valor do empréstimo deve ser positivo');
  }
  const fees = Money.fromCents(input.feesCents ?? 0);
  if (fees.cents < 0) {
    throw new InvalidInputError('Tarifas e seguro não podem ser negativos');
  }
  assertInstallments(input.installments);
  if (!SYSTEMS.includes(input.system)) {
    throw new InvalidInputError(`Sistema de amortização desconhecido: ${input.system}`);
  }
  const iofMode = input.iofMode ?? 'FINANCED';
  if (!IOF_MODES.includes(iofMode)) {
    throw new InvalidInputError(`Modo de IOF desconhecido: ${iofMode}`);
  }
  const { contract, firstDue } = resolveDates(input.contractDate, input.firstDueDate);
  return {
    amount,
    fees,
    rate: Rate.monthly(input.monthlyRate),
    installments: input.installments,
    system: input.system,
    contract,
    firstDue,
    iofMode,
  };
}
