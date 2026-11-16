import type { Problem } from '@raiox/contracts';
import type { DomainError } from '@raiox/finance';
import { buildProblem } from './problems';

interface DomainMapping {
  readonly status: number;
  readonly title: string;
}

/** Erros de domínio que viram resposta do cliente. Os demais (ex.: ID_COLLISION) são 500. */
const CLIENT_ERRORS: Readonly<Record<string, DomainMapping>> = {
  SIMULATION_NOT_FOUND: { status: 404, title: 'Simulação não encontrada' },
  INVALID_INPUT: { status: 422, title: 'Entrada inválida' },
  TAX_POLICY_NOT_FOUND: { status: 422, title: 'Política de tributos indisponível' },
  NON_CONVERGENCE: { status: 422, title: 'Cálculo não convergiu' },
};

/** Traduz um erro de domínio para Problem, ou `null` se ele não deve chegar ao cliente. */
export function domainErrorToProblem(error: DomainError): Problem | null {
  const mapping = CLIENT_ERRORS[error.code];
  if (mapping === undefined) return null;
  return buildProblem({
    status: mapping.status,
    slug: error.code.toLowerCase().replaceAll('_', '-'),
    title: mapping.title,
    detail: error.message,
    code: error.code,
  });
}
