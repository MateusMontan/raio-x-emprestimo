import { DomainError } from '@raiox/finance';

/** Simulação inexistente ou expirada. */
export class SimulationNotFoundError extends DomainError {
  constructor() {
    super('SIMULATION_NOT_FOUND', 'Simulação não encontrada ou expirada');
  }
}

/** Dados gravados que não passam mais na validação das entradas. */
export class StoredSimulationInvalidError extends DomainError {
  constructor() {
    super('STORED_SIMULATION_INVALID', 'Simulação armazenada é inválida');
  }
}

/** Não foi possível gerar um id livre depois de algumas tentativas. */
export class IdCollisionError extends DomainError {
  constructor(attempts: number) {
    super('ID_COLLISION', `Não foi possível gerar um id único após ${attempts} tentativas`);
  }
}
