<script setup lang="ts">
import { computed } from 'vue';
import type { SimulationInput } from '@raiox/contracts';
import BaseButton from '../../design/components/BaseButton.vue';
import BaseField from '../../design/components/BaseField.vue';
import { useShare } from './useShare';

const props = defineProps<{ input: SimulationInput }>();

const { status, url, message, share } = useShare();
const loading = computed(() => status.value === 'loading');

/* Sem clipboard, o link fica num campo: selecionado ao focar, pronto para Ctrl+C. */
function selecionarLink(event: FocusEvent): void {
  if (event.target instanceof HTMLInputElement) event.target.select();
}
</script>

<template>
  <div class="share">
    <BaseButton variant="secondary" :loading="loading" @click="share(props.input)">
      Copiar link
    </BaseButton>

    <p aria-live="polite" class="status" :class="{ 'status--error': status === 'error' }">
      {{ message }}
    </p>

    <BaseField
      v-if="status === 'manual' && url"
      id="link-simulacao"
      v-slot="campo"
      label="Link da simulação"
    >
      <input
        v-bind="campo"
        class="link"
        type="text"
        readonly
        :value="url"
        @focus="selecionarLink"
      />
    </BaseField>
  </div>
</template>

<style scoped>
.share {
  display: grid;
  gap: var(--space-3);
  justify-items: start;
  min-width: 0;
  width: 100%;
}

.status {
  min-height: 1lh;
}

.status--error {
  color: var(--interest);
  font-weight: 700;
}

.link {
  width: 100%;
  box-sizing: border-box;
  min-height: var(--target-min);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--ink);
  border-radius: var(--radius-control);
  background: var(--slip);
  color: var(--ink);
  font: inherit;
}
</style>
