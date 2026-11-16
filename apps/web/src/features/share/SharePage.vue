<script setup lang="ts">
import { watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseButton from '../../design/components/BaseButton.vue';
import Carne from '../simulate/Carne.vue';
import ResultSummary from '../simulate/ResultSummary.vue';
import NotFoundPage from '../../app/NotFoundPage.vue';
import { describeInput, expiryDate } from './sharedSummary';
import { useSharedSimulation } from './useSharedSimulation';

const route = useRoute();
const router = useRouter();

const sim = useSharedSimulation(() => String(route.params.id));

watch(
  () => route.params.id,
  () => void sim.load(),
  { immediate: true },
);

function editar(): void {
  const shared = sim.shared.value;
  if (shared) void router.push({ path: '/', state: { input: shared.input } });
}

function novaSimulacao(): void {
  void router.push('/');
}
</script>

<template>
  <section class="shared">
    <p v-if="sim.status.value === 'loading'">Carregando a simulação…</p>

    <NotFoundPage
      v-else-if="sim.status.value === 'not-found'"
      title="Link expirado"
      message="Este link não existe mais ou já passou da validade."
    />

    <template v-else-if="sim.status.value === 'error'">
      <h1 tabindex="-1">Não foi possível abrir a simulação</h1>
      <p class="alert" role="alert">{{ sim.message.value }}</p>
      <BaseButton @click="sim.load">Tentar de novo</BaseButton>
    </template>

    <template v-else-if="sim.shared.value">
      <h1 tabindex="-1">Simulação compartilhada</h1>
      <p class="summary-line">{{ describeInput(sim.shared.value.input) }}</p>
      <ResultSummary :result="sim.shared.value.result" />
      <Carne :schedule="sim.shared.value.result.schedule" :animate="true" />
      <p class="expiry">Este link vale até {{ expiryDate(sim.shared.value.expiresAt) }}.</p>
      <div class="actions">
        <BaseButton variant="secondary" @click="editar">Editar esta simulação</BaseButton>
        <BaseButton @click="novaSimulacao">Nova simulação</BaseButton>
      </div>
    </template>
  </section>
</template>

<style scoped>
.shared {
  display: grid;
  gap: var(--space-6);
  min-width: 0;
}

.summary-line {
  max-width: var(--measure);
  font-size: var(--text-lg);
}

.alert {
  color: var(--interest);
  font-weight: 700;
}

.expiry {
  font-size: var(--text-sm);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}
</style>
