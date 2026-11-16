import { ApiError } from './errors';
import { responseProblem, genericProblem, problemWithoutConnection } from './problems';

const BASE_API = '/api/v1';

export interface RequestOptions {
  method: 'GET' | 'POST';
  body?: unknown;
  signal?: AbortSignal | undefined;
}

type Body = { ok: true; value: unknown } | { ok: false };

/** Chamada JSON à API. Erro HTTP, rede e corpo inválido viram ApiError. */
export async function apiRequest<T>(path: string, options: RequestOptions): Promise<T> {
  const response = await send(path, options);
  const body = await readJson(response);
  if (!response.ok) {
    throw new ApiError(responseProblem(response.status, body.ok ? body.value : undefined));
  }
  if (!body.ok) {
    throw new ApiError(genericProblem(response.status));
  }
  return body.value as T;
}

async function send(path: string, options: RequestOptions): Promise<Response> {
  const init: RequestInit = {
    method: options.method,
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: options.body === undefined ? null : JSON.stringify(options.body),
    signal: options.signal ?? null,
  };
  try {
    return await fetch(`${BASE_API}${path}`, init);
  } catch (error) {
    if (isCancellation(error)) throw error;
    throw new ApiError(problemWithoutConnection());
  }
}

async function readJson(response: Response): Promise<Body> {
  try {
    return { ok: true, value: (await response.json()) as unknown };
  } catch {
    return { ok: false };
  }
}

function isCancellation(error: unknown): boolean {
  return (
    typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError'
  );
}
