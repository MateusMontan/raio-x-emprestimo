<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  id: string;
  label: string;
  hint?: string | undefined;
  error?: string | null | undefined;
}>();

const hintId = computed(() => `${props.id}-dica`);
const errorId = computed(() => `${props.id}-erro`);
const invalid = computed(() => Boolean(props.error));
const describedBy = computed(() => {
  const ids: string[] = [];
  if (props.hint) ids.push(hintId.value);
  if (props.error) ids.push(errorId.value);
  return ids.length > 0 ? ids.join(' ') : undefined;
});
</script>

<template>
  <div class="field">
    <label class="label" :for="id">{{ label }}</label>
    <p v-if="hint" :id="hintId" class="hint">{{ hint }}</p>
    <!-- Slot props mantêm camelCase no JS; o consumidor lê f.describedBy. -->
    <!-- eslint-disable-next-line vue/attribute-hyphenation -->
    <slot :id="id" :describedBy="describedBy" :invalid="invalid" />
    <p v-if="error" :id="errorId" class="error">{{ error }}</p>
  </div>
</template>

<style scoped>
.field {
  display: grid;
  gap: var(--space-2);
}

.label {
  font-weight: 700;
}

.hint {
  font-size: var(--text-sm);
}

.error {
  color: var(--interest);
  font-weight: 700;
}
</style>
