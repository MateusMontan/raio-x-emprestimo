<script setup lang="ts">
import type { ScheduleRow } from '@raiox/contracts';
import { formatDate, formatMoney } from '../../shared/format';

defineProps<{ schedule: readonly ScheduleRow[] }>();
</script>

<template>
  <div class="scroll" role="region" aria-label="Tabela completa de parcelas" tabindex="0">
    <table>
      <caption>
        Cronograma completo, parcela a parcela
      </caption>
      <thead>
        <tr>
          <th scope="col">Nº</th>
          <th scope="col">Vencimento</th>
          <th scope="col">Parcela</th>
          <th scope="col">Juros</th>
          <th scope="col">Amortização</th>
          <th scope="col">Saldo</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in schedule" :key="row.n">
          <td>{{ row.n }}</td>
          <td>{{ formatDate(row.dueDate) }}</td>
          <td class="num">{{ formatMoney(row.payment) }}</td>
          <td class="num">{{ formatMoney(row.interest) }}</td>
          <td class="num">{{ formatMoney(row.principal) }}</td>
          <td class="num">{{ formatMoney(row.balance) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.scroll {
  width: 100%;
  overflow-x: auto;
  background: var(--slip);
  border: 1px solid var(--rule);
  border-radius: var(--radius-slip);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}

caption {
  padding: var(--space-3);
  text-align: left;
  font-weight: 700;
}

th,
td {
  padding: var(--space-2) var(--space-3);
  border-top: 1px solid var(--rule);
  text-align: left;
  white-space: nowrap;
}

th[scope='col'] {
  font-weight: 700;
}

th[scope='col']:not(:first-child),
td.num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
</style>
