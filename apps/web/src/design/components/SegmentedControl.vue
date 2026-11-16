<script setup lang="ts" generic="T extends string">
import { computed } from 'vue';

/*
 * Grupo de rádio com aparência de segmentos. O navegador já move a seleção
 * com as setas dentro do mesmo `name`, e o fieldset dá o nome do grupo.
 * Dica e erro ficam ligados ao grupo por aria-describedby; o erro também
 * marca o grupo com aria-invalid, como os demais campos.
 */
const props = defineProps<{
  legend: string;
  name: string;
  options: readonly { value: T; label: string }[];
  describedBy?: string | undefined;
  error?: string | null | undefined;
}>();
const model = defineModel<T>({ required: true });

const errorId = computed(() => `${props.name}-erro`);
const describedByIds = computed(() => {
  const ids: string[] = [];
  if (props.describedBy) ids.push(props.describedBy);
  if (props.error) ids.push(errorId.value);
  return ids.length > 0 ? ids.join(' ') : undefined;
});
</script>

<template>
  <fieldset
    class="segmented"
    :aria-describedby="describedByIds"
    :aria-invalid="error ? 'true' : undefined"
  >
    <legend class="legend">{{ legend }}</legend>
    <div class="options">
      <label v-for="option in options" :key="option.value" class="option">
        <input v-model="model" type="radio" :name="name" :value="option.value" />
        <span class="segment">{{ option.label }}</span>
      </label>
    </div>
    <p v-if="error" :id="errorId" class="error">{{ error }}</p>
  </fieldset>
</template>

<style scoped>
.segmented {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.legend {
  padding: 0;
  margin-bottom: var(--space-2);
  font-weight: 700;
}

.options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.option {
  position: relative;
  display: inline-flex;
}

.option input {
  position: absolute;
  opacity: 0;
  width: var(--target-min);
  height: var(--target-min);
  margin: 0;
}

.segment {
  display: inline-flex;
  align-items: center;
  min-height: var(--target-min);
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--ink);
  border-radius: var(--radius-control);
  background: var(--slip);
  cursor: pointer;
}

.option input:checked + .segment {
  background: var(--ink);
  color: var(--slip);
  font-weight: 700;
}

.option input:focus-visible + .segment {
  outline: 3px solid var(--ink);
  outline-offset: 2px;
}

.error {
  margin-top: var(--space-2);
  color: var(--interest);
  font-weight: 700;
}
</style>
