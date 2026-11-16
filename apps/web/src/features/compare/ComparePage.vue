<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { MAX_COMPARE_SCENARIOS } from './scenario';
import AddOfferSection from './AddOfferSection.vue';
import ComparisonTable, { type ComparisonColumn } from './ComparisonTable.vue';
import { bestBy } from './bestBy';
import { buildComparisonSummary, type ReadyEntry } from './comparisonSummary';
import { useComparison } from './useComparison';
import { useScenarioResults } from './useScenarioResults';

const { scenarios, remove, rename } = useComparison();
const { states, retry } = useScenarioResults(scenarios);

const columns = computed<ComparisonColumn[]>(() =>
  scenarios.value.map((scenario) => ({
    scenario,
    state: states[scenario.id] ?? { status: 'loading' },
  })),
);

const readyEntries = computed<ReadyEntry[]>(() =>
  scenarios.value.flatMap((scenario) => {
    const state = states[scenario.id];
    return state?.status === 'ready'
      ? [{ id: scenario.id, label: scenario.label, result: state.result }]
      : [];
  }),
);

const summary = computed(() => buildComparisonSummary(readyEntries.value));

/* Selos só existem com dois ou mais resultados prontos para comparar. */
const seals = computed(() => {
  const cet = bestBy(readyEntries.value, (entry) => entry.result.cetMonthly);
  const total = bestBy(readyEntries.value, (entry) => entry.result.totalPaidCents);
  const comparable = readyEntries.value.length >= 2;
  return {
    cet: comparable && cet ? cet.ids : new Set<string>(),
    total: comparable && total ? total.ids : new Set<string>(),
  };
});

const isEmpty = computed(() => scenarios.value.length === 0);
const hasRoom = computed(() => scenarios.value.length < MAX_COMPARE_SCENARIOS);
</script>

<template>
  <section class="compare">
    <h1 tabindex="-1">Compare até 3 ofertas</h1>

    <template v-if="!isEmpty">
      <p class="summary" aria-live="polite">{{ summary ?? '' }}</p>
      <ComparisonTable
        :columns="columns"
        :seals="seals"
        @rename="rename"
        @remove="remove"
        @retry="retry"
      />
    </template>
    <p v-else class="invite">Adicione as ofertas que você recebeu para ver qual sai mais barata.</p>

    <AddOfferSection v-if="hasRoom" :default-open="isEmpty" />

    <p v-if="isEmpty" class="link-line">
      <RouterLink to="/" class="link">Ou simule um empréstimo na tela Simular</RouterLink>
    </p>
  </section>
</template>

<style scoped>
.compare {
  display: grid;
  gap: var(--space-5);
  min-width: 0;
}

.summary {
  max-width: var(--measure);
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 700;
}

.invite {
  font-size: var(--text-lg);
}

.link-line {
  margin: 0;
}

.link {
  display: inline-flex;
  align-items: center;
  min-height: var(--target-min);
  color: var(--ink);
  font-weight: 700;
}
</style>
