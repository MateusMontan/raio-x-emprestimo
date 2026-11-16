<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{ id: string; label: string; accessibleName: string }>();
const emit = defineEmits<{ rename: [label: string] }>();

/*
 * Rascunho local: o texto digitado fica como está até a confirmação (blur ou Enter).
 * Assim o espaço no meio do nome não some enquanto a pessoa digita.
 */
const draft = ref(props.label);

watch(
  () => props.label,
  (label) => {
    draft.value = label;
  },
);

function onInput(event: Event): void {
  if (event.target instanceof HTMLInputElement) draft.value = event.target.value;
}

function commit(): void {
  const clean = draft.value.trim();
  if (clean === '') {
    draft.value = props.label;
    return;
  }
  draft.value = clean;
  if (clean !== props.label) emit('rename', clean);
}
</script>

<template>
  <input
    :id="id"
    type="text"
    class="name"
    maxlength="60"
    :aria-label="accessibleName"
    :value="draft"
    @input="onInput"
    @change="commit"
    @keydown.enter.prevent="commit"
  />
</template>

<style scoped>
.name {
  width: 100%;
  box-sizing: border-box;
  min-height: var(--target-min);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--ink);
  border-radius: var(--radius-control);
  background: var(--slip);
  color: var(--ink);
  font: inherit;
  font-weight: 700;
}
</style>
