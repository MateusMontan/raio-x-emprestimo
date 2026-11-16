import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PurgeExpiredSimulations } from '../application';
import { FixedClock } from '../application/testing/FixedClock';
import { InMemorySimulationRepository } from '../application/testing/InMemorySimulationRepository';
import { purgeOnSchedule } from './purgeOnSchedule';

describe('purgeOnSchedule (Cron de limpeza)', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('roda o caso de uso de limpeza, remove só os expirados e registra a contagem', async () => {
    const repositorio = new InMemorySimulationRepository();
    const expiraEm = (id: string, expiresAt: string) =>
      repositorio.save({
        id,
        input: {} as never,
        schemaVersion: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        expiresAt,
      });
    await expiraEm('vencida0001', '2026-06-01T00:00:00.000Z');
    await expiraEm('valida00002', '2027-06-01T00:00:00.000Z');
    const relogio = new FixedClock(new Date('2026-11-15T04:17:00.000Z'));

    const removidas = await purgeOnSchedule(new PurgeExpiredSimulations(repositorio, relogio));

    expect(removidas).toBe(1);
    expect(repositorio.size).toBe(1);
    expect(console.log).toHaveBeenCalledWith('[cron] simulações expiradas removidas: 1');
  });

  it('registra zero quando nada expirou', async () => {
    const purger = { execute: () => Promise.resolve(0) };

    expect(await purgeOnSchedule(purger)).toBe(0);
    expect(console.log).toHaveBeenCalledWith('[cron] simulações expiradas removidas: 0');
  });
});
