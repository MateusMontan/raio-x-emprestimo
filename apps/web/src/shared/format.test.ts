import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatMoney,
  formatMoneyInput,
  formatPercent,
  formatPercentInput,
  parseInteger,
  parseMoney,
  parsePercent,
} from './format';

describe('formatação de valores', () => {
  it('formata zero como R$ 0,00', () => {
    expect(formatMoney(0)).toBe('R$ 0,00');
  });

  it('formata centavos soltos com dois dígitos', () => {
    expect(formatMoney(5)).toBe('R$ 0,05');
    expect(formatMoney(1050)).toBe('R$ 10,50');
  });

  it('separa milhares com ponto', () => {
    expect(formatMoney(1_000_000)).toBe('R$ 10.000,00');
    expect(formatMoney(100_000_000_000)).toBe('R$ 1.000.000.000,00');
  });

  it('formata o texto do campo sem o prefixo', () => {
    expect(formatMoneyInput(1_000_000)).toBe('10.000,00');
  });

  it('formata percentual com duas casas por padrão', () => {
    expect(formatPercent(0.0292)).toBe('2,92%');
  });

  it('aceita outra quantidade de casas no percentual', () => {
    expect(formatPercent(0.0292, 1)).toBe('2,9%');
    expect(formatPercent(0.29, 0)).toBe('29%');
  });

  it('formata o percentual do campo sem o símbolo', () => {
    expect(formatPercentInput(0.025)).toBe('2,5');
    expect(formatPercentInput(0.07)).toBe('7');
  });

  it('formata data ISO em dd/mm/aaaa sem depender do fuso', () => {
    expect(formatDate('2026-12-15')).toBe('15/12/2026');
  });

  it('devolve o texto original quando a data não é ISO', () => {
    expect(formatDate('15/12/2026')).toBe('15/12/2026');
  });
});

describe('leitura de valores', () => {
  it('lê o texto pt-BR com milhares e centavos', () => {
    expect(parseMoney('10.000,00')).toBe(1_000_000);
  });

  it('lê zero e valores sem centavos', () => {
    expect(parseMoney('0')).toBe(0);
    expect(parseMoney('0,00')).toBe(0);
    expect(parseMoney('10000')).toBe(1_000_000);
  });

  it('lê milhões com dois pontos de milhar', () => {
    expect(parseMoney('1.000.000,00')).toBe(100_000_000);
  });

  it('aceita o prefixo R$ e espaços', () => {
    expect(parseMoney('R$ 10.000,00')).toBe(1_000_000);
  });

  it('completa uma casa decimal', () => {
    expect(parseMoney('10,5')).toBe(1050);
  });

  it('devolve null para texto que não é valor', () => {
    expect(parseMoney('')).toBeNull();
    expect(parseMoney('abc')).toBeNull();
    expect(parseMoney('10.00,00')).toBeNull();
    expect(parseMoney('1,234')).toBeNull();
    expect(parseMoney('1,2,3')).toBeNull();
    expect(parseMoney('-10')).toBeNull();
  });

  it('lê percentual pt-BR com vírgula', () => {
    expect(parsePercent('2,5')).toBe(0.025);
    expect(parsePercent('2,5%')).toBe(0.025);
    expect(parsePercent('2')).toBe(0.02);
  });

  it('devolve null para percentual inválido', () => {
    expect(parsePercent('')).toBeNull();
    expect(parsePercent('%')).toBeNull();
    expect(parsePercent('2,')).toBeNull();
    expect(parsePercent('dois')).toBeNull();
  });

  it('lê inteiros e devolve null para o resto', () => {
    expect(parseInteger('36')).toBe(36);
    expect(parseInteger(' 12 ')).toBe(12);
    expect(parseInteger('')).toBeNull();
    expect(parseInteger('1,5')).toBeNull();
    expect(parseInteger('-3')).toBeNull();
  });
});

describe('ida e volta', () => {
  it('lê de volta o que foi formatado em dinheiro', () => {
    for (const cents of [0, 5, 1050, 1_000_000, 123_456_789]) {
      expect(parseMoney(formatMoney(cents))).toBe(cents);
      expect(parseMoney(formatMoneyInput(cents))).toBe(cents);
    }
  });

  it('lê de volta o percentual formatado para o campo', () => {
    for (const decimal of [0, 0.025, 0.0292, 0.3]) {
      expect(parsePercent(formatPercentInput(decimal))).toBeCloseTo(decimal, 12);
    }
  });
});
