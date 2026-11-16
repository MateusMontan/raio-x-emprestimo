<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ScheduleRow } from '@raiox/contracts';
import BaseButton from '../../design/components/BaseButton.vue';
import CarneSlip from './CarneSlip.vue';
import ScheduleTable from './ScheduleTable.vue';

const props = defineProps<{ schedule: readonly ScheduleRow[]; animate: boolean }>();

const FULL_LIST_LIMIT = 24;
const START = 6;
const END = 3;
const TABLE_ID = 'tabela-parcelas';

const expanded = ref(false);
const summarized = computed(() => props.schedule.length > FULL_LIST_LIMIT);
const firstItems = computed(() =>
  summarized.value ? props.schedule.slice(0, START) : props.schedule,
);
const lastItems = computed(() => (summarized.value ? props.schedule.slice(-END) : []));
const omitted = computed(() => props.schedule.length - START - END);
</script>

<template>
  <div class="carne-wrap">
    <ol class="carne" aria-label="Parcelas">
      <CarneSlip
        v-for="(row, index) in firstItems"
        :key="row.n"
        :row="row"
        :total="schedule.length"
        :index="index"
        :animate="animate && index < START"
      />
      <li v-if="summarized" class="gap" role="presentation">… {{ omitted }} parcelas …</li>
      <CarneSlip
        v-for="row in lastItems"
        :key="row.n"
        :row="row"
        :total="schedule.length"
        :index="START"
        :animate="false"
      />
    </ol>

    <template v-if="summarized">
      <BaseButton
        variant="secondary"
        :aria-expanded="expanded ? 'true' : 'false'"
        :aria-controls="TABLE_ID"
        @click="expanded = !expanded"
      >
        {{ expanded ? 'Ocultar a tabela' : 'Ver todas as parcelas' }}
      </BaseButton>
      <ScheduleTable v-if="expanded" :id="TABLE_ID" :schedule="schedule" />
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
