import { reactive, watch, type ComputedRef } from 'vue';
import { ApiError } from '../../shared/api/errors';
import { analyzeOffer, calculateSimulation } from '../../shared/api/client';
import type { Scenario } from './scenario';
import { fromOffer, fromSimulation, type ComparedResult } from './normalizeResult';

export type ScenarioState =
  | { status: 'loading' }
  | { status: 'ready'; result: ComparedResult }
  | { status: 'error'; message: string };

const MENSAGEM_GENERICA = 'Não foi possível calcular esta oferta.';

async function fetchScenario(cenario: Scenario): Promise<ComparedResult> {
  if (cenario.kind === 'simulation') {
    return fromSimulation(cenario.input, await calculateSimulation(cenario.input));
  }
  return fromOffer(await analyzeOffer(cenario.input));
}

function messageOf(erro: unknown): string {
  return erro instanceof ApiError ? erro.problem.detail : MENSAGEM_GENERICA;
}

/**
 * Busca o resultado de cada cenário da lista. Cenários removidos saem do estado;
 * novos disparam uma busca. Um erro fica restrito à própria coluna.
 */
export function useScenarioResults(scenarios: ComputedRef<readonly Scenario[]>) {
  const states = reactive<Record<string, ScenarioState>>({});

  async function load(cenario: Scenario): Promise<void> {
    states[cenario.id] = { status: 'loading' };
    try {
      const result = await fetchScenario(cenario);
      if (cenario.id in states) states[cenario.id] = { status: 'ready', result };
    } catch (erro) {
      if (cenario.id in states) states[cenario.id] = { status: 'error', message: messageOf(erro) };
    }
  }

  watch(
    scenarios,
    (lista) => {
      const ids = new Set(lista.map((cenario) => cenario.id));
      for (const id of Object.keys(states)) {
        if (!ids.has(id)) Reflect.deleteProperty(states, id);
      }
      for (const cenario of lista) {
        if (!(cenario.id in states)) void load(cenario);
      }
    },
    { immediate: true },
  );

  function retry(id: string): void {
    const cenario = scenarios.value.find((item) => item.id === id);
    if (cenario) void load(cenario);
  }

  return { states, retry };
}
