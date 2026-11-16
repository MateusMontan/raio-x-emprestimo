import type { Problem } from '@raiox/contracts';

/** Erro HTTP já descrito como Problem Details; o errorHandler devolve o problema tal como está. */
export class ProblemError extends Error {
  constructor(
    readonly problem: Problem,
    readonly headers: Readonly<Record<string, string>> = {},
  ) {
    super(problem.detail);
    this.name = 'ProblemError';
  }
}
