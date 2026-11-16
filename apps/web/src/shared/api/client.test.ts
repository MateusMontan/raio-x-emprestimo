import type { SimulationResult, SimulationRequest } from '@raiox/contracts';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { calculateSimulation } from './client';
import { ApiError } from './errors';

const REQUISICAO = {
  amountCents: 1_000_000,
  monthlyRate: 0.0292,
  installments: 12,
  system: 'price',
  contractDate: '2026-11-15',
} as unknown as SimulationRequest;

const RESULT = { totals: { paidCents: 1_100_000 } } as unknown as SimulationResult;

function responseJson(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('cliente da API', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it('envia o cálculo em JSON para a rota v1 e devolve o resultado', async () => {
    fetchMock.mockResolvedValue(responseJson(RESULT));

    const resultado = await calculateSimulation(REQUISICAO);

    expect(resultado).toEqual(RESULT);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/simulations/calculate',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(REQUISICAO) }),
    );
  });

  it('expõe os erros de campo de um Problem com errors[]', async () => {
    fetchMock.mockResolvedValue(
      responseJson(
        {
          type: 'about:blank',
          title: 'Dados inválidos',
          status: 422,
          detail: 'Confira os campos.',
          errors: [
            { path: 'installments', message: 'O prazo vai de 1 a 420 meses.' },
            { path: 'installments', message: 'Mensagem repetida, ignorada.' },
            { path: 'monthlyRate', message: 'A taxa mensal vai até 30%.' },
          ],
        },
        422,
      ),
    );

    const erro = await calculateSimulation(REQUISICAO).catch((e: unknown) => e);

    expect(erro).toBeInstanceOf(ApiError);
    expect(erro).toMatchObject({ status: 422, message: 'Confira os campos.' });
    expect((erro as ApiError).fieldErrors()).toEqual({
      installments: 'O prazo vai de 1 a 420 meses.',
      monthlyRate: 'A taxa mensal vai até 30%.',
    });
  });

  it('usa um erro genérico em pt-BR quando a resposta não é JSON', async () => {
    fetchMock.mockResolvedValue(new Response('<html>Bad Gateway</html>', { status: 502 }));

    const erro = await calculateSimulation(REQUISICAO).catch((e: unknown) => e);

    expect(erro).toBeInstanceOf(ApiError);
    expect(erro).toMatchObject({ status: 502 });
    expect((erro as ApiError).message).toBe(
      'O servidor não conseguiu responder. Tente de novo em instantes.',
    );
    expect((erro as ApiError).fieldErrors()).toEqual({});
  });

  it('usa o erro genérico quando o JSON de erro não é um Problem', async () => {
    fetchMock.mockResolvedValue(responseJson({ outra: 'coisa' }, 404));

    const erro = await calculateSimulation(REQUISICAO).catch((e: unknown) => e);

    expect((erro as ApiError).message).toBe('Não encontramos o que você procurou.');
  });

  it('avisa que não conectou quando a rede falha', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    const erro = await calculateSimulation(REQUISICAO).catch((e: unknown) => e);

    expect(erro).toBeInstanceOf(ApiError);
    expect(erro).toMatchObject({
      status: 0,
      message: 'Não foi possível conectar. Confira sua internet e tente de novo.',
    });
  });

  it('repassa o cancelamento sem transformar em erro de rede', async () => {
    const cancellation = new DOMException('Abortado', 'AbortError');
    fetchMock.mockRejectedValue(cancellation);

    const erro = await calculateSimulation(REQUISICAO).catch((e: unknown) => e);

    expect(erro).toBe(cancellation);
  });
});
