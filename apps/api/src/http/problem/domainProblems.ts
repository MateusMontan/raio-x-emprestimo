import type { FieldError, Problem } from '@raiox/contracts';
import { TAX_POLICIES, type DomainError } from '@raiox/finance';
import { buildProblem } from './problems';

interface DomainMapping {
  readonly status: number;
  readonly title: string;
  /** Texto fixo para o cliente. Sem ele, usa a mensagem do erro de domínio. */
  readonly detail?: string;
  /** Erros por campo, quando o problema aponta um campo da entrada. */
  readonly fieldErrors?: () => readonly FieldError[];
}

/** Erros de domínio que viram resposta do cliente. Os demais (ex.: ID_COLLISION) são 500. */
const CLIENT_ERRORS: Readonly<Record<string, DomainMapping>> = {
  SIMULATION_NOT_FOUND: { status: 404, title: 'Simulação não encontrada' },
  INVALID_INPUT: { status: 422, title: 'Entrada inválida' },
  TAX_POLICY_NOT_FOUND: {
    status: 422,
    title: 'Política de tributos indisponível',
    fieldErrors: () => [
      {
        path: 'contractDate',
        message: `Não há regra de IOF cadastrada para esta data. Use uma data a partir de ${earliestTaxPolicyDate()} ou escolha não calcular o IOF.`,
      },
    ],
  },
  NON_CONVERGENCE: { status: 422, title: 'Cálculo não convergiu' },
  STORED_SIMULATION_INVALID: {
    status: 410,
    title: 'Link indisponível',
    detail:
      'Esta simulação foi salva em um formato que não é mais aceito. Faça uma nova simulação.',
  },
};

/** Primeira data em que há política de IOF cadastrada, em DD/MM/AAAA (menor `validFrom`). */
function earliestTaxPolicyDate(): string {
  const earliest = TAX_POLICIES.map((policy) => policy.validFrom).sort()[0] ?? '';
  const [year = '', month = '', day = ''] = earliest.split('-');
  return `${day}/${month}/${year}`;
}

/** Traduz um erro de domínio para Problem, ou `null` se ele não deve chegar ao cliente. */
export function domainErrorToProblem(error: DomainError): Problem | null {
  const mapping = CLIENT_ERRORS[error.code];
  if (mapping === undefined) return null;
  return buildProblem({
    status: mapping.status,
    slug: error.code.toLowerCase().replaceAll('_', '-'),
    title: mapping.title,
    detail: mapping.detail ?? error.message,
    code: error.code,
    ...(mapping.fieldErrors !== undefined ? { errors: mapping.fieldErrors() } : {}),
  });
}
