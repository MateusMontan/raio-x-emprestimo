<script setup lang="ts">
import type { ScheduleRow } from '@raiox/contracts';
import CompositionBar from '../../design/components/CompositionBar.vue';
import { formatDate, formatMoney } from '../../shared/format';

/*
 * Uma lâmina do carnê. O picote é feito por máscara no ::before, para que a
 * sombra de 1px (--shadow-stub) continue visível embaixo da lâmina.
 */
defineProps<{ row: ScheduleRow; total: number; index: number; animate: boolean }>();
</script>

<template>
  <li class="slip" :class="{ 'slip--enter': animate }" :style="{ '--slip-index': index }">
    <div class="head">
      <p class="number">Parcela {{ row.n }} de {{ total }}</p>
      <p class="due">
        Vencimento <time :datetime="row.dueDate">{{ formatDate(row.dueDate) }}</time>
      </p>
      <p class="amount num">{{ formatMoney(row.payment) }}</p>
    </div>
    <CompositionBar
      :interest-cents="row.interest"
      :principal-cents="row.principal"
      :charges-cents="row.charges"
    />
    <p class="balance num">Saldo depois: {{ formatMoney(row.balance) }}</p>
  </li>
</template>

<style scoped>
.slip {
  --notch: 9px;
  position: relative;
  isolation: isolate;
  display: grid;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5) var(--space-5);
  color: var(--ink);
  box-shadow: var(--shadow-stub);
}

.slip::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: var(--radius-slip);
  background:
    linear-gradient(to right, var(--rule) 6px, transparent 6px) left bottom / 12px 2px repeat-x,
    var(--slip);
  mask:
    radial-gradient(circle var(--notch) at 0 50%, #0000 98%, #000 100%),
    radial-gradient(circle var(--notch) at 100% 50%, #0000 98%, #000 100%);
  mask-composite: intersect;
  -webkit-mask:
    radial-gradient(circle var(--notch) at 0 50%, #0000 98%, #000 100%),
    radial-gradient(circle var(--notch) at 100% 50%, #0000 98%, #000 100%);
  -webkit-mask-composite: source-in;
}

.head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-1) var(--space-4);
}

.number {
  font-weight: 700;
}

.amount {
  font-size: var(--text-xl);
  font-weight: 700;
}

.balance {
  font-size: var(--text-sm);
}

.slip--enter {
  animation: descer var(--duration-carne) var(--ease-carne) both;
  animation-delay: calc(var(--slip-index) * var(--stagger-carne));
}

@keyframes descer {
  from {
    opacity: 0;
    transform: translateY(-12px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .slip--enter {
    animation: none;
  }
}
</style>
