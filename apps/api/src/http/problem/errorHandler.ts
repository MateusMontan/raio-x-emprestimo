import { HTTPException } from 'hono/http-exception';
import { DomainError } from '@raiox/finance';
import { domainErrorToProblem } from './domainProblems';
import { ProblemError } from './ProblemError';
import { problemResponse } from './problemResponse';
import { httpErrorProblem, internalErrorProblem, malformedJsonProblem } from './problems';

/** Converte qualquer erro lançado na API em `application/problem+json`. Nunca vaza a mensagem de erros inesperados. */
export function handleError(error: Error): Response {
  if (error instanceof ProblemError) {
    return problemResponse(error.problem, error.headers);
  }
  if (error instanceof HTTPException) {
    if (error.status === 400) return problemResponse(malformedJsonProblem());
    return problemResponse(httpErrorProblem(error.status));
  }
  if (error instanceof DomainError) {
    const problem = domainErrorToProblem(error);
    if (problem !== null) return problemResponse(problem);
  }
  console.error('[api] erro não tratado', error);
  return problemResponse(internalErrorProblem());
}
