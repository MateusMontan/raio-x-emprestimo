<script setup lang="ts">
import { nextTick, ref } from 'vue';
import type { AmortizationSystem } from '@raiox/contracts';
import BaseButton from '../../design/components/BaseButton.vue';
import BaseField from '../../design/components/BaseField.vue';
import IntegerInput from '../../design/components/IntegerInput.vue';
import MoneyInput from '../../design/components/MoneyInput.vue';
import PercentInput from '../../design/components/PercentInput.vue';
import SegmentedControl from '../../design/components/SegmentedControl.vue';
import { focusFirstInvalid } from '../../shared/focusFirstInvalid';
import SimulationOptions from './SimulationOptions.vue';
import {
  FOCUS_TARGETS,
  FORM_FIELDS,
  type FormErrors,
  type SimulationFormState,
} from './simulationForm';

const props = defineProps<{ errors: FormErrors; loading: boolean }>();
const form = defineModel<SimulationFormState>('form', { required: true });
const emit = defineEmits<{ submit: [] }>();

const formEl = ref<HTMLFormElement | null>(null);

const SYSTEM_OPTIONS: readonly { value: AmortizationSystem; label: string }[] = [
  { value: 'PRICE', label: 'Parcelas fixas (Price)' },
  { value: 'SAC', label: 'Parcelas que diminuem (SAC)' },
];

/* Os erros só existem depois do submit: esperamos o próximo ciclo para ler as props. */
async function onSubmit(): Promise<void> {
  emit('submit');
  await nextTick();
  if (formEl.value) focusFirstInvalid(formEl.value, props.errors, FORM_FIELDS, FOCUS_TARGETS);
}
</script>

<template>
  <form
    ref="formEl"
    class="form"
    novalidate
    aria-label="Dados do empréstimo"
    @submit.prevent="onSubmit"
  >
    <BaseField id="valor" v-slot="campo" label="Valor do empréstimo" :error="errors.amountCents">
      <MoneyInput v-bind="campo" v-model="form.amountCents" />
    </BaseField>

    <BaseField id="taxa" v-slot="campo" label="Taxa de juros ao mês" :error="errors.monthlyRate">
      <PercentInput v-bind="campo" v-model="form.monthlyRate" />
    </BaseField>

    <BaseField id="prazo" v-slot="campo" label="Prazo" :error="errors.installments">
      <IntegerInput v-bind="campo" v-model="form.installments" suffix="meses" />
    </BaseField>

    <SegmentedControl
      v-model="form.system"
      legend="Sistema"
      name="sistema"
      :options="SYSTEM_OPTIONS"
    />
    <p v-if="errors.system" class="error">{{ errors.system }}</p>

    <SimulationOptions v-model:form="form" :errors="errors" />

    <BaseButton type="submit" :loading="loading">Calcular</BaseButton>
  </form>
</template>

<style scoped>
.form {
  display: grid;
  gap: var(--space-5);
  align-content: start;
}

.error {
  color: var(--interest);
  font-weight: 700;
}
</style>
