import type { Problem } from '@raiox/contracts';

/** Erro de chamada à API. `problem` é o Problem Details (RFC 9457) já validado. */
export class ApiError extends Error {
  readonly status: number;
  readonly problem: Problem;

  constructor(problem: Problem) {
    super(problem.detail);
    this.name = 'ApiError';
    this.status = problem.status;
    this.problem = problem;
  }

  /** Mensagem por campo, para ligar a cada BaseField. Guarda só a primeira de cada campo. */
  fieldErrors(): Record<string, string> {
    const byField: Record<string, string> = {};
    for (const error of this.problem.errors ?? []) {
      byField[error.path] ??= error.message;
    }
    return byField;
  }
}
