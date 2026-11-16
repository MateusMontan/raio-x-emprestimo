<script setup lang="ts">
import { computed } from 'vue';
import AddToComparison from '../compare/AddToComparison.vue';
import OfferForm from './OfferForm.vue';
import OfferResult from './OfferResult.vue';
import { useOfferAnalysis } from './useOfferAnalysis';

const offer = useOfferAnalysis();
const loading = computed(() => offer.status.value === 'loading');
</script>

<template>
  <section class="analyze">
    <h1>Qual é a taxa de verdade dessa oferta?</h1>

    <div class="layout">
      <div class="form-col">
        <p v-if="offer.generalError.value" class="alert" role="alert">
          {{ offer.generalError.value }}
        </p>
        <OfferForm
          :form="offer.form"
          :errors="offer.errors.value"
          :loading="loading"
          @submit="offer.submit"
        />
      </div>

      <div class="result-col">
        <template v-if="offer.result.value">
          <OfferResult :analysis="offer.result.value" />
          <AddToComparison
            v-if="offer.resultInput.value"
            kind="offer"
            :input="offer.resultInput.value"
          />
        </template>
        <p v-else class="invite">
          Informe o que você recebe, a parcela e o prazo para ver a taxa real da oferta.
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.analyze {
  display: grid;
  gap: var(--space-5);
}

.layout {
  display: grid;
  gap: var(--space-6);
  align-items: start;
}

.result-col {
  min-width: 0;
}

.alert {
  color: var(--interest);
  font-weight: 700;
}

.invite {
  font-size: var(--text-lg);
}

@media (min-width: 960px) {
  .layout {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--gutter);
  }

  .form-col {
    grid-column: 1 / span 4;
    position: sticky;
    top: var(--space-5);
  }

  .result-col {
    grid-column: 5 / span 8;
  }
}
</style>
