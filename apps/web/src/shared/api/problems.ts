import { problemSchema, type Problem } from '@raiox/contracts';

export const NO_CONNECTION_MESSAGE =
  'Não foi possível conectar. Confira sua internet e tente de novo.';

const STATUS_MESSAGES: readonly (readonly [number, string])[] = [
  [400, 'Confira os campos destacados e tente de novo.'],
  [413, 'Os dados enviados são grandes demais.'],
  [404, 'Não encontramos o que você procurou.'],
  [429, 'Muitas tentativas seguidas. Espere um pouco e tente de novo.'],
];

function statusMessage(status: number): string {
  if (status >= 500) return 'O servidor não conseguiu responder. Tente de novo em instantes.';
  if (status === 422) return 'Confira os campos destacados e tente de novo.';
  return (
    STATUS_MESSAGES.find(([codigo]) => codigo === status)?.[1] ?? 'Algo deu errado. Tente de novo.'
  );
}

/** Problem genérico, em pt-BR, para respostas que não trouxeram um Problem válido. */
export function genericProblem(status: number): Problem {
  const detail = statusMessage(status);
  return { type: 'about:blank', title: 'Erro', status, detail: detail };
}

export function problemWithoutConnection(): Problem {
  return { type: 'about:blank', title: 'Sem conexão', status: 0, detail: NO_CONNECTION_MESSAGE };
}

/** Usa o Problem da API se ele for válido; senão, o genérico do status. */
export function responseProblem(status: number, body: unknown): Problem {
  const parsed = problemSchema.safeParse(body);
  return parsed.success ? parsed.data : genericProblem(status);
}
