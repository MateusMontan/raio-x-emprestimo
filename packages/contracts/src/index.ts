import type { z } from 'zod';
import type { amortizationSystemSchema, iofModeSchema } from './primitives';
import type { simulationInputSchema, simulationResultSchema } from './simulation';
import type { offerInputSchema, offerAnalysisSchema } from './offer';
import type { shareResponseSchema, sharedSimulationSchema } from './share';
import type { problemSchema, fieldErrorSchema } from './problem';

export { LIMITS, SHARE_TTL_DAYS, MAX_COMPARE_SCENARIOS } from './limits';
export {
  isoDateSchema,
  simulationIdSchema,
  amortizationSystemSchema,
  iofModeSchema,
} from './primitives';
export { simulationInputSchema, simulationResultSchema } from './simulation';
export { offerInputSchema, offerAnalysisSchema } from './offer';
export { shareResponseSchema, sharedSimulationSchema } from './share';
export { problemSchema, fieldErrorSchema } from './problem';
export { healthSchema } from './health';

/** Entrada já validada, com defaults aplicados. */
export type SimulationInput = z.output<typeof simulationInputSchema>;
/** Entrada crua aceita pela API (defaults opcionais). */
export type SimulationRequest = z.input<typeof simulationInputSchema>;
export type SimulationResult = z.output<typeof simulationResultSchema>;
export type ScheduleRow = SimulationResult['schedule'][number];
export type OfferInput = z.output<typeof offerInputSchema>;
export type OfferAnalysis = z.output<typeof offerAnalysisSchema>;
export type ShareResponse = z.output<typeof shareResponseSchema>;
export type SharedSimulation = z.output<typeof sharedSimulationSchema>;
export type Problem = z.output<typeof problemSchema>;
export type FieldError = z.output<typeof fieldErrorSchema>;
export type AmortizationSystem = z.output<typeof amortizationSystemSchema>;
export type IofMode = z.output<typeof iofModeSchema>;
