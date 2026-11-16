<script setup lang="ts">
import type { IofMode } from '@raiox/contracts';
import BaseField from '../../design/components/BaseField.vue';
import DateInput from '../../design/components/DateInput.vue';
import MoneyInput from '../../design/components/MoneyInput.vue';
import SegmentedControl from '../../design/components/SegmentedControl.vue';
import type { FormErrors, SimulationFormState } from './simulationForm';

defineProps<{ errors: FormErrors }>();
const form = defineModel<SimulationFormState>('form', { required: true });

const IOF_OPTIONS: readonly { value: IofMode; label: string }[] = [
  { value: 'FINANCED', label: 'Financiado' },
  { value: 'CASH', label: 'Pago à vista' },
  { value: 'NONE', label: 'Não calcular' },
];
</script>

<template>
  <details class="options">
    <summary>Mais opções</summary>
    <div class="fields">
      <BaseField
        id="contratacao"
        v-slot="campo"
        label="Data da contratação"
        :error="errors.contractDate"
      >
        <DateInput v-bind="campo" v-model="form.contractDate" />
      </BaseField>

      <BaseField
        id="primeiro-vencimento"
        v-slot="campo"
        label="Primeiro vencimento"
        hint="Se você não informar, vale 30 dias depois da contratação."
        :error="errors.firstDueDate"
      >
        <DateInput v-bind="campo" v-model="form.firstDueDate" />
      </BaseField>

      <BaseField
        id="tarifas"
        v-slot="campo"
        label="Tarifas e seguro"
        hint="Some o que o banco cobra além dos juros."
        :error="errors.feesCents"
      >
        <MoneyInput v-bind="campo" v-model="form.feesCents" />
      </BaseField>

      <div class="iof">
        <SegmentedControl
          v-model="form.iofMode"
          legend="IOF"
          name="iof"
          :options="IOF_OPTIONS"
          aria-describedby="iof-dica"
        />
        <p id="iof-dica" class="hint">
          Financiado: o IOF entra no valor emprestado. Pago à vista: o IOF sai do valor que você
          recebe.
        </p>
        <p v-if="errors.iofMode" class="error">{{ errors.iofMode }}</p>
      </div>
    </div>
  </details>
</template>

<style scoped>
.options {
  border-top: 1px solid var(--rule);
  padding-top: var(--space-4);
}

summary {
  display: inline-flex;
  align-items: center;
  min-height: var(--target-min);
  font-weight: 700;
  cursor: pointer;
}

.fields {
  display: grid;
  gap: var(--space-5);
  padding-top: var(--space-4);
}

.iof {
  display: grid;
  gap: var(--space-2);
}

.hint {
  font-size: var(--text-sm);
}

.error {
  color: var(--interest);
  font-weight: 700;
}
</style>
