import { PriceSchedule } from './PriceSchedule';
import { SacSchedule } from './SacSchedule';
import type { AmortizationStrategy, AmortizationSystem } from './types';

const STRATEGIES: Readonly<Record<AmortizationSystem, AmortizationStrategy>> = {
  PRICE: new PriceSchedule(),
  SAC: new SacSchedule(),
};

export function strategyFor(system: AmortizationSystem): AmortizationStrategy {
  return STRATEGIES[system];
}
