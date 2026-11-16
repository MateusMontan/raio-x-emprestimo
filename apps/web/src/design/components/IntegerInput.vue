<script setup lang="ts">
import { computed } from 'vue';
import { parseInteger } from '../../shared/format';
import { joinIds, type FieldAttrs } from '../fieldAttrs';
import { useFormattedInput } from '../useFormattedInput';

/**
 * Número inteiro não negativo. O sufixo (ex.: "meses") é lido pelo leitor de
 * tela como descrição do campo, junto com a dica e o erro.
 */
const props = defineProps<FieldAttrs & { modelValue: number | null; suffix?: string }>();
const emit = defineEmits<{ 'update:modelValue': [value: number | null] }>();

const unitId = computed(() => `${props.id}-unidade`);
const describedBy = computed(() =>
  joinIds(props.describedBy, props.suffix ? unitId.value : undefined),
);

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
    <span v-if="suffix" :id="unitId" class="suffix">{{ suffix }}</span>
  </div>
</template>

<style scoped>
.suffix {
  padding-right: var(--space-3);
  color: var(--ink);
}
</style>
