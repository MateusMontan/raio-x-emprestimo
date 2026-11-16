<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ScheduleRow } from '@raiox/contracts';
import BaseButton from '../../design/components/BaseButton.vue';
import CarneSlip from './CarneSlip.vue';
import ScheduleTable from './ScheduleTable.vue';

const props = defineProps<{ schedule: readonly ScheduleRow[]; animate: boolean }>();

const LIMITE_COMPLETO = 24;
const INICIO = 6;
const FIM = 3;
const TABELA_ID = 'tabela-parcelas';

const expandida = ref(false);
const resumido = computed(() => props.schedule.length > LIMITE_COMPLETO);
const primeiras = computed(() =>
  resumido.value ? props.schedule.slice(0, INICIO) : props.schedule,
);
const ultimas = computed(() => (resumido.value ? props.schedule.slice(-FIM) : []));
const omitidas = computed(() => props.schedule.length - INICIO - FIM);
</script>

<template>
  <div class="carne-wrap">
    <ol class="carne" aria-label="Parcelas">
      <CarneSlip
        v-for="(row, index) in primeiras"
        :key="row.n"
        :row="row"
        :total="schedule.length"
        :index="index"
        :animate="animate && index < INICIO"
      />
      <li v-if="resumido" class="gap" role="presentation">… {{ omitidas }} parcelas …</li>
      <CarneSlip
        v-for="row in ultimas"
        :key="row.n"
        :row="row"
        :total="schedule.length"
        :index="INICIO"
        :animate="false"
      />
    </ol>

    <template v-if="resumido">
      <BaseButton
        variant="secondary"
        :aria-expanded="expandida ? 'true' : 'false'"
        :aria-controls="TABELA_ID"
        @click="expandida = !expandida"
      >
        {{ expandida ? 'Ocultar a tabela' : 'Ver todas as parcelas' }}
      </BaseButton>
      <ScheduleTable v-if="expandida" :id="TABELA_ID" :schedule="schedule" />
    </template>
  </div>
</template>

<style scoped>
.carne-wrap {
  display: grid;
  gap: var(--space-4);
  justify-items: start;
  min-width: 0;
  width: 100%;
}

.carne {
  display: grid;
  gap: var(--space-2);
  width: 100%;
}

.gap {
  padding: var(--space-2) 0;
  text-align: center;
  font-weight: 700;
}
</style>
