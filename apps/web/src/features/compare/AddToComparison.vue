<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import type { OfferInput, SimulationInput } from '@raiox/contracts';
import BaseButton from '../../design/components/BaseButton.vue';
import { toDraft, type ScenarioKind } from './scenario';
import { useComparison } from './useComparison';

const props = defineProps<{ kind: ScenarioKind; input: SimulationInput | OfferInput }>();

const router = useRouter();
const { add } = useComparison();
const aviso = ref('');

function onClick(): void {
  const draft = toDraft(props.kind, props.input);
  if (!draft) return;
  if (!add(draft)) {
    aviso.value = 'Você já tem 3 ofertas na comparação. Remova uma para adicionar outra.';
    return;
  }
  aviso.value = '';
  void router.push('/comparar');
}
</script>

<template>
  <div class="add">
    <BaseButton variant="secondary" @click="onClick">Comparar com outra oferta</BaseButton>

    <p aria-live="polite" class="notice">
      {{ aviso }}
      <RouterLink v-if="aviso" to="/comparar" class="notice-link">Ver a comparação</RouterLink>
    </p>
  </div>
</template>

<style scoped>
.add {
  display: grid;
  gap: var(--space-3);
  justify-items: start;
  min-width: 0;
}

.notice {
  min-height: 1lh;
  margin: 0;
  font-weight: 700;
}

.notice-link {
  display: inline-flex;
  align-items: center;
  min-height: var(--target-min);
  color: var(--ink);
}
</style>
