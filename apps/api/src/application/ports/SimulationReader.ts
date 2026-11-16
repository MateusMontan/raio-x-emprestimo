import type { StoredSimulation } from './types';

/** Busca uma simulação compartilhada pelo id. O retorno não é confiável: precisa ser revalidado. */
export interface SimulationReader {
  findById(id: string): Promise<StoredSimulation | null>;
}
