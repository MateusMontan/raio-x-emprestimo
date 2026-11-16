<script setup lang="ts"></script>

<template>
  <section class="not-found">
    <h1 tabindex="-1">Página não encontrada</h1>
    <p>Esta página não existe ou o link expirou.</p>
    <RouterLink class="action" to="/">Nova simulação</RouterLink>
  </section>
</template>

<style scoped>
.not-found {
  display: grid;
  gap: var(--space-4);
  justify-items: start;
}

.action {
  display: inline-flex;
  align-items: center;
  min-height: var(--target-min);
  padding: var(--space-2) var(--space-5);
  border: 1px solid var(--ink);
  border-radius: var(--radius-control);
  background: var(--ink);
  color: var(--slip);
  font-weight: 700;
  text-decoration: none;
}
</style>
