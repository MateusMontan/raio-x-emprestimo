import { DomainError } from '@raiox/finance';
import { describe, expect, it } from 'vitest';
import { IdCollisionError, SimulationNotFoundError, StoredSimulationInvalidError } from './errors';

describe('erros da aplicação', () => {
  it('são erros de domínio com código estável', () => {
    const notFound = new SimulationNotFoundError();
    const invalid = new StoredSimulationInvalidError();
    const collision = new IdCollisionError(3);

    expect(notFound).toBeInstanceOf(DomainError);
    expect(notFound.code).toBe('SIMULATION_NOT_FOUND');
    expect(invalid.code).toBe('STORED_SIMULATION_INVALID');
    expect(collision.code).toBe('ID_COLLISION');
  });

  it('informam o nome da classe e a quantidade de tentativas na colisão', () => {
    expect(new IdCollisionError(3).name).toBe('IdCollisionError');
    expect(new IdCollisionError(3).message).toContain('3 tentativas');
  });
});
