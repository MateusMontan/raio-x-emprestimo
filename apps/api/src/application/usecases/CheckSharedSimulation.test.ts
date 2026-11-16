import { describe, expect, it } from 'vitest';
import { SimulationNotFoundError } from '../errors';
import { FixedClock } from '../testing/FixedClock';
import { InMemorySimulationRepository } from '../testing/InMemorySimulationRepository';
import { SequenceIdGenerator } from '../testing/SequenceIdGenerator';
import { aSimulationInput } from '../testing/fixtures';
import { CheckSharedSimulation } from './CheckSharedSimulation';
import { GetSharedSimulation } from './GetSharedSimulation';
import { ShareSimulation } from './ShareSimulation';

const START = new Date('2026-03-01T12:00:00.000Z');
const DAY_MS = 86_400_000;
const TTL_MS = 180 * DAY_MS;

async function shareOne() {
  const repository = new InMemorySimulationRepository();
  const clock = new FixedClock(START);
  await new ShareSimulation(repository, new SequenceIdGenerator(['abc123XYZ0']), clock).execute(
    aSimulationInput(),
  );
  return { repository, clock, check: new CheckSharedSimulation(repository, clock) };
}

describe('CheckSharedSimulation', () => {
  it('devolve true quando a simulação existe e não expirou', async () => {
    const { check } = await shareOne();

    expect(await check.execute('abc123XYZ0')).toBe(true);
  });

  it('devolve false quando a simulação não existe', async () => {
    const { check } = await shareOne();

    expect(await check.execute('naoexiste00')).toBe(false);
  });

  it('devolve false quando a simulação expirou', async () => {
    const { check, clock } = await shareOne();
    clock.advanceMs(TTL_MS);

    expect(await check.execute('abc123XYZ0')).toBe(false);
  });

  it('expira exatamente em 180 dias: 1 ms antes existe, no instante exato já não', async () => {
    const { repository, clock, check } = await shareOne();
    const get = new GetSharedSimulation(repository, clock);

    clock.advanceMs(TTL_MS - 1);
    expect(await check.execute('abc123XYZ0')).toBe(true);
    await expect(get.execute('abc123XYZ0')).resolves.toBeDefined();

    clock.advanceMs(1);
    expect(await check.execute('abc123XYZ0')).toBe(false);
    await expect(get.execute('abc123XYZ0')).rejects.toBeInstanceOf(SimulationNotFoundError);
  });
});
