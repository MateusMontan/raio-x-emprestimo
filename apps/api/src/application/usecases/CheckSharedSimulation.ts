import { isExpired } from '../dates';
import type { Clock } from '../ports/Clock';
import type { SimulationReader } from '../ports/SimulationReader';

/** Diz se um link compartilhado existe e ainda não expirou, sem recalcular nada. */
export class CheckSharedSimulation {
  constructor(
    private readonly reader: SimulationReader,
    private readonly clock: Clock,
  ) {}

  async execute(id: string): Promise<boolean> {
    const stored = await this.reader.findById(id);
    return stored !== null && !isExpired(stored.expiresAt, this.clock.now());
  }
}
