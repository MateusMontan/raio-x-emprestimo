import { describe, expect, it } from 'vitest';
import { FixedClock } from '../testing/FixedClock';
import { InMemorySimulationRepository } from '../testing/InMemorySimulationRepository';
import { SequenceIdGenerator } from '../testing/SequenceIdGenerator';
import { aSimulationInput } from '../testing/fixtures';
import { CheckSharedSimulation } from './CheckSharedSimulation';
import { PurgeExpiredSimulations } from './PurgeExpiredSimulations';
import { ShareSimulation } from './ShareSimulation';

const DAY_MS = 86_400_000;

describe('PurgeExpiredSimulations', () => {
  it('apaga só as expiradas e devolve a contagem', async () => {
    const repository = new InMemorySimulationRepository();
    const clock = new FixedClock(new Date('2026-01-01T00:00:00.000Z'));
    const share = new ShareSimulation(
      repository,
      new SequenceIdGenerator(['antiga0001', 'recente002']),
      clock,
    );
    await share.execute(aSimulationInput());
    clock.advanceMs(100 * DAY_MS);
    await share.execute(aSimulationInput());
    clock.advanceMs(80 * DAY_MS);

    const deleted = await new PurgeExpiredSimulations(repository, clock).execute();

    expect(deleted).toBe(1);
    expect(repository.size).toBe(1);
    const check = new CheckSharedSimulation(repository, clock);
    expect(await check.execute('antiga0001')).toBe(false);
    expect(await check.execute('recente002')).toBe(true);
  });

  it('devolve zero quando não há nada expirado', async () => {
    const deleted = await new PurgeExpiredSimulations(
      new InMemorySimulationRepository(),
      new FixedClock(new Date('2026-01-01T00:00:00.000Z')),
    ).execute();

    expect(deleted).toBe(0);
  });
});
