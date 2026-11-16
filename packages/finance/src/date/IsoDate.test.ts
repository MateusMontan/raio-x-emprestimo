import { describe, expect, it } from 'vitest';
import { InvalidInputError } from '../errors';
import { IsoDate } from './IsoDate';

describe('IsoDate', () => {
  it('faz parse de YYYY-MM-DD e devolve o mesmo texto', () => {
    expect(IsoDate.parse('2026-03-05').value).toBe('2026-03-05');
    expect(IsoDate.parse('2026-03-05').toString()).toBe('2026-03-05');
  });

  it('rejeita formatos diferentes de YYYY-MM-DD', () => {
    expect(() => IsoDate.parse('05/03/2026')).toThrow(InvalidInputError);
    expect(() => IsoDate.parse('2026-3-5')).toThrow(InvalidInputError);
    expect(() => IsoDate.parse('2026-03-05T10:00:00Z')).toThrow(InvalidInputError);
  });

  it('rejeita datas inexistentes, incluindo 29/fev em ano não bissexto', () => {
    expect(() => IsoDate.parse('2026-02-29')).toThrow('Data inexistente');
    expect(() => IsoDate.parse('2026-13-01')).toThrow('Data inexistente');
    expect(() => IsoDate.parse('2026-04-31')).toThrow('Data inexistente');
  });

  it('aceita 29/fev em ano bissexto', () => {
    expect(IsoDate.parse('2028-02-29').value).toBe('2028-02-29');
  });

  it('soma dias corridos atravessando meses e anos', () => {
    expect(IsoDate.parse('2026-12-20').addDays(30).value).toBe('2027-01-19');
    expect(IsoDate.parse('2026-01-31').addDays(30).value).toBe('2026-03-02');
  });

  it('soma meses com clamp no último dia do mês (31/jan + 1 = 28/fev)', () => {
    expect(IsoDate.parse('2026-01-31').addMonths(1).value).toBe('2026-02-28');
    expect(IsoDate.parse('2028-01-31').addMonths(1).value).toBe('2028-02-29');
  });

  it('calcula a partir da data original, sem encadear o clamp (31/jan + 2 = 31/mar)', () => {
    const base = IsoDate.parse('2026-01-31');
    expect(base.addMonths(2).value).toBe('2026-03-31');
    expect(base.addMonths(3).value).toBe('2026-04-30');
    expect(base.addMonths(12).value).toBe('2027-01-31');
  });

  it('soma meses atravessando o ano', () => {
    expect(IsoDate.parse('2026-11-15').addMonths(3).value).toBe('2027-02-15');
    expect(IsoDate.parse('2026-11-15').addMonths(-11).value).toBe('2025-12-15');
  });

  it('conta dias entre datas, com sinal', () => {
    const a = IsoDate.parse('2026-01-01');
    expect(a.daysUntil(IsoDate.parse('2026-01-31'))).toBe(30);
    expect(IsoDate.parse('2026-01-31').daysUntil(a)).toBe(-30);
    expect(a.daysUntil(a)).toBe(0);
  });

  it('compara igualdade por valor', () => {
    expect(IsoDate.parse('2026-05-05').equals(IsoDate.parse('2026-05-05'))).toBe(true);
    expect(IsoDate.parse('2026-05-05').equals(IsoDate.parse('2026-05-06'))).toBe(false);
  });
});
