<script setup lang="ts">
import type { OfferAnalysis } from '@raiox/contracts';
import TermHint from '../../design/components/TermHint.vue';
import { formatMoney, formatPercent } from '../../shared/format';

defineProps<{ analysis: OfferAnalysis }>();
</script>

<template>
  <section class="offer-result" aria-label="Resultado do raio-X">
    <div aria-live="polite" aria-atomic="true">
      <p class="sentence">
        Você recebe <strong>{{ formatMoney(analysis.releasedCents) }}</strong> e devolve
        <strong>{{ formatMoney(analysis.totalPaidCents) }}</strong>.
      </p>
    </div>

    <p class="rate">
      Os juros embutidos são de {{ formatPercent(analysis.impliedMonthlyRate) }} ao mês ({{
        formatPercent(analysis.impliedAnnualRate)
      }}
      ao ano).
    </p>

    <dl class="cet">
      <div>
        <dt>CET mensal</dt>
        <dd class="num">{{ formatPercent(analysis.cetMonthly) }}</dd>
      </div>
      <div>
        <dt>CET anual</dt>
        <dd class="num">{{ formatPercent(analysis.cetAnnual) }}</dd>
      </div>
      <TermHint
        term="CET"
        explanation="Custo Efetivo Total: o custo real, com juros, IOF e tarifas"
      />
    </dl>

    <dl class="details">
      <div>
        <dt>Custo do crédito</dt>
        <dd class="num">{{ formatMoney(analysis.costCents) }}</dd>
      </div>
    </dl>

    <p class="advice">
      Se a taxa que o banco anunciou é menor que essa, a parcela tem tarifas, seguro ou IOF
      embutidos. Peça o CET por escrito.
    </p>
  </section>
</template>

<style scoped>
.offer-result {
  display: grid;
  gap: var(--space-5);
  min-width: 0;
}

.sentence {
  font-size: var(--text-sentence);
  font-weight: 800;
  line-height: 1.3;
}

.sentence strong {
  font-weight: 800;
  white-space: nowrap;
}

.rate,
.advice {
  max-width: var(--measure);
  font-size: var(--text-lg);
}

.cet,
.details {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: var(--space-4) var(--space-6);
  margin: 0;
}

.cet > div,
.details > div {
  display: grid;
  gap: var(--space-1);
}

dt {
  font-size: var(--text-sm);
}

dd {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 700;
}
</style>
