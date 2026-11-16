import type { FieldError, Problem } from '@raiox/contracts';

export const PROBLEM_CONTENT_TYPE = 'application/problem+json';

interface ProblemInit {
  readonly status: number;
  readonly slug: string;
  readonly title: string;
  readonly detail: string;
  readonly code?: string;
  readonly errors?: readonly FieldError[];
}

/** Monta um Problem Details (RFC 9457) com `type` no formato urn:raiox:problem:<slug>. */
export function buildProblem(init: ProblemInit): Problem {
  return {
    type: `urn:raiox:problem:${init.slug}`,
    title: init.title,
    status: init.status,
    detail: init.detail,
    ...(init.code !== undefined ? { code: init.code } : {}),
    ...(init.errors !== undefined ? { errors: [...init.errors] } : {}),
  };
}

export function validationProblem(errors: readonly FieldError[]): Problem {
  return buildProblem({
    status: 422,
    slug: 'validation',
    title: 'Dados inválidos',
    detail: 'Um ou mais campos não passaram na validação.',
    errors,
  });
}

export function malformedJsonProblem(): Problem {
  return buildProblem({
    status: 400,
    slug: 'malformed-json',
    title: 'Requisição malformada',
    detail: 'O corpo da requisição não é um JSON válido.',
  });
}

export function payloadTooLargeProblem(maxKilobytes: number): Problem {
  return buildProblem({
    status: 413,
    slug: 'payload-too-large',
    title: 'Corpo muito grande',
    detail: `O corpo da requisição passa do limite de ${maxKilobytes} KB.`,
  });
}

export function routeNotFoundProblem(): Problem {
  return buildProblem({
    status: 404,
    slug: 'route-not-found',
    title: 'Rota não encontrada',
    detail: 'Nenhuma rota da API corresponde a esta requisição.',
  });
}

export function rateLimitedProblem(): Problem {
  return buildProblem({
    status: 429,
    slug: 'rate-limited',
    title: 'Muitas requisições',
    detail:
      'Você compartilhou simulações demais em pouco tempo. Aguarde um minuto e tente de novo.',
  });
}

export function internalErrorProblem(): Problem {
  return buildProblem({
    status: 500,
    slug: 'internal-error',
    title: 'Erro interno',
    detail: 'Não foi possível concluir a requisição. Tente novamente mais tarde.',
  });
}

export function httpErrorProblem(status: number): Problem {
  return buildProblem({
    status,
    slug: 'http-error',
    title: 'Requisição inválida',
    detail: 'Não foi possível processar a requisição.',
  });
}
