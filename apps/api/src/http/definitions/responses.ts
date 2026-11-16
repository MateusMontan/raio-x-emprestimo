import { problemSchema } from '@raiox/contracts';

/** Resposta documentada no OpenAPI com o schema de Problem Details. */
export function problemDoc(description: string) {
  return {
    description,
    content: { 'application/problem+json': { schema: problemSchema } },
  };
}

/** Erros comuns às rotas que recebem corpo JSON. */
export const BODY_ERRORS = {
  400: problemDoc('JSON malformado no corpo da requisição'),
  413: problemDoc('Corpo maior que 16 KB'),
  422: problemDoc('Dados inválidos; `errors[]` aponta o campo e a mensagem em pt-BR'),
  500: problemDoc('Erro interno (a mensagem original não é exposta)'),
} as const;
