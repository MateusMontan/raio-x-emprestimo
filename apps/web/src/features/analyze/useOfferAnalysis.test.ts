import { flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import type { OfferAnalysis } from '@raiox/contracts';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { analyzeOffer } from '../../shared/api/client';
import { ApiError } from '../../shared/api/errors';
import { useOfferAnalysis } from './useOfferAnalysis';

vi.mock('../../shared/api/client', () => ({ analyzeOffer: vi.fn() }));

const analisar = vi.mocked(analyzeOffer);

const ANALYSIS = { releasedCents: 500_000 } as unknown as OfferAnalysis;

function problema(status: number, detail: string, errors?: { path: string; message: string }[]) {
  return new ApiError({ type: 'about:blank', title: 'Erro', status, detail, errors });
}

describe('useOfferAnalysis', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    analisar.mockReset();
    analisar.mockResolvedValue(ANALYSIS);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('começa com o exemplo de R$ 5.000,00 recebidos e parcela de R$ 500,00 em 12 meses', () => {
    const oferta = useOfferAnalysis();

    expect(oferta.form.releasedCents).toBe(500_000);
    expect(oferta.form.paymentCents).toBe(50_000);
    expect(oferta.form.installments).toBe(12);
    expect(oferta.form.firstDueDate).toBe('');
    expect(oferta.status.value).toBe('idle');
  });

  it('mostra mensagens pt-BR por campo quando o valor recebido está vazio', async () => {
    const oferta = useOfferAnalysis();
    oferta.form.releasedCents = null;

    await oferta.submit();

    expect(oferta.errors.value.releasedCents).toBe('Informe o valor.');
    expect(analisar).not.toHaveBeenCalled();
  });

  it('analisa com sucesso e guarda o resultado e a entrada validada', async () => {
    const oferta = useOfferAnalysis();

    await oferta.submit();

    expect(oferta.status.value).toBe('success');
    expect(oferta.result.value).toEqual(ANALYSIS);
    expect(oferta.resultInput.value).toMatchObject({ releasedCents: 500_000, installments: 12 });
    expect(oferta.isFresh.value).toBe(true);
  });

  it('leva o erro 422 da API para o campo correspondente', async () => {
    analisar.mockRejectedValue(
      problema(422, 'Confira os campos.', [
        { path: 'installments', message: 'O prazo vai de 1 a 420 meses.' },
      ]),
    );
    const oferta = useOfferAnalysis();

    await oferta.submit();

    expect(oferta.errors.value.installments).toBe('O prazo vai de 1 a 420 meses.');
    expect(oferta.status.value).toBe('error');
    expect(oferta.generalError.value).toBeNull();
  });

  it('mostra o detail do problema como erro geral quando não há campo', async () => {
    analisar.mockRejectedValue(problema(500, 'O servidor caiu.'));
    const oferta = useOfferAnalysis();

    await oferta.submit();

    expect(oferta.generalError.value).toBe('O servidor caiu.');
    expect(oferta.status.value).toBe('error');
  });

  it('recalcula sozinho depois de 400 ms quando a mudança é válida', async () => {
    const oferta = useOfferAnalysis();
    await oferta.submit();
    analisar.mockClear();

    oferta.form.paymentCents = 60_000;
    await nextTick();
    vi.advanceTimersByTime(399);
    expect(analisar).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    await flushPromises();
    expect(analisar).toHaveBeenCalledTimes(1);
    expect(oferta.isFresh.value).toBe(false);
  });
});
