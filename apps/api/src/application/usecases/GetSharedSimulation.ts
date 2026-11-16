import { simulationInputSchema } from '@raiox/contracts';
import { simulateLoan } from '@raiox/finance';
import { isExpired } from '../dates';
import { SimulationNotFoundError, StoredSimulationInvalidError } from '../errors';
import { toLoanInput } from '../mappers';
import type { Clock } from '../ports/Clock';
import type { SimulationReader } from '../ports/SimulationReader';
import type { SharedSimulation } from './types';

/** Versão do formato gravado que este código sabe ler. */
const SUPPORTED_SCHEMA_VERSION = 1;

/** F4: lê uma simulação compartilhada, revalida as entradas e recalcula o resultado. */
export class GetSharedSimulation {
  constructor(
    private readonly reader: SimulationReader,
    private readonly clock: Clock,
  ) {}

  async execute(id: string): Promise<SharedSimulation> {
    const stored = await this.reader.findById(id);
    if (stored === null || isExpired(stored.expiresAt, this.clock.now())) {
      throw new SimulationNotFoundError();
    }

    // O que vem do banco não é confiável: versão e entrada precisam passar de novo.
    if (stored.schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
      throw new StoredSimulationInvalidError();
    }
    const parsed = simulationInputSchema.safeParse(stored.input);
    if (!parsed.success) {
      throw new StoredSimulationInvalidError();
    }

    const input = parsed.data;
    return {
      id: stored.id,
      createdAt: stored.createdAt,
      expiresAt: stored.expiresAt,
      input,
      result: simulateLoan(toLoanInput(input)),
    };
  }
}
