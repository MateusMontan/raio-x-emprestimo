import type { SimulationRecord } from './types';

/** Grava uma simulação compartilhada. Responde 'duplicate' se o id já existir. */
export interface SimulationWriter {
  save(record: SimulationRecord): Promise<'created' | 'duplicate'>;
}
