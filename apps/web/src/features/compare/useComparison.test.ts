import { offerInputSchema, simulationInputSchema } from '@raiox/contracts';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useComparison } from './useComparison';

const simulacao = simulationInputSchema.parse({
  amountCents: 2_500_000,
  monthlyRate: 0.03,
  installments: 24,
  system: 'SAC',
  contractDate: '2026-11-15',
});

const oferta = offerInputSchema.parse({
  releasedCents: 500_000,
  paymentCents: 50_000,
  installments: 12,
  contractDate: '2026-11-15',
});

const STORAGE_KEY = 'raiox:comparison';

describe('useComparison', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    useComparison().clear();
  });

  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('limita a comparação a três cenários', () => {
    const { add, scenarios } = useComparison();

    expect(add({ kind: 'offer', input: oferta })).toBe(true);
    expect(add({ kind: 'offer', input: oferta })).toBe(true);
    expect(add({ kind: 'simulation', input: simulacao })).toBe(true);
    expect(add({ kind: 'offer', input: oferta })).toBe(false);
    expect(scenarios.value).toHaveLength(3);
  });

  it('nomeia os cenários como Oferta 1, 2 e 3, sem repetir rótulos', () => {
    const { add, remove, scenarios } = useComparison();
    add({ kind: 'offer', input: oferta });
    add({ kind: 'offer', input: oferta });
    const first = scenarios.value[0];
    if (first === undefined) throw new Error('sem cenário');
    remove(first.id);
    add({ kind: 'offer', input: oferta });

    expect(scenarios.value.map((scenario) => scenario.label)).toEqual(['Oferta 2', 'Oferta 1']);
  });

  it('salva a comparação no sessionStorage e a recarrega', async () => {
    useComparison().add({ kind: 'simulation', input: simulacao });
    const salvo = window.sessionStorage.getItem(STORAGE_KEY);
    expect(salvo).not.toBeNull();

    vi.resetModules();
    const { useComparison: recarregado } = await import('./useComparison');
    expect(recarregado().scenarios.value).toHaveLength(1);
    expect(recarregado().scenarios.value[0]?.kind).toBe('simulation');
  });

  it('descarta do sessionStorage os itens que não passam na validação', async () => {
    const valid = { id: 'a', label: 'Oferta 1', kind: 'offer', input: oferta };
    const invalido = { id: 'b', label: 'Oferta 2', kind: 'offer', input: { releasedCents: 'x' } };
    const desconhecido = { id: 'c', label: 'Oferta 3', kind: 'loan', input: oferta };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify([valid, invalido, desconhecido]));

    vi.resetModules();
    const { useComparison: recarregado } = await import('./useComparison');

    expect(recarregado().scenarios.value.map((scenario) => scenario.id)).toEqual(['a']);
  });

  it('ignora um sessionStorage com JSON inválido', async () => {
    window.sessionStorage.setItem(STORAGE_KEY, '{quebrado');

    vi.resetModules();
    const { useComparison: recarregado } = await import('./useComparison');

    expect(recarregado().scenarios.value).toEqual([]);
  });

  it('segue funcionando quando o sessionStorage está indisponível', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    const { add, scenarios } = useComparison();

    expect(add({ kind: 'offer', input: oferta })).toBe(true);
    expect(scenarios.value).toHaveLength(1);
  });

  it('renomeia um cenário e ignora nome vazio', () => {
    const { add, rename, scenarios } = useComparison();
    add({ kind: 'offer', input: oferta });
    const scenario = scenarios.value[0];
    if (scenario === undefined) throw new Error('sem cenário');

    rename(scenario.id, '  Banco Sul  ');
    rename(scenario.id, '   ');

    expect(scenarios.value[0]?.label).toBe('Banco Sul');
  });

  it('remove apenas o cenário pedido', () => {
    const { add, remove, scenarios } = useComparison();
    add({ kind: 'offer', input: oferta });
    add({ kind: 'offer', input: oferta });
    const [first, segundo] = scenarios.value;
    if (first === undefined || segundo === undefined) throw new Error('faltam cenários');

    remove(first.id);

    expect(scenarios.value.map((scenario) => scenario.id)).toEqual([segundo.id]);
  });
});
