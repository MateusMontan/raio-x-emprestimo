import type { SimulationInput } from '@raiox/contracts';

/** Registro gravado: só entradas, nunca o resultado. Datas em ISO-8601 UTC. */
export interface SimulationRecord {
  readonly id: string;
  readonly input: SimulationInput;
  readonly schemaVersion: number;
  readonly createdAt: string;
  readonly expiresAt: string;
}

/** Registro lido do armazenamento: `input` ainda não validado. */
export interface StoredSimulation {
  readonly id: string;
  readonly input: unknown;
  readonly schemaVersion: number;
  readonly createdAt: string;
  readonly expiresAt: string;
}
