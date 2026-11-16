<script setup lang="ts">
import { nextTick, ref } from 'vue';
import BaseButton from '../../design/components/BaseButton.vue';
import BaseField from '../../design/components/BaseField.vue';
import DateInput from '../../design/components/DateInput.vue';
import IntegerInput from '../../design/components/IntegerInput.vue';
import MoneyInput from '../../design/components/MoneyInput.vue';
import { focusFirstInvalid } from '../../shared/focusFirstInvalid';
import { OFFER_FIELDS, type OfferField, type OfferFormState } from './offerForm';

const props = withDefaults(
  defineProps<{
    errors: Partial<Record<OfferField, string>>;
    loading: boolean;
    submitLabel?: string;
  }>(),
  { submitLabel: 'Fazer o raio-X' },
);
const form = defineModel<OfferFormState>('form', { required: true });
const emit = defineEmits<{ submit: [] }>();

const formEl = ref<HTMLFormElement | null>(null);

const FOCUS_TARGETS: Record<OfferField, string> = {
  releasedCents: '#valor-recebido',
  paymentCents: '#valor-parcela',
  installments: '#prazo-oferta',
  contractDate: '#contratacao-oferta',
  firstDueDate: '#primeiro-vencimento-oferta',
};

/* Os erros só existem depois do submit: esperamos o próximo ciclo para ler as props. */
async function onSubmit(): Promise<void> {
  emit('submit');
  await nextTick();
  if (formEl.value) focusFirstInvalid(formEl.value, props.errors, OFFER_FIELDS, FOCUS_TARGETS);
}
</script>

<template>
  <form
    ref="formEl"
    class="form"
    novalidate
    aria-label="Dados da oferta do banco"
    @submit.prevent="onSubmit"
  >
    <BaseField
      id="valor-recebido"
      v-slot="field"
      label="Valor que você recebe"
      hint="O que cai na sua conta."
      :error="errors.releasedCents"
    >
      <MoneyInput v-bind="field" v-model="form.releasedCents" />
    </BaseField>

    <BaseField
      id="valor-parcela"
      v-slot="field"
      label="Valor da parcela"
      :error="errors.paymentCents"
    >
      <MoneyInput v-bind="field" v-model="form.paymentCents" />
    </BaseField>

    <BaseField id="prazo-oferta" v-slot="field" label="Prazo" :error="errors.installments">
      <IntegerInput v-bind="field" v-model="form.installments" suffix="meses" />
    </BaseField>

    <details class="options">
      <summary>Mais opções</summary>
      <div class="fields">
        <BaseField
          id="contratacao-oferta"
          v-slot="field"
          label="Data da contratação"
          :error="errors.contractDate"
        >
          <DateInput v-bind="field" v-model="form.contractDate" />
        </BaseField>

        <BaseField
          id="primeiro-vencimento-oferta"
          v-slot="field"
          label="Primeiro vencimento"
          hint="Se você não informar, vale 30 dias depois da contratação."
          :error="errors.firstDueDate"
        >
          <DateInput v-bind="field" v-model="form.firstDueDate" />
        </BaseField>
      </div>
    </details>

    <BaseButton type="submit" :loading="loading">{{ submitLabel }}</BaseButton>
  </form>
</template>

<style scoped>
.form {
  display: grid;
  gap: var(--space-5);
  align-content: start;
}

.options {
  border-top: 1px solid var(--rule);
  padding-top: var(--space-4);
}

.fields {
  display: grid;
  gap: var(--space-5);
  padding-top: var(--space-4);
}
</style>
