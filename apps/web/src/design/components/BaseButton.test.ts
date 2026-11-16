import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import BaseButton from './BaseButton.vue';

describe('BaseButton', () => {
  it('ganha nome acessível de carregamento enquanto está ocupado', () => {
    const wrapper = mount(BaseButton, {
      props: { loading: true, loadingLabel: 'Calculando…' },
      slots: { default: 'Calcular' },
    });

    expect(wrapper.attributes('aria-busy')).toBe('true');
    expect(wrapper.find('.visually-hidden').text()).toBe('Calculando…');
    expect(wrapper.find('[aria-hidden="true"]').text()).toBe('Calcular');
  });

  it('mantém o rótulo normal quando não está carregando', () => {
    const wrapper = mount(BaseButton, { slots: { default: 'Calcular' } });

    expect(wrapper.attributes('aria-busy')).toBeUndefined();
    expect(wrapper.find('.visually-hidden').exists()).toBe(false);
    expect(wrapper.text()).toBe('Calcular');
  });
});
