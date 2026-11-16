<script setup lang="ts">
import { formatMoneyInput, parseMoney } from '../../shared/format';
import type { FieldAttrs } from '../fieldAttrs';
import { useFormattedInput } from '../useFormattedInput';

/** Valor em centavos inteiros. Digitado como "10.000,00". */
const props = defineProps<FieldAttrs & { modelValue: number | null }>();
const emit = defineEmits<{ 'update:modelValue': [value: number | null] }>();

const { text, onInput, onBlur } = useFormattedInput<number>({
  value: () => props.modelValue,
  format: formatMoneyInput,
  parse: parseMoney,
  emit: (value) => emit('update:modelValue', value),
});
</script>

<template>
  <div class="control money">
    <span class="prefix" aria-hidden="true">R$</span>
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
  </div>
</template>

<style scoped>
.prefix {
  padding-left: var(--space-3);
  color: var(--ink);
}
</style>
