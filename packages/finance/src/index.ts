export { simulateLoan } from './loan/simulateLoan';
export { analyzeOffer } from './loan/analyzeOffer';
export type {
  IofMode,
  LoanInput,
  LoanTotals,
  IofSummary,
  OfferAnalysis,
  OfferInput,
  ScheduleRow,
  SimulationResult,
} from './loan/types';
export type { AmortizationSystem } from './amortization/types';
export {
  DomainError,
  InvalidInputError,
  NonConvergenceError,
  TaxPolicyNotFoundError,
} from './errors';
export { Money } from './money/Money';
export { Rate } from './rate/Rate';
export { IsoDate } from './date/IsoDate';
export { TAX_POLICIES } from './tax/taxPolicies';
export type { TaxPolicy } from './tax/TaxPolicy';
