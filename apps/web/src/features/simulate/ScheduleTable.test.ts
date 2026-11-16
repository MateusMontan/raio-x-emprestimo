import { mount } from '@vue/test-utils';
import type { ScheduleRow } from '@raiox/contracts';
import { describe, expect, it } from 'vitest';
import { formatMoney } from '../../shared/format';
import ScheduleTable from './ScheduleTable.vue';

const LINHAS: ScheduleRow[] = [
  {
    n: 1,
    dueDate: '2026-12-15',
    payment: 94_560,
    interest: 20_000,
    principal: 74_560,
    charges: 0,
    balance: 925_440,
  },
  {
    n: 2,
    dueDate: '2027-01-15',
    payment: 94_560,
    interest: 18_509,
    principal: 76_051,
    charges: 0,
    balance: 849_389,
  },
  {
    n: 3,
    dueDate: '2027-02-28',
    payment: 94_560,
    interest: 16_988,
    principal: 77_572,
    charges: 0,
    balance: 771_817,
  },
];

describe('ScheduleTable', () => {
  it('tem legenda e cabeçalhos de coluna', () => {
    const wrapper = mount(ScheduleTable, { props: { schedule: LINHAS } });

    expect(wrapper.find('caption').text()).toBe('Cronograma completo, parcela a parcela');
    const cabecalhos = wrapper.findAll('th[scope="col"]').map((th) => th.text());
    expect(cabecalhos).toEqual(['Nº', 'Vencimento', 'Parcela', 'Juros', 'Amortização', 'Saldo']);
  });

  it('tem uma linha por parcela com datas e valores formatados', () => {
    const wrapper = mount(ScheduleTable, { props: { schedule: LINHAS } });

    const linhas = wrapper.findAll('tbody tr');
    expect(linhas).toHaveLength(3);
    const primeira = linhas[0]?.findAll('td').map((td) => td.text());
    expect(primeira).toEqual([
      '1',
      '15/12/2026',
      formatMoney(94_560),
      formatMoney(20_000),
      formatMoney(74_560),
      formatMoney(925_440),
    ]);
  });

  it('é uma região rolável e focável no celular', () => {
    const wrapper = mount(ScheduleTable, { props: { schedule: LINHAS } });

    const regiao = wrapper.find('[role="region"]');
    expect(regiao.attributes('tabindex')).toBe('0');
    expect(regiao.attributes('aria-label')).toBeTruthy();
  });
});
