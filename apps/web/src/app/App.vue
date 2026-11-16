<script setup lang="ts">
import { watch } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';

const route = useRoute();

/* Ao trocar de página, o foco vai para o <h1>, que o leitor de tela anuncia. */
watch(
  () => route.fullPath,
  () => {
    const heading = document.querySelector<HTMLHeadingElement>('#conteudo h1');
    if (!heading) return;
    heading.setAttribute('tabindex', '-1');
    heading.focus();
  },
  { flush: 'post' },
);
</script>

<template>
  <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
  <div class="shell">
    <header class="site-header">
      <RouterLink class="brand" to="/">Raio-X do Empréstimo</RouterLink>
      <nav class="nav" aria-label="Principal">
        <RouterLink to="/">Simular</RouterLink>
        <RouterLink to="/raio-x">Raio-X de oferta</RouterLink>
        <RouterLink to="/comparar">Comparar</RouterLink>
      </nav>
    </header>

    <main id="conteudo" class="content" tabindex="-1">
      <RouterView />
    </main>

    <footer class="site-footer">
      <p>
        Fontes das regras: Decreto nº 6.306/2007, para o IOF, e Resolução CMN nº 3.517/2007, para o
        CET.
      </p>
      <p><a href="/api/docs">Documentação da API</a></p>
      <p>Simulação educativa. Confira sempre o contrato do banco.</p>
    </footer>
  </div>
</template>

<style scoped>
.skip-link {
  position: absolute;
  top: var(--space-2);
  left: var(--space-4);
  z-index: 1;
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--ink);
  border-radius: var(--radius-control);
  background: var(--slip);
  transform: translateY(-200%);
}

.skip-link:focus {
  transform: none;
}

.shell {
  display: grid;
  gap: var(--space-6);
  width: 100%;
  max-width: 72rem;
  margin-inline: auto;
  padding: var(--space-5) var(--space-4) var(--space-7);
}

.site-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3) var(--space-5);
}

.brand {
  display: inline-flex;
  align-items: center;
  min-height: var(--target-min);
  font-size: var(--text-lg);
  font-weight: 700;
  text-decoration: none;
}

.nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1) var(--space-5);
}

.nav a {
  display: inline-flex;
  align-items: center;
  min-height: var(--target-min);
  text-decoration: none;
}

.nav a[aria-current='page'] {
  font-weight: 700;
  text-decoration: underline;
}

.content {
  min-width: 0;
}

.site-footer {
  display: grid;
  gap: var(--space-2);
  padding-top: var(--space-4);
  border-top: 1px solid var(--rule);
  font-size: var(--text-sm);
}

.site-footer a {
  display: inline-flex;
  align-items: center;
  min-height: var(--target-min);
}
</style>
