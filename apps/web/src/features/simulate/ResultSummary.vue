<script setup lang="ts">
import { computed } from 'vue';
import type { SimulationResult } from '@raiox/contracts';
import TermHint from '../../design/components/TermHint.vue';
import { formatMoney, formatPercent } from '../../shared/format';

const props = defineProps<{ result: SimulationResult }>();

const first = computed(() => props.result.schedule[0]);
const last = computed(() => props.result.schedule.at(-1));
</script>

<template>
  <section class="summary" aria-label="Resultado da simulação">
    <div aria-live="polite" aria-atomic="true">
      <p class="sentence">
        Você recebe <strong>{{ formatMoney(result.releasedCents) }}</strong> e devolve
        <strong>{{ formatMoney(result.totals.paidCents) }}</strong>.
      </p>
    </div>

    <dl class="cet">
      <div>
        <dt>CET mensal</dt>
        <dd class="num">{{ formatPercent(result.cetMonthly) }}</dd>
      </div>
      <div>
        <dt>CET anual</dt>
        <dd class="num">{{ formatPercent(result.cetAnnual) }}</dd>
      </div>
      <TermHint
        term="CET"
        explanation="Custo Efetivo Total: o custo real, com juros, IOF e tarifas"
      />
    </dl>

    <dl class="details">
      <div>
        <dt>Custo do crédito</dt>
        <dd class="num">{{ formatMoney(result.totals.costCents) }}</dd>
      </div>
      <div>
        <dt>Juros</dt>
        <dd class="num">{{ formatMoney(result.totals.interestCents) }}</dd>
      </div>
      <div>
        <dt>IOF</dt>
        <dd class="num">{{ formatMoney(result.iof.totalCents) }}</dd>
      </div>
      <div>
        <dt>Tarifas e seguro</dt>
        <dd class="num">{{ formatMoney(result.feesCents) }}</dd>
      </div>
      <div v-if="first">
        <dt>Primeira parcela</dt>
        <dd class="num">{{ formatMoney(first.payment) }}</dd>
      </div>
      <div v-if="last">
        <dt>Última parcela</dt>
        <dd class="num">{{ formatMoney(last.payment) }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.summary {
  display: grid;
  gap: var(--space-5);
}

.sentence {
  font-size: var(--text-xl);
  font-weight: 800;
  line-height: 1.3;
}

.sentence strong {
  font-weight: 800;
}

@media (min-width: 960px) {
  .sentence {
    font-size: var(--text-3xl);
  }
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
