import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils';
import { offerInputSchema } from '@raiox/contracts';
import { createMemoryHistory, createRouter } from 'vue-router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import AddToComparison from './AddToComparison.vue';
import { useComparison } from './useComparison';

const entry = offerInputSchema.parse({
  releasedCents: 500_000,
  paymentCents: 50_000,
  installments: 12,
  contractDate: '2026-11-15',
});

async function createTestRouter() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { render: () => null } },
      { path: '/comparar', component: { render: () => null } },
    ],
  });
  await router.push('/');
  await router.isReady();
  return router;
}

async function mountPage() {
  const router = await createTestRouter();
  const wrapper = mount(AddToComparison, {
    props: { kind: 'offer', input: entry },
    global: { plugins: [router], stubs: { RouterLink: RouterLinkStub } },
  });
  return { wrapper, router };
}

describe('AddToComparison', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    useComparison().clear();
  });

  afterEach(() => {
    useComparison().clear();
  });

  it('adiciona o cenário e navega para /comparar', async () => {
    const { wrapper, router } = await mountPage();

    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(useComparison().scenarios.value).toHaveLength(1);
    expect(useComparison().scenarios.value[0]?.kind).toBe('offer');
    expect(router.currentRoute.value.path).toBe('/comparar');
    wrapper.unmount();
  });

  it('mostra o aviso quando a comparação já tem três ofertas', async () => {
    const { add } = useComparison();
    add({ kind: 'offer', input: entry });
    add({ kind: 'offer', input: entry });
    add({ kind: 'offer', input: entry });
    const { wrapper, router } = await mountPage();

    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(wrapper.find('[aria-live="polite"]').text()).toContain(
      'Você já tem 3 ofertas na comparação. Remova uma para adicionar outra.',
    );
    expect(wrapper.findComponent(RouterLinkStub).props('to')).toBe('/comparar');
    expect(useComparison().scenarios.value).toHaveLength(3);
    expect(router.currentRoute.value.path).toBe('/');
    wrapper.unmount();
  });
});
