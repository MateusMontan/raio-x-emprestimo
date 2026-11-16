import { flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { simulationInputSchema, type SimulationResult } from '@raiox/contracts';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { calculateSimulation } from '../../shared/api/client';
import { ApiError } from '../../shared/api/errors';
import { useSimulation } from './useSimulation';

vi.mock('../../shared/api/client', () => ({ calculateSimulation: vi.fn() }));

const calculate = vi.mocked(calculateSimulation);

const RESULT = { releasedCents: 1_000_000 } as unknown as SimulationResult;

function problema(status: number, detail: string, errors?: { path: string; message: string }[]) {
  return new ApiError({ type: 'about:blank', title: 'Erro', status, detail, errors });
}

function validInput() {
  return simulationInputSchema.parse({
    amountCents: 1_000_000,
    monthlyRate: 0.02,
    installments: 12,
    system: 'PRICE',
    contractDate: '2026-11-15',
  });
}

describe('useSimulation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    calculate.mockReset();
    calculate.mockResolvedValue(RESULT);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('começa com o exemplo preenchido e a data de hoje', () => {
    const sim = useSimulation();

    expect(sim.form.amountCents).toBe(1_000_000);
    expect(sim.form.monthlyRate).toBe(0.02);
    expect(sim.form.installments).toBe(12);
    expect(sim.form.system).toBe('PRICE');
    expect(sim.form.iofMode).toBe('FINANCED');
    expect(sim.form.contractDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(sim.status.value).toBe('idle');
  });

  it('mostra mensagens pt-BR do contrato por campo quando o campo está vazio', async () => {
    const sim = useSimulation();
    sim.form.amountCents = null;
    sim.form.contractDate = '';

    await sim.submit();

    expect(sim.errors.value.amountCents).toBe('Informe o valor.');
    expect(sim.errors.value.contractDate).toBe('Informe a data.');
    expect(calculate).not.toHaveBeenCalled();
  });

  it('calcula com sucesso e guarda o resultado e a entrada validada', async () => {
    const sim = useSimulation();

    await sim.submit();

    expect(sim.status.value).toBe('success');
    expect(sim.result.value).toEqual(RESULT);
    expect(sim.resultInput.value).toMatchObject({ amountCents: 1_000_000, installments: 12 });
    expect(sim.errors.value).toEqual({});
  });

  it('leva o erro 422 da API para o campo correspondente', async () => {
    calculate.mockRejectedValue(
      problema(422, 'Confira os campos.', [
        { path: 'installments', message: 'O prazo vai de 1 a 420 meses.' },
      ]),
    );
    const sim = useSimulation();

    await sim.submit();

    expect(sim.errors.value.installments).toBe('O prazo vai de 1 a 420 meses.');
    expect(sim.status.value).toBe('error');
    expect(sim.generalError.value).toBeNull();
  });

  it('mostra o detail do problema como erro geral quando não há campo', async () => {
    calculate.mockRejectedValue(problema(500, 'O servidor caiu.'));
    const sim = useSimulation();

    await sim.submit();

    expect(sim.generalError.value).toBe('O servidor caiu.');
    expect(sim.status.value).toBe('error');
  });

  it('recalcula sozinho depois de 400 ms quando a mudança é válida', async () => {
    const sim = useSimulation();
    await sim.submit();
    calculate.mockClear();

    sim.form.monthlyRate = 0.03;
    await nextTick();
    vi.advanceTimersByTime(399);
    expect(calculate).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    await flushPromises();
    expect(calculate).toHaveBeenCalledTimes(1);
  });

  it('marca isFresh como true no clique e false no recálculo automático', async () => {
    const sim = useSimulation();

    await sim.submit();
    expect(sim.isFresh.value).toBe(true);

    sim.form.monthlyRate = 0.03;
    await nextTick();
    vi.advanceTimersByTime(400);
    await flushPromises();

    expect(sim.isFresh.value).toBe(false);
  });

  it('mostra o erro do campo e mantém o último resultado quando a mudança é inválida', async () => {
    const sim = useSimulation();
    await sim.submit();
    calculate.mockClear();

    sim.form.installments = 0;
    await nextTick();
    vi.advanceTimersByTime(400);
    await flushPromises();

    expect(sim.errors.value.installments).toBe('O prazo vai de 1 a 420 meses.');
    expect(calculate).not.toHaveBeenCalled();
    expect(sim.result.value).toEqual(RESULT);
  });

  it('não recalcula antes do primeiro clique em Calcular', async () => {
    const sim = useSimulation();

    sim.form.monthlyRate = 0.03;
    await nextTick();
    vi.advanceTimersByTime(400);
    await flushPromises();

    expect(calculate).not.toHaveBeenCalled();
  });

  it('load preenche o formulário com uma entrada validada', () => {
    const sim = useSimulation();

    sim.load(validInput());

    expect(sim.form.amountCents).toBe(1_000_000);
    expect(sim.form.firstDueDate).toBe('');
    expect(sim.form.contractDate).toBe('2026-11-15');
  });
});
