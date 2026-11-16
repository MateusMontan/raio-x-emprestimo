<script setup lang="ts">
import { parseInteger } from '../../shared/format';
import type { FieldAttrs } from '../fieldAttrs';
import { useFormattedInput } from '../useFormattedInput';

/**
 * Número inteiro não negativo. O sufixo (ex.: "meses") é só visual:
 * o rótulo do BaseField deve dizer a unidade para leitores de tela.
 */
const props = defineProps<FieldAttrs & { modelValue: number | null; suffix?: string }>();
const emit = defineEmits<{ 'update:modelValue': [value: number | null] }>();

const { text, onInput, onBlur } = useFormattedInput<number>({
  value: () => props.modelValue,
  format: (value) => String(value),
  parse: parseInteger,
  emit: (value) => emit('update:modelValue', value),
});
</script>

<template>
  <div class="control">
    <input
      :id="id"
      :value="text"
      type="text"
      inputmode="numeric"
      autocomplete="off"
      :aria-describedby="describedBy"
      :aria-invalid="invalid ? 'true' : undefined"
      @input="onInput"
      @blur="onBlur"
    />
    <span v-if="suffix" class="suffix" aria-hidden="true">{{ suffix }}</span>
  </div>
</template>

<style scoped>
.suffix {
  padding-right: var(--space-3);
  color: var(--ink);
}
</style>
