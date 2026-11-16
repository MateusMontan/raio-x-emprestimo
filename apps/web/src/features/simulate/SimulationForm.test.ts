import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import SimulationForm from './SimulationForm.vue';
import { createDefaultForm } from './simulationForm';

function mountPage(errors: Record<string, string> = {}) {
  return mount(SimulationForm, {
    props: { form: createDefaultForm('2026-11-15'), errors, loading: false },
    attachTo: document.body,
  });
}

describe('SimulationForm', () => {
  const mounted: { unmount: () => void }[] = [];

  afterEach(() => {
    for (const wrapper of mounted.splice(0)) wrapper.unmount();
  });

  function criar(errors: Record<string, string> = {}) {
    const wrapper = mountPage(errors);
    mounted.push(wrapper);
    return wrapper;
  }

  it('mostra os campos principais com os rótulos pedidos', () => {
    const wrapper = criar();

    const labels = wrapper.findAll('label').map((label) => label.text());
    expect(labels).toEqual(
      expect.arrayContaining([
        'Valor do empréstimo',
        'Taxa de juros ao mês',
        'Prazo',
        'Data da contratação',
        'Primeiro vencimento',
        'Tarifas e seguro',
      ]),
    );
  });

  it('envia o formulário com Enter sem validar pelo navegador', async () => {
    const wrapper = criar();

    await wrapper.find('form').trigger('submit');

    expect(wrapper.emitted('submit')).toHaveLength(1);
  });

  it('leva o foco ao primeiro campo inválido após o envio', async () => {
    const wrapper = criar({
      amountCents: 'Informe o valor.',
      installments: 'O prazo vai de 1 a 420 meses.',
    });

    await wrapper.find('form').trigger('submit');
    await nextTick();

    expect(document.activeElement?.id).toBe('valor');
  });

  it('abre o bloco "Mais opções" para focar um campo escondido', async () => {
    const wrapper = criar({ contractDate: 'Informe a data.' });

    await wrapper.find('form').trigger('submit');
    await nextTick();

    const details = wrapper.find('details').element;
    expect(details.open).toBe(true);
    expect(document.activeElement?.id).toBe('contratacao');
  });

  it('não move o foco quando o envio está válido', async () => {
    const wrapper = criar();
    const button = wrapper.find('button[type="submit"]').element as HTMLElement;
    button.focus();

    await wrapper.find('form').trigger('submit');
    await nextTick();

    expect(document.activeElement).toBe(button);
  });

  it('marca o botão Calcular como ocupado durante o carregamento', () => {
    const wrapper = mount(SimulationForm, {
      props: { form: createDefaultForm('2026-11-15'), errors: {}, loading: true },
    });

    expect(wrapper.find('button[type="submit"]').attributes('aria-busy')).toBe('true');
  });
});
