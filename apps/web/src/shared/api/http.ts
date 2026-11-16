import { ApiError } from './errors';
import { problemaDeResposta, problemaGenerico, problemaSemConexao } from './problems';

const BASE_API = '/api/v1';

export interface RequestOptions {
  method: 'GET' | 'POST';
  body?: unknown;
  signal?: AbortSignal | undefined;
}

type Corpo = { ok: true; valor: unknown } | { ok: false };

/** Chamada JSON à API. Erro HTTP, rede e corpo inválido viram ApiError. */
export async function apiRequest<T>(caminho: string, opcoes: RequestOptions): Promise<T> {
  const resposta = await enviar(caminho, opcoes);
  const corpo = await lerJson(resposta);
  if (!resposta.ok) {
    throw new ApiError(problemaDeResposta(resposta.status, corpo.ok ? corpo.valor : undefined));
  }
  if (!corpo.ok) {
    throw new ApiError(problemaGenerico(resposta.status));
  }
  return corpo.valor as T;
}

async function enviar(caminho: string, opcoes: RequestOptions): Promise<Response> {
  const init: RequestInit = {
    method: opcoes.method,
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: opcoes.body === undefined ? null : JSON.stringify(opcoes.body),
    signal: opcoes.signal ?? null,
  };
  try {
    return await fetch(`${BASE_API}${caminho}`, init);
  } catch (erro) {
    if (ehCancelamento(erro)) throw erro;
    throw new ApiError(problemaSemConexao());
  }
}

async function lerJson(resposta: Response): Promise<Corpo> {
  try {
    return { ok: true, valor: (await resposta.json()) as unknown };
  } catch {
    return { ok: false };
  }
}

function ehCancelamento(erro: unknown): boolean {
  return typeof erro === 'object' && erro !== null && 'name' in erro && erro.name === 'AbortError';
}
