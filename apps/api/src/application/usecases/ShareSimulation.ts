import type { SimulationInput } from '@raiox/contracts';
import { SHARE_TTL_DAYS } from '@raiox/contracts';
import { simulateLoan } from '@raiox/finance';
import { IdCollisionError } from '../errors';
import { addDays } from '../dates';
import { toLoanInput } from '../mappers';
import type { Clock } from '../ports/Clock';
import type { IdGenerator } from '../ports/IdGenerator';
import type { SimulationWriter } from '../ports/SimulationWriter';
import type { ShareResult } from './types';

const MAX_ATTEMPTS = 3;
const SCHEMA_VERSION = 1;

/** F4: valida a entrada pelo domínio e grava só as entradas, com validade de 180 dias. */
export class ShareSimulation {
  constructor(
    private readonly writer: SimulationWriter,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(input: SimulationInput): Promise<ShareResult> {
    // Entrada que o domínio rejeita não é gravada: o erro de domínio sobe daqui.
    simulateLoan(toLoanInput(input));

    const createdAt = this.clock.now();
    const expiresAt = addDays(createdAt, SHARE_TTL_DAYS);
    const createdIso = createdAt.toISOString();
    const expiresIso = expiresAt.toISOString();

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      const id = this.ids.next();
      const outcome = await this.writer.save({
        id,
        input,
        schemaVersion: SCHEMA_VERSION,
        createdAt: createdIso,
        expiresAt: expiresIso,
      });
      if (outcome === 'created') {
        return { id, createdAt: createdIso, expiresAt: expiresIso };
      }
    }

    throw new IdCollisionError(MAX_ATTEMPTS);
  }
}
