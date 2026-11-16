import { computed, ref, watch } from 'vue';
import { MAX_COMPARE_SCENARIOS, type Scenario, type ScenarioDraft } from './scenario';
import { loadScenarios, saveScenarios } from './comparisonStorage';

const LABEL_MAX_LENGTH = 60;

/* Lista compartilhada entre telas: a comparação sobrevive à navegação na mesma aba. */
const scenarios = ref<Scenario[]>(loadScenarios());
watch(
  scenarios,
  (lista) => {
    saveScenarios(lista);
  },
  { deep: true },
);

/** Menor número livre para "Oferta N", sem repetir um rótulo já em uso. */
function nextDefaultLabel(): string {
  const usados = new Set(scenarios.value.map((cenario) => cenario.label));
  let numero = 1;
  while (usados.has(`Oferta ${numero}`)) numero += 1;
  return `Oferta ${numero}`;
}

function add(draft: ScenarioDraft): boolean {
  if (scenarios.value.length >= MAX_COMPARE_SCENARIOS) return false;
  const id = globalThis.crypto.randomUUID();
  scenarios.value = [...scenarios.value, { ...draft, id, label: nextDefaultLabel() }];
  return true;
}

function remove(id: string): void {
  scenarios.value = scenarios.value.filter((cenario) => cenario.id !== id);
}

function rename(id: string, label: string): void {
  const limpo = label.trim().slice(0, LABEL_MAX_LENGTH);
  if (limpo === '') return;
  scenarios.value = scenarios.value.map((cenario) =>
    cenario.id === id ? { ...cenario, label: limpo } : cenario,
  );
}

function clear(): void {
  scenarios.value = [];
}

/** Acesso à comparação compartilhada. Cada chamada enxerga a mesma lista. */
export function useComparison() {
  return {
    scenarios: computed(() => scenarios.value),
    add,
    remove,
    rename,
    clear,
  };
}
