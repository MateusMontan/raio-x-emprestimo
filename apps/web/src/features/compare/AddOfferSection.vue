<script setup lang="ts">
import { nextTick, reactive, ref } from 'vue';
import { offerInputSchema } from '@raiox/contracts';
import BaseButton from '../../design/components/BaseButton.vue';
import LiveStatus from '../../design/components/LiveStatus.vue';
import { todayIso } from '../../shared/today';
import OfferForm from '../analyze/OfferForm.vue';
import {
  OFFER_FIELDS,
  createDefaultOfferForm,
  toOfferCandidate,
  type OfferField,
  type OfferFormState,
} from '../analyze/offerForm';
import { nameInputId } from './scenario';
import { useComparison } from './useComparison';

const props = defineProps<{ defaultOpen: boolean }>();

const { scenarios, add } = useComparison();
const open = ref(props.defaultOpen);
const form = reactive<OfferFormState>(createDefaultOfferForm(todayIso()));
const errors = ref<Partial<Record<OfferField, string>>>({});
const announcement = ref('');

function isOfferField(text: string): text is OfferField {
  return (OFFER_FIELDS as readonly string[]).includes(text);
}

async function onSubmit(): Promise<void> {
  const parsed = offerInputSchema.safeParse(toOfferCandidate(form));
  if (!parsed.success) {
    const byField: Partial<Record<OfferField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? '');
      if (isOfferField(field)) byField[field] ??= issue.message;
    }
    errors.value = byField;
    return;
  }
  errors.value = {};
  add({ kind: 'offer', input: parsed.data });
  open.value = false;
  announcement.value = `Oferta ${scenarios.value.length} adicionada à comparação.`;
  /* O formulário saiu da tela; o foco vai ao nome da coluna nova, que acabou de nascer. */
  await nextTick();
  const created = scenarios.value.at(-1);
  if (created) document.getElementById(nameInputId(created.id))?.focus();
}
</script>

<template>
  <section class="add-offer" aria-label="Adicionar oferta">
    <LiveStatus :text="announcement" />
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
