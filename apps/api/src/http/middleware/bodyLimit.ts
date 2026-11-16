import type { MiddlewareHandler } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { problemResponse } from '../problem/problemResponse';
import { payloadTooLargeProblem } from '../problem/problems';

export const MAX_BODY_KILOBYTES = 16;

/** Limita o corpo dos POST a 16 KB. Outros métodos passam direto. */
export function limitPostBody(): MiddlewareHandler {
  const limit = bodyLimit({
    maxSize: MAX_BODY_KILOBYTES * 1024,
    onError: () => problemResponse(payloadTooLargeProblem(MAX_BODY_KILOBYTES)),
  });
  return (c, next) => (c.req.method === 'POST' ? limit(c, next) : next());
}
