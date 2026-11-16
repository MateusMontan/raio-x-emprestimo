<script setup lang="ts">
import { computed } from 'vue';
import Carne from './Carne.vue';
import ResultSummary from './ResultSummary.vue';
import SimulationForm from './SimulationForm.vue';
import { useSimulation } from './useSimulation';

const sim = useSimulation();
const loading = computed(() => sim.status.value === 'loading');
</script>

<template>
  <section class="simulate">
    <h1>Quanto esse empréstimo custa de verdade?</h1>

    <div class="layout">
      <div class="form-col">
        <p v-if="sim.generalError.value" class="alert" role="alert">
          {{ sim.generalError.value }}
        </p>
        <SimulationForm
          :form="sim.form"
          :errors="sim.errors.value"
          :loading="loading"
          @submit="sim.submit"
        />
      </div>

      <div class="result-col">
        <template v-if="sim.result.value">
          <ResultSummary :result="sim.result.value" />
          <Carne :schedule="sim.result.value.schedule" :animate="sim.isFresh.value" />
        </template>
        <p v-else class="invite">
          Preencha o formulário e clique em Calcular para ver quanto o empréstimo custa.
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.simulate {
  display: grid;
  gap: var(--space-5);
}

.layout {
  display: grid;
  gap: var(--space-6);
  align-items: start;
}

.result-col {
  display: grid;
  gap: var(--space-6);
  min-width: 0;
}

.alert {
  color: var(--interest);
  font-weight: 700;
}

.invite {
  font-size: var(--text-lg);
}

@media (min-width: 960px) {
  .layout {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--gutter);
  }

  .form-col {
    grid-column: 1 / span 4;
    position: sticky;
    top: var(--space-5);
  }

  .result-col {
    grid-column: 5 / span 8;
  }
}
</style>
