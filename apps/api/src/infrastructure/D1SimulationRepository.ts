import type { SimulationInput } from '@raiox/contracts';
import type { SimulationPurger } from '../application/ports/SimulationPurger';
import type { SimulationReader } from '../application/ports/SimulationReader';
import type { SimulationRecord, StoredSimulation } from '../application/ports/types';
import type { SimulationWriter } from '../application/ports/SimulationWriter';

interface SimulationRow {
  id: string;
  input_json: string;
  schema_ver: number;
  created_at: string;
  expires_at: string;
}

const INSERT_SQL = `INSERT INTO shared_simulations (id, input_json, schema_ver, created_at, expires_at)
VALUES (?, ?, ?, ?, ?)
ON CONFLICT(id) DO NOTHING`;

const SELECT_SQL = `SELECT id, input_json, schema_ver, created_at, expires_at
FROM shared_simulations WHERE id = ?`;

const DELETE_EXPIRED_SQL = 'DELETE FROM shared_simulations WHERE expires_at <= ?';

/** Lê o JSON gravado. Corrompido vira `null`, para o caso de uso tratar como inválido. */
function parseInput(raw: string): SimulationInput | null {
  try {
    return JSON.parse(raw) as SimulationInput;
  } catch {
    return null;
  }
}

/** Adapter D1 para as simulações compartilhadas. Usa só prepared statements com bind. */
export class D1SimulationRepository
  implements SimulationWriter, SimulationReader, SimulationPurger
{
  constructor(private readonly db: D1Database) {}

  async save(record: SimulationRecord): Promise<'created' | 'duplicate'> {
    const result = await this.db
      .prepare(INSERT_SQL)
      .bind(
        record.id,
        JSON.stringify(record.input),
        record.schemaVersion,
        record.createdAt,
        record.expiresAt,
      )
      .run();
    return result.meta.changes === 1 ? 'created' : 'duplicate';
  }

  async findById(id: string): Promise<StoredSimulation | null> {
    const row = await this.db.prepare(SELECT_SQL).bind(id).first<SimulationRow>();
    if (!row) return null;
    return {
      id: row.id,
      input: parseInput(row.input_json),
      schemaVersion: row.schema_ver,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
    };
  }

  async deleteExpired(nowIso: string): Promise<number> {
    const result = await this.db.prepare(DELETE_EXPIRED_SQL).bind(nowIso).run();
    return result.meta.changes;
  }
}
