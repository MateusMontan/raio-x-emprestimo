import type { SimulationInput } from '@raiox/contracts';
import type { SimulationResult } from '@raiox/finance';

/** Resposta de ShareSimulation: id curto e datas em ISO-8601 UTC. */
export interface ShareResult {
  readonly id: string;
  readonly createdAt: string;
  readonly expiresAt: string;
}

/** Simulação compartilhada lida do repositório, com o resultado recalculado. */
export interface SharedSimulation {
  readonly id: string;
  readonly createdAt: string;
  readonly expiresAt: string;
  readonly input: SimulationInput;
  readonly result: SimulationResult;
}
