<script setup lang="ts">
/*
 * Explica um termo sem hover: um <details> abre com teclado e é anunciado
 * como expandido/recolhido pelos leitores de tela.
 */
defineProps<{ term: string; explanation: string }>();
</script>

<template>
  <details class="term-hint">
    <summary>O que é {{ term }}</summary>
    <p class="explanation">{{ explanation }}</p>
  </details>
</template>

<style scoped>
.term-hint {
  display: inline-block;
  max-width: var(--measure);
}

summary {
  display: inline-flex;
  align-items: center;
  min-height: var(--target-min);
  cursor: pointer;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 0.2em;
}

.explanation {
  padding-bottom: var(--space-2);
}
</style>
