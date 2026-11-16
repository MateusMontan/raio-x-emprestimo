import { problemSchema, type Problem } from '@raiox/contracts';

export const MENSAGEM_SEM_CONEXAO =
  'Não foi possível conectar. Confira sua internet e tente de novo.';

const MENSAGEM_POR_STATUS: readonly (readonly [number, string])[] = [
  [400, 'Confira os campos destacados e tente de novo.'],
  [413, 'Os dados enviados são grandes demais.'],
  [404, 'Não encontramos o que você procurou.'],
  [429, 'Muitas tentativas seguidas. Espere um pouco e tente de novo.'],
];

function mensagemDoStatus(status: number): string {
  if (status >= 500) return 'O servidor não conseguiu responder. Tente de novo em instantes.';
  if (status === 422) return 'Confira os campos destacados e tente de novo.';
  return (
    MENSAGEM_POR_STATUS.find(([codigo]) => codigo === status)?.[1] ??
    'Algo deu errado. Tente de novo.'
  );
}

/** Problem genérico, em pt-BR, para respostas que não trouxeram um Problem válido. */
export function problemaGenerico(status: number): Problem {
  const detalhe = mensagemDoStatus(status);
  return { type: 'about:blank', title: 'Erro', status, detail: detalhe };
}

export function problemaSemConexao(): Problem {
  return { type: 'about:blank', title: 'Sem conexão', status: 0, detail: MENSAGEM_SEM_CONEXAO };
}

/** Usa o Problem da API se ele for válido; senão, o genérico do status. */
export function problemaDeResposta(status: number, corpo: unknown): Problem {
  const lido = problemSchema.safeParse(corpo);
  return lido.success ? lido.data : problemaGenerico(status);
}
