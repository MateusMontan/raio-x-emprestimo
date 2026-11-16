<script setup lang="ts">
import { computed } from 'vue';
import { formatMoney, formatPercent } from '../../shared/format';

/*
 * Barra de composição de uma parcela. A cor nunca é a única pista: a legenda
 * traz o nome e o valor de cada parte, e o aria-label descreve tudo.
 */
const props = defineProps<{
  interestCents: number;
  principalCents: number;
  chargesCents: number;
}>();

const parts = computed(() => [
  { key: 'juros', rotulo: 'Juros', cor: 'var(--interest)', cents: props.interestCents },
  {
    key: 'amortizacao',
    rotulo: 'Amortização',
    cor: 'var(--principal)',
    cents: props.principalCents,
  },
  { key: 'encargos', rotulo: 'Encargos', cor: 'var(--charges)', cents: props.chargesCents },
]);

const total = computed(() => parts.value.reduce((soma, part) => soma + part.cents, 0));

function fraction(cents: number): number {
  return total.value === 0 ? 0 : cents / total.value;
}

const descricao = computed(() => {
  const details = parts.value.map(
    (part) =>
      `${part.rotulo.toLowerCase()} ${formatMoney(part.cents)} (${formatPercent(fraction(part.cents), 0)})`,
  );
  return `Composição da parcela de ${formatMoney(total.value)}: ${details.join(', ')}.`;
});
</script>

<template>
  <figure class="composition">
    <div class="track" role="img" :aria-label="descricao">
      <span
        v-for="part in parts"
        :key="part.key"
        class="segment"
        :style="{ width: `${fraction(part.cents) * 100}%`, background: part.cor }"
      />
    </div>
    <ul class="legend">
      <li v-for="part in parts" :key="part.key" class="item">
        <span class="swatch" :style="{ background: part.cor }" aria-hidden="true" />
        <span class="label">{{ part.rotulo }}</span>
        <span class="value num">{{ formatMoney(part.cents) }}</span>
      </li>
    </ul>
  </figure>
</template>

<style scoped>
.composition {
  display: grid;
  gap: var(--space-3);
}

.track {
  display: flex;
  height: var(--space-3);
  overflow: hidden;
  background: var(--rule);
  border-radius: var(--radius-slip);
}

.segment {
  display: block;
  height: 100%;
}

.legend {
  display: grid;
  gap: var(--space-1);
}

.item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--space-2);
}

.swatch {
  width: var(--space-3);
  height: var(--space-3);
  border-radius: var(--radius-slip);
}

.value {
  text-align: right;
}
</style>
