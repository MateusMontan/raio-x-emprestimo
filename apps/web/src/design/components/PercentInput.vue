<script setup lang="ts">
import { formatPercentInput, parsePercent } from '../../shared/format';
import type { FieldAttrs } from '../fieldAttrs';
import { useFormattedInput } from '../useFormattedInput';

/** Fração decimal (0,025 = 2,5%). Digitada como "2,5". */
const props = defineProps<FieldAttrs & { modelValue: number | null }>();
const emit = defineEmits<{ 'update:modelValue': [value: number | null] }>();

const { text, onInput, onBlur } = useFormattedInput<number>({
  value: () => props.modelValue,
  format: formatPercentInput,
  parse: parsePercent,
  emit: (value) => emit('update:modelValue', value),
});
</script>

<template>
  <div class="control">
    <input
      :id="id"
      :value="text"
      type="text"
      inputmode="decimal"
      autocomplete="off"
      :aria-describedby="describedBy"
      :aria-invalid="invalid ? 'true' : undefined"
      @input="onInput"
      @blur="onBlur"
    />
    <span class="suffix" aria-hidden="true">%</span>
  </div>
</template>

<style scoped>
.suffix {
  padding-right: var(--space-3);
  color: var(--ink);
}
</style>
