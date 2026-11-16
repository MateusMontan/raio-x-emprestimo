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

const partes = computed(() => [
  { chave: 'juros', rotulo: 'Juros', cor: 'var(--interest)', cents: props.interestCents },
  {
    chave: 'amortizacao',
    rotulo: 'Amortização',
    cor: 'var(--principal)',
    cents: props.principalCents,
  },
  { chave: 'encargos', rotulo: 'Encargos', cor: 'var(--charges)', cents: props.chargesCents },
]);

const total = computed(() => partes.value.reduce((soma, parte) => soma + parte.cents, 0));

function fracao(cents: number): number {
  return total.value === 0 ? 0 : cents / total.value;
}

const descricao = computed(() => {
  const detalhes = partes.value.map(
    (parte) =>
      `${parte.rotulo.toLowerCase()} ${formatMoney(parte.cents)} (${formatPercent(fracao(parte.cents), 0)})`,
  );
  return `Composição da parcela de ${formatMoney(total.value)}: ${detalhes.join(', ')}.`;
});
</script>

<template>
  <figure class="composition">
    <div class="track" role="img" :aria-label="descricao">
      <span
        v-for="parte in partes"
        :key="parte.chave"
        class="segment"
        :style="{ width: `${fracao(parte.cents) * 100}%`, background: parte.cor }"
      />
    </div>
    <ul class="legend">
      <li v-for="parte in partes" :key="parte.chave" class="item">
        <span class="swatch" :style="{ background: parte.cor }" aria-hidden="true" />
        <span class="label">{{ parte.rotulo }}</span>
        <span class="value num">{{ formatMoney(parte.cents) }}</span>
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
