import { TaxPolicyNotFoundError } from '@raiox/finance';
import { describe, expect, it } from 'vitest';
import { IdCollisionError } from '../errors';
import { FixedClock } from '../testing/FixedClock';
import { InMemorySimulationRepository } from '../testing/InMemorySimulationRepository';
import { SequenceIdGenerator } from '../testing/SequenceIdGenerator';
import { aSimulationInput } from '../testing/fixtures';
import { ShareSimulation } from './ShareSimulation';

const START = new Date('2026-03-01T12:00:00.000Z');
const DAY_MS = 86_400_000;

function setup(ids: readonly string[]) {
  const repository = new InMemorySimulationRepository();
  const clock = new FixedClock(START);
  const useCase = new ShareSimulation(repository, new SequenceIdGenerator(ids), clock);
  return { repository, useCase };
}

function occupy(repository: InMemorySimulationRepository, id: string): void {
  repository.seed({
    id,
    input: aSimulationInput(),
    schemaVersion: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    expiresAt: '2026-06-30T00:00:00.000Z',
  });
}

describe('ShareSimulation', () => {
  it('grava a simulação com validade de 180 dias e versão de esquema 1', async () => {
    const { repository, useCase } = setup(['abc123XYZ0']);

    const shared = await useCase.execute(aSimulationInput());

    expect(shared).toEqual({
      id: 'abc123XYZ0',
      createdAt: '2026-03-01T12:00:00.000Z',
      expiresAt: new Date(START.getTime() + 180 * DAY_MS).toISOString(),
    });
    const stored = await repository.findById('abc123XYZ0');
    expect(stored).toMatchObject({ schemaVersion: 1, input: aSimulationInput() });
  });

  it('gera outro id quando o primeiro já existe', async () => {
    const { repository, useCase } = setup(['ocupado001', 'livre00002']);
    occupy(repository, 'ocupado001');

    const shared = await useCase.execute(aSimulationInput());

    expect(shared.id).toBe('livre00002');
    expect(repository.size).toBe(2);
  });

  it('lança IdCollisionError depois de 3 colisões seguidas, sem gravar nada novo', async () => {
    const { repository, useCase } = setup(['aaaaaaaaaa', 'bbbbbbbbbb', 'cccccccccc', 'dddddddddd']);
    occupy(repository, 'aaaaaaaaaa');
    occupy(repository, 'bbbbbbbbbb');
    occupy(repository, 'cccccccccc');

    await expect(useCase.execute(aSimulationInput())).rejects.toBeInstanceOf(IdCollisionError);
    expect(repository.size).toBe(3);
  });

  it('não grava entrada que o domínio rejeita e deixa o erro de domínio subir', async () => {
    const { repository, useCase } = setup(['abc123XYZ0']);
    const rejected = aSimulationInput({ iofMode: 'FINANCED', contractDate: '2021-06-01' });

    await expect(useCase.execute(rejected)).rejects.toBeInstanceOf(TaxPolicyNotFoundError);
    expect(repository.size).toBe(0);
  });
});
