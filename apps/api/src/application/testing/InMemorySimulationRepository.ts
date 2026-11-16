import type { SimulationPurger } from '../ports/SimulationPurger';
import type { SimulationReader } from '../ports/SimulationReader';
import type { SimulationWriter } from '../ports/SimulationWriter';
import type { SimulationRecord, StoredSimulation } from '../ports/types';

/** Repositório em memória para testes: implementa leitura, escrita e limpeza. */
export class InMemorySimulationRepository
  implements SimulationReader, SimulationWriter, SimulationPurger
{
  private readonly records = new Map<string, StoredSimulation>();

  save(record: SimulationRecord): Promise<'created' | 'duplicate'> {
    if (this.records.has(record.id)) {
      return Promise.resolve('duplicate');
    }
    this.records.set(record.id, { ...record });
    return Promise.resolve('created');
  }

  findById(id: string): Promise<StoredSimulation | null> {
    const record = this.records.get(id);
    return Promise.resolve(record === undefined ? null : { ...record });
  }

  deleteExpired(nowIso: string): Promise<number> {
    let deleted = 0;
    for (const [id, record] of this.records) {
      if (record.expiresAt <= nowIso) {
        this.records.delete(id);
        deleted += 1;
      }
    }
    return Promise.resolve(deleted);
  }

  /** Grava um registro cru (ex.: com input inválido), como se viesse de um banco antigo. */
  seed(record: StoredSimulation): void {
    this.records.set(record.id, { ...record });
  }

  get size(): number {
    return this.records.size;
  }
}
