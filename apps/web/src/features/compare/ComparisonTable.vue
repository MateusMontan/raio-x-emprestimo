<script setup lang="ts">
import type { Scenario } from './scenario';
import { COMPARISON_ROWS, SEAL_TEXT, type SealKind } from './comparisonRows';
import type { ScenarioState } from './useScenarioResults';

export interface ComparisonColumn {
  scenario: Scenario;
  state: ScenarioState;
}

export interface Seals {
  cet: ReadonlySet<string>;
  total: ReadonlySet<string>;
}

const props = defineProps<{ columns: readonly ComparisonColumn[]; seals: Seals }>();
const emit = defineEmits<{
  rename: [id: string, label: string];
  remove: [id: string];
  retry: [id: string];
}>();

function hasSeal(kind: SealKind | undefined, id: string): boolean {
  if (kind === undefined) return false;
  return props.seals[kind].has(id);
}

function onRename(id: string, event: Event): void {
  if (event.target instanceof HTMLInputElement) emit('rename', id, event.target.value);
}
</script>

<template>
  <div class="scroll" role="region" aria-label="Tabela comparativa das ofertas" tabindex="0">
    <table class="table">
      <caption>
        Ofertas lado a lado
      </caption>
      <thead>
        <tr>
          <th scope="col"><span class="sr-only">Dado</span></th>
          <th v-for="(column, index) in columns" :key="column.scenario.id" scope="col">
            <div class="head">
              <input
                type="text"
                class="name"
                maxlength="60"
                :aria-label="`Nome da oferta ${index + 1}`"
                :value="column.scenario.label"
                @input="onRename(column.scenario.id, $event)"
              />
              <button
                type="button"
                class="remove"
                :aria-label="`Remover Oferta ${index + 1}`"
                @click="emit('remove', column.scenario.id)"
              >
                Remover
              </button>
              <p v-if="column.state.status === 'loading'" class="status" role="status">
                Calculando…
              </p>
              <template v-else-if="column.state.status === 'error'">
                <p class="status status--error">{{ column.state.message }}</p>
                <button type="button" class="retry" @click="emit('retry', column.scenario.id)">
                  Tentar de novo
                </button>
              </template>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in COMPARISON_ROWS" :key="row.key">
          <th scope="row">{{ row.label }}</th>
          <td v-for="column in columns" :key="column.scenario.id" class="num">
            <template v-if="column.state.status === 'ready'">
              <span>{{ row.cell(column.state.result) }}</span>
              <span v-if="row.seal && hasSeal(row.seal, column.scenario.id)" class="seal">
                {{ SEAL_TEXT[row.seal] }}
              </span>
            </template>
            <span v-else aria-hidden="true">—</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.scroll {
  overflow-x: auto;
  min-width: 0;
  border-top: 1px solid var(--rule);
}

.scroll:focus-visible {
  outline: 3px solid var(--ink);
  outline-offset: 2px;
}

.table {
  width: 100%;
  min-width: 36rem;
  border-collapse: collapse;
  text-align: left;
}

caption {
  padding: var(--space-3) 0;
  text-align: left;
  font-weight: 700;
}

th,
td {
  padding: var(--space-3);
  border-bottom: 1px solid var(--rule);
  vertical-align: top;
}

thead th {
  min-width: 11rem;
}

tbody th {
  font-weight: 400;
  white-space: nowrap;
}

.num {
  font-variant-numeric: tabular-nums;
}

.head {
  display: grid;
  gap: var(--space-2);
  justify-items: start;
}

.name {
  width: 100%;
  box-sizing: border-box;
  min-height: var(--target-min);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--ink);
  border-radius: var(--radius-control);
  background: var(--slip);
  color: var(--ink);
  font: inherit;
  font-weight: 700;
}

.remove,
.retry {
  min-height: var(--target-min);
  padding: 0 var(--space-2);
  border: 0;
  background: none;
  color: var(--ink);
  font: inherit;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
}

.status {
  margin: 0;
  font-weight: 400;
}

.status--error {
  color: var(--interest);
  font-weight: 700;
}

.seal {
  display: inline-block;
  margin-left: var(--space-2);
  padding: 0 var(--space-2);
  border: 1px solid var(--principal);
  border-radius: var(--radius-control);
  color: var(--principal);
  font-size: var(--text-sm);
  font-weight: 700;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>
