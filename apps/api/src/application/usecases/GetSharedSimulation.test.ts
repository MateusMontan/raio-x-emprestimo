import { describe, expect, it } from 'vitest';
import { SimulationNotFoundError, StoredSimulationInvalidError } from '../errors';
import { FixedClock } from '../testing/FixedClock';
import { InMemorySimulationRepository } from '../testing/InMemorySimulationRepository';
import { SequenceIdGenerator } from '../testing/SequenceIdGenerator';
import { aSimulationInput } from '../testing/fixtures';
import { CalculateSimulation } from './CalculateSimulation';
import { GetSharedSimulation } from './GetSharedSimulation';
import { ShareSimulation } from './ShareSimulation';

const START = new Date('2026-03-01T12:00:00.000Z');
const DAY_MS = 86_400_000;

describe('GetSharedSimulation', () => {
  it('devolve o mesmo input e um resultado igual ao de CalculateSimulation', async () => {
    const repository = new InMemorySimulationRepository();
    const clock = new FixedClock(START);
    const input = aSimulationInput({
      system: 'SAC',
      feesCents: 15_000,
      firstDueDate: '2026-02-20',
    });
    await new ShareSimulation(repository, new SequenceIdGenerator(['abc123XYZ0']), clock).execute(
      input,
    );

    const shared = await new GetSharedSimulation(repository, clock).execute('abc123XYZ0');

    expect(shared.input).toEqual(input);
    expect(shared.result).toEqual(new CalculateSimulation().execute(input));
    expect(shared.createdAt).toBe('2026-03-01T12:00:00.000Z');
  });

  it('lança SimulationNotFoundError quando o id não existe', async () => {
    const useCase = new GetSharedSimulation(
      new InMemorySimulationRepository(),
      new FixedClock(START),
    );

    await expect(useCase.execute('naoexiste00')).rejects.toBeInstanceOf(SimulationNotFoundError);
  });

  it('lança SimulationNotFoundError quando a simulação já expirou', async () => {
    const repository = new InMemorySimulationRepository();
    const clock = new FixedClock(START);
    await new ShareSimulation(repository, new SequenceIdGenerator(['abc123XYZ0']), clock).execute(
      aSimulationInput(),
    );
    clock.advanceMs(180 * DAY_MS);

    await expect(
      new GetSharedSimulation(repository, clock).execute('abc123XYZ0'),
    ).rejects.toBeInstanceOf(SimulationNotFoundError);
  });

  it('lança StoredSimulationInvalidError quando o input salvo não passa na validação', async () => {
    const repository = new InMemorySimulationRepository();
    repository.seed({
      id: 'corrompido1',
      input: { amountCents: 5 },
      schemaVersion: 1,
      createdAt: '2026-03-01T12:00:00.000Z',
      expiresAt: '2026-08-28T12:00:00.000Z',
    });

    await expect(
      new GetSharedSimulation(repository, new FixedClock(START)).execute('corrompido1'),
    ).rejects.toBeInstanceOf(StoredSimulationInvalidError);
  });
  it('lança StoredSimulationInvalidError quando a versão do esquema gravada não é a 1', async () => {
    const repository = new InMemorySimulationRepository();
    repository.seed({
      id: 'versao0002',
      input: aSimulationInput(),
      schemaVersion: 2,
      createdAt: '2026-03-01T12:00:00.000Z',
      expiresAt: '2026-08-28T12:00:00.000Z',
    });

    await expect(
      new GetSharedSimulation(repository, new FixedClock(START)).execute('versao0002'),
    ).rejects.toBeInstanceOf(StoredSimulationInvalidError);
  });
});
