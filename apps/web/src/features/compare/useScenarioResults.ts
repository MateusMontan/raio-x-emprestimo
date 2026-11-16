import { reactive, watch, type ComputedRef } from 'vue';
import { ApiError } from '../../shared/api/errors';
import { analyzeOffer, calculateSimulation } from '../../shared/api/client';
import type { Scenario } from './scenario';
import { fromOffer, fromSimulation, type ComparedResult } from './normalizeResult';

export type ScenarioState =
  | { status: 'loading' }
  | { status: 'ready'; result: ComparedResult }
  | { status: 'error'; message: string };

const GENERIC_MESSAGE = 'Não foi possível calcular esta oferta.';

async function fetchScenario(scenario: Scenario): Promise<ComparedResult> {
  if (scenario.kind === 'simulation') {
    return fromSimulation(scenario.input, await calculateSimulation(scenario.input));
  }
  return fromOffer(await analyzeOffer(scenario.input));
}

function messageOf(error: unknown): string {
  return error instanceof ApiError ? error.problem.detail : GENERIC_MESSAGE;
}

/**
 * Busca o resultado de cada cenário da lista. Cenários removidos saem do estado;
 * novos disparam uma busca. Um erro fica restrito à própria coluna.
 */
export function useScenarioResults(scenarios: ComputedRef<readonly Scenario[]>) {
  const states = reactive<Record<string, ScenarioState>>({});

  async function load(scenario: Scenario): Promise<void> {
    states[scenario.id] = { status: 'loading' };
    try {
      const result = await fetchScenario(scenario);
      if (scenario.id in states) states[scenario.id] = { status: 'ready', result };
    } catch (error) {
      if (scenario.id in states)
        states[scenario.id] = { status: 'error', message: messageOf(error) };
    }
  }

  watch(
    scenarios,
    (lista) => {
      const ids = new Set(lista.map((scenario) => scenario.id));
      for (const id of Object.keys(states)) {
        if (!ids.has(id)) Reflect.deleteProperty(states, id);
      }
      for (const scenario of lista) {
        if (!(scenario.id in states)) void load(scenario);
      }
    },
    { immediate: true },
  );

  function retry(id: string): void {
    const scenario = scenarios.value.find((item) => item.id === id);
    if (scenario) void load(scenario);
  }

  return { states, retry };
}
