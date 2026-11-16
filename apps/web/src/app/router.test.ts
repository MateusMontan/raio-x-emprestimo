import { mount } from '@vue/test-utils';
import { createMemoryHistory } from 'vue-router';
import { describe, expect, it } from 'vitest';
import App from './App.vue';
import { createAppRouter } from './router';

describe('roteamento', () => {
  it('mostra a 404 com o botão Nova simulação para rota desconhecida', async () => {
    const router = createAppRouter(createMemoryHistory());
    await router.push('/rota-que-nao-existe');
    await router.isReady();

    const wrapper = mount(App, { global: { plugins: [router] } });

    expect(wrapper.find('h1').text()).toBe('Página não encontrada');
    expect(wrapper.text()).toContain('Esta página não existe ou o link expirou.');
    const botao = wrapper.findAll('a').find((link) => link.text() === 'Nova simulação');
    expect(botao?.attributes('href')).toBe('/');
  });

  it('atualiza o título do documento ao trocar de página', async () => {
    const router = createAppRouter(createMemoryHistory());
    await router.push('/comparar');
    await router.isReady();

    mount(App, { global: { plugins: [router] } });

    expect(document.title).toBe('Comparar | Raio-X do Empréstimo');
  });

  it('marca a rota ativa na navegação com aria-current', async () => {
    const router = createAppRouter(createMemoryHistory());
    await router.push('/raio-x');
    await router.isReady();

    const wrapper = mount(App, { global: { plugins: [router] } });

    const ativo = wrapper.find('nav a[aria-current="page"]');
    expect(ativo.text()).toBe('Raio-X de oferta');
  });
});
