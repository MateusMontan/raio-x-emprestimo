<script setup lang="ts">
import type { FieldAttrs } from '../fieldAttrs';

/** Data no formato YYYY-MM-DD (valor do input nativo de data). */
defineProps<FieldAttrs>();
const model = defineModel<string>({ required: true });
</script>

<template>
  <div class="control">
    <input
      :id="id"
      v-model="model"
      type="date"
      :aria-describedby="describedBy"
      :aria-invalid="invalid ? 'true' : undefined"
    />
  </div>
</template>
