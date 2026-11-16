import { createRouter, createWebHistory, type RouterHistory } from 'vue-router';
import AnalyzePage from '../features/analyze/AnalyzePage.vue';
import ComparePage from '../features/compare/ComparePage.vue';
import SharePage from '../features/share/SharePage.vue';
import SimulatePage from '../features/simulate/SimulatePage.vue';
import NotFoundPage from './NotFoundPage.vue';

const NOME_DO_PRODUTO = 'Raio-X do Empréstimo';

declare module 'vue-router' {
  interface RouteMeta {
    title: string;
  }
}

/** Cria o roteador. O histórico é injetável para os testes. */
export function createAppRouter(history: RouterHistory = createWebHistory()) {
  const router = createRouter({
    history,
    routes: [
      { path: '/', name: 'simular', component: SimulatePage, meta: { title: 'Simular' } },
      {
        path: '/raio-x',
        name: 'raio-x',
        component: AnalyzePage,
        meta: { title: 'Raio-X de oferta' },
      },
      { path: '/comparar', name: 'comparar', component: ComparePage, meta: { title: 'Comparar' } },
      {
        path: '/s/:id',
        name: 'compartilhada',
        component: SharePage,
        meta: { title: 'Simulação compartilhada' },
      },
      {
        path: '/:pathMatch(.*)*',
        name: 'nao-encontrada',
        component: NotFoundPage,
        meta: { title: 'Página não encontrada' },
      },
    ],
  });

  router.afterEach((to) => {
    document.title = `${to.meta.title} | ${NOME_DO_PRODUTO}`;
  });

  return router;
}
