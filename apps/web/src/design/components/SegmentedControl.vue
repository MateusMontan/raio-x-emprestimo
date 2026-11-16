<script setup lang="ts" generic="T extends string">
/*
 * Grupo de rádio com aparência de segmentos. O navegador já move a seleção
 * com as setas dentro do mesmo `name`, e o fieldset dá o nome do grupo.
 */
defineProps<{
  legend: string;
  name: string;
  options: readonly { value: T; label: string }[];
}>();
const model = defineModel<T>({ required: true });
</script>

<template>
  <fieldset class="segmented">
    <legend class="legend">{{ legend }}</legend>
    <div class="options">
      <label v-for="option in options" :key="option.value" class="option">
        <input v-model="model" type="radio" :name="name" :value="option.value" />
        <span class="segment">{{ option.label }}</span>
      </label>
    </div>
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
</style>
