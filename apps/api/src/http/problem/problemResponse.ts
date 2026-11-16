import type { Problem } from '@raiox/contracts';
import { PROBLEM_CONTENT_TYPE } from './problems';

/** Resposta `application/problem+json` com o status do próprio problema. */
export function problemResponse(
  problem: Problem,
  headers: Readonly<Record<string, string>> = {},
): Response {
  return new Response(JSON.stringify(problem), {
    status: problem.status,
    headers: { ...headers, 'content-type': PROBLEM_CONTENT_TYPE },
  });
}
