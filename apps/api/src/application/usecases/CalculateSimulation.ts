import type { SimulationInput } from '@raiox/contracts';
import { simulateLoan, type SimulationResult } from '@raiox/finance';
import { toLoanInput } from '../mappers';

/** F1: calcula cronograma, IOF e CET de uma simulação. Não persiste nada. */
export class CalculateSimulation {
  execute(input: SimulationInput): SimulationResult {
    return simulateLoan(toLoanInput(input));
  }
}
