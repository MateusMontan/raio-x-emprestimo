<script setup lang="ts">
import { computed } from 'vue';
import { formatMoney, formatPercent } from '../../shared/format';

/*
 * Barra de composição de uma parcela. A cor nunca é a única pista: a legenda
 * traz o nome e o valor de cada parte, e o aria-label descreve tudo.
 * `inline` põe a legenda em uma faixa só (quebra em telas estreitas) e a slot
 * default divide essa faixa com outro texto, como o saldo do carnê.
 * `hideZero` omite as partes de valor zero da legenda e do aria-label.
 */
const props = withDefaults(
  defineProps<{
    interestCents: number;
    principalCents: number;
    chargesCents: number;
    inline?: boolean;
    hideZero?: boolean;
  }>(),
  { inline: false, hideZero: false },
);

const allParts = computed(() => [
  { key: 'juros', label: 'Juros', color: 'var(--interest)', cents: props.interestCents },
  {
    key: 'amortizacao',
    label: 'Amortização',
    color: 'var(--principal)',
    cents: props.principalCents,
  },
  { key: 'encargos', label: 'Encargos', color: 'var(--charges)', cents: props.chargesCents },
]);

const legendParts = computed(() =>
  props.hideZero ? allParts.value.filter((part) => part.cents > 0) : allParts.value,
);

const total = computed(() => allParts.value.reduce((sum, part) => sum + part.cents, 0));

function fraction(cents: number): number {
  return total.value === 0 ? 0 : cents / total.value;
}

const description = computed(() => {
  const details = legendParts.value.map(
    (part) =>
      `${part.label.toLowerCase()} ${formatMoney(part.cents)} (${formatPercent(fraction(part.cents), 0)})`,
  );
  return `Composição da parcela de ${formatMoney(total.value)}: ${details.join(', ')}.`;
});
</script>

<template>
  <figure class="composition" :class="{ 'composition--inline': inline }">
    <div class="track" role="img" :aria-label="description">
      <span
        v-for="part in allParts"
        :key="part.key"
        class="segment"
        :style="{ width: `${fraction(part.cents) * 100}%`, background: part.color }"
      />
    </div>
    <div class="legend-row">
      <ul class="legend">
        <li v-for="part in legendParts" :key="part.key" class="item">
          <span class="swatch" :style="{ background: part.color }" aria-hidden="true" />
          <span class="label">{{ part.label }}</span>
          <span class="value num">{{ formatMoney(part.cents) }}</span>
        </li>
      </ul>
      <slot />
    </div>
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

.legend-row {
  display: grid;
  gap: var(--space-1);
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

/* Inline: legenda e slot lado a lado, com quebra automática em telas estreitas. */
.composition--inline .legend-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-1) var(--space-4);
}

.composition--inline .legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1) var(--space-4);
}

.composition--inline .item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.composition--inline .value {
  font-weight: 700;
}
</style>
