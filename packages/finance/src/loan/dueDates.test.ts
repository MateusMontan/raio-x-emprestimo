import { describe, expect, it } from 'vitest';
import { IsoDate } from '../date/IsoDate';
import { dueDatesFrom, resolveDates } from './resolveDates';

describe('datas de vencimento (R6)', () => {
  it('gera vencimentos no mesmo dia dos meses seguintes', () => {
    const dates = dueDatesFrom(IsoDate.parse('2026-03-15'), 3).map((d) => d.value);
    expect(dates).toEqual(['2026-03-15', '2026-04-15', '2026-05-15']);
  });

  it('usa o último dia do mês quando o dia não existe, sem perder o dia original depois', () => {
    const dates = dueDatesFrom(IsoDate.parse('2026-01-31'), 4).map((d) => d.value);
    expect(dates).toEqual(['2026-01-31', '2026-02-28', '2026-03-31', '2026-04-30']);
  });

  it('padrão do primeiro vencimento é contratação + 30 dias', () => {
    const { contract, firstDue } = resolveDates('2026-02-01');
    expect(contract.daysUntil(firstDue)).toBe(30);
  });

  it('aceita primeiro vencimento igual à contratação (prazo zero)', () => {
    const { contract, firstDue } = resolveDates('2026-02-01', '2026-02-01');
    expect(contract.daysUntil(firstDue)).toBe(0);
  });
});
