<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary';
    type?: 'button' | 'submit';
    loading?: boolean;
    loadingLabel?: string;
  }>(),
  { variant: 'primary', type: 'button', loading: false, loadingLabel: 'Calculando…' },
);
const emit = defineEmits<{ click: [event: MouseEvent] }>();

function onClick(event: MouseEvent): void {
  if (props.loading) {
    event.preventDefault();
    return;
  }
  emit('click', event);
}
</script>

<template>
  <button
    :type="type"
    :class="['button', `button--${variant}`, { 'button--loading': loading }]"
    :aria-busy="loading ? 'true' : undefined"
    @click="onClick"
  >
    <template v-if="loading">
      <!-- O rótulo visível fica escondido do leitor; o nome acessível vira o loadingLabel. -->
      <span aria-hidden="true"><slot /></span>
      <span class="visually-hidden">{{ loadingLabel }}</span>
    </template>
    <slot v-else />
  </button>
</template>

<style scoped>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--target-min);
  padding: var(--space-2) var(--space-5);
  border: 1px solid var(--ink);
  border-radius: var(--radius-control);
  font-weight: 700;
  cursor: pointer;
}

.button--primary {
  background: var(--ink);
  color: var(--slip);
}

.button--secondary {
  background: var(--slip);
  color: var(--ink);
}

.button--loading {
  cursor: progress;
  opacity: 0.8;
}
</style>
