<script setup lang="ts">
/*
 * Região que anuncia mudanças para leitores de tela. Fica sempre no DOM (um
 * anúncio nasce junto com o conteúdo não é lido) e não aparece na tela.
 */
defineProps<{ text: string }>();
</script>

<template>
  <p class="visually-hidden" aria-live="polite" aria-atomic="true">{{ text }}</p>
</template>
