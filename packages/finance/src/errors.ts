/** Base class for domain errors. `code` is stable and safe to expose to clients. */
export class DomainError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = new.target.name;
    this.code = code;
  }
}

/** Entrada que viola uma pré-condição do domínio (ex.: parcelas não inteiras). */
export class InvalidInputError extends DomainError {
  constructor(message: string) {
    super('INVALID_INPUT', message);
  }
}

/** Solver numérico não encontrou raiz dentro da tolerância. */
export class NonConvergenceError extends DomainError {
  constructor(message: string) {
    super('NON_CONVERGENCE', message);
  }
}
