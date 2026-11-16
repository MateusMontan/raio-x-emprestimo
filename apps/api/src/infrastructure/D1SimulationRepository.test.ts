import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Miniflare } from 'miniflare';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { D1SimulationRepository } from './D1SimulationRepository';
import type { SimulationRecord } from '../application/ports/types';
import type { SimulationInput } from '@raiox/contracts';

const MIGRATION_PATH = fileURLToPath(
  new URL('../../migrations/0001_create_shared_simulations.sql', import.meta.url),
);

const input = {
  amount: 50000,
  termMonths: 36,
  monthlyRate: 0.0199,
} as unknown as SimulationInput;

function recordOf(id: string, expiresAt = '2026-12-01T00:00:00.000Z'): SimulationRecord {
  return {
    id,
    input,
    schemaVersion: 1,
    createdAt: '2026-11-01T00:00:00.000Z',
    expiresAt,
  };
}

describe('D1SimulationRepository (D1 real via miniflare)', () => {
  let mf: Miniflare;
  let db: D1Database;

  beforeAll(async () => {
    mf = new Miniflare({
      modules: true,
      script: 'export default { fetch() { return new Response(null); } }',
      d1Databases: { DB: 'test' },
    });
    db = await mf.getD1Database('DB');
    const sql = readFileSync(MIGRATION_PATH, 'utf8');
    for (const stmt of sql
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)) {
      await db.prepare(stmt).run();
    }
  }, 30_000);

  afterAll(async () => {
    await mf.dispose();
  });

  beforeEach(async () => {
    await db.prepare('DELETE FROM shared_simulations').run();
  });

  it('salva e lê de volta o mesmo input', async () => {
    const repo = new D1SimulationRepository(db);
    expect(await repo.save(recordOf('abc123XYZ0'))).toBe('created');

    const stored = await repo.findById('abc123XYZ0');
    expect(stored).toEqual({
      id: 'abc123XYZ0',
      input,
      schemaVersion: 1,
      createdAt: '2026-11-01T00:00:00.000Z',
      expiresAt: '2026-12-01T00:00:00.000Z',
    });
  });

  it('responde duplicate para id repetido e mantém o registro original', async () => {
    const repo = new D1SimulationRepository(db);
    await repo.save(recordOf('dupId00001', '2026-12-01T00:00:00.000Z'));

    const second = await repo.save(recordOf('dupId00001', '2030-01-01T00:00:00.000Z'));
    expect(second).toBe('duplicate');

    const stored = await repo.findById('dupId00001');
    expect(stored?.expiresAt).toBe('2026-12-01T00:00:00.000Z');
  });

  it('devolve null para id inexistente', async () => {
    const repo = new D1SimulationRepository(db);
    expect(await repo.findById('naoExiste01')).toBeNull();
  });

  it('devolve input null quando o JSON gravado está corrompido', async () => {
    await db
      .prepare(
        'INSERT INTO shared_simulations (id, input_json, schema_ver, created_at, expires_at) VALUES (?, ?, ?, ?, ?)',
      )
      .bind('corrupt001', '{not json', 1, '2026-11-01T00:00:00.000Z', '2026-12-01T00:00:00.000Z')
      .run();

    const stored = await new D1SimulationRepository(db).findById('corrupt001');
    expect(stored).not.toBeNull();
    expect(stored?.input).toBeNull();
  });

  it('deleteExpired apaga só os vencidos até o instante e devolve a contagem', async () => {
    const repo = new D1SimulationRepository(db);
    await repo.save(recordOf('expired001', '2026-11-10T00:00:00.000Z'));
    await repo.save(recordOf('expired002', '2026-11-15T00:00:00.000Z'));
    await repo.save(recordOf('alive00001', '2026-12-01T00:00:00.000Z'));

    const removed = await repo.deleteExpired('2026-11-15T00:00:00.000Z');

    expect(removed).toBe(2);
    expect(await repo.findById('expired001')).toBeNull();
    expect(await repo.findById('expired002')).toBeNull();
    expect(await repo.findById('alive00001')).not.toBeNull();
  });

  it('não devolve registros para um id malicioso de SQL injection', async () => {
    const repo = new D1SimulationRepository(db);
    await repo.save(recordOf('realId0001'));

    await expect(repo.findById("x' OR '1'='1")).resolves.toBeNull();
    expect(await repo.findById('realId0001')).not.toBeNull();
  });
});
