<script setup lang="ts">
import { reactive, ref } from 'vue';
import { offerInputSchema } from '@raiox/contracts';
import BaseButton from '../../design/components/BaseButton.vue';
import { todayIso } from '../../shared/today';
import OfferForm from '../analyze/OfferForm.vue';
import {
  OFFER_FIELDS,
  createDefaultOfferForm,
  toOfferCandidate,
  type OfferField,
  type OfferFormState,
} from '../analyze/offerForm';
import { useComparison } from './useComparison';

const props = defineProps<{ defaultOpen: boolean }>();

const { add } = useComparison();
const open = ref(props.defaultOpen);
const form = reactive<OfferFormState>(createDefaultOfferForm(todayIso()));
const errors = ref<Partial<Record<OfferField, string>>>({});

function isOfferField(texto: string): texto is OfferField {
  return (OFFER_FIELDS as readonly string[]).includes(texto);
}

function onSubmit(): void {
  const lido = offerInputSchema.safeParse(toOfferCandidate(form));
  if (!lido.success) {
    const porCampo: Partial<Record<OfferField, string>> = {};
    for (const issue of lido.error.issues) {
      const campo = String(issue.path[0] ?? '');
      if (isOfferField(campo)) porCampo[campo] ??= issue.message;
    }
    errors.value = porCampo;
    return;
  }
  errors.value = {};
  add({ kind: 'offer', input: lido.data });
  open.value = false;
}
</script>

<template>
  <section class="add-offer" aria-label="Adicionar oferta">
    <BaseButton v-if="!open" variant="secondary" @click="open = true">Adicionar oferta</BaseButton>

    <template v-else>
      <OfferForm
        :form="form"
        :errors="errors"
        :loading="false"
        submit-label="Adicionar à comparação"
        @submit="onSubmit"
      />
      <BaseButton variant="secondary" @click="open = false">Cancelar</BaseButton>
    </template>
  </section>
</template>

<style scoped>
.add-offer {
  display: grid;
  gap: var(--space-5);
  justify-items: start;
  min-width: 0;
  width: 100%;
  max-width: var(--measure);
}
</style>
