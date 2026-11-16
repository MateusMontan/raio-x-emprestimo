import { describe, expect, it } from 'vitest';
import { Money } from '../money/Money';
import { Rate } from '../rate/Rate';
import { PriceSchedule } from './PriceSchedule';
import { SacSchedule } from './SacSchedule';
import { strategyFor } from './strategyFor';

const reais = (value: number) => Money.fromReais(value);
const monthly = (value: number) => Rate.monthly(value);

describe('PriceSchedule (R1)', () => {
  it('calcula PMT de R$ 945,60 para R$ 10.000,00 a 2% a.m. em 12 meses', () => {
    const rows = new PriceSchedule().plan(reais(10_000), monthly(0.02), 12);
    expect(rows[0]?.payment.cents).toBe(94_560);
    expect(rows).toHaveLength(12);
  });

  it('soma das parcelas é 12 × PMT ajustado pelo resíduo da última (critério 1, ver nota)', () => {
    // Critério 1 cita R$ 11.347,20 (= 12 × R$ 945,60). Com PMT arredondado, o saldo
    // desce 0,05 a mais e a última parcela absorve esse resíduo (R1): total R$ 11.347,15.
    const rows = new PriceSchedule().plan(reais(10_000), monthly(0.02), 12);
    const total = rows.reduce((sum, row) => sum + row.payment.cents, 0);
    expect(total).toBe(1_134_715);
    expect(rows.at(-1)?.payment.cents).toBe(94_555);
  });

  it('fecha o saldo em exatamente zero, absorvendo o resíduo na última parcela', () => {
    const rows = new PriceSchedule().plan(reais(10_000), monthly(0.02), 12);
    expect(rows.at(-1)?.balance.cents).toBe(0);
  });

  it('juros de cada período são calculados sobre o saldo anterior', () => {
    const rows = new PriceSchedule().plan(reais(10_000), monthly(0.02), 12);
    expect(rows[0]?.interest.cents).toBe(20_000);
    expect(rows[1]?.interest.cents).toBe(Math.round((rows[0]?.balance.cents ?? 0) * 0.02));
  });

  it('com taxa zero divide o principal igualmente, com resíduo na última', () => {
    const rows = new PriceSchedule().plan(Money.fromCents(1_000), monthly(0), 3);
    expect(rows.map((row) => row.payment.cents)).toEqual([333, 333, 334]);
    expect(rows.at(-1)?.balance.cents).toBe(0);
    expect(rows.every((row) => row.interest.isZero())).toBe(true);
  });

  it('com n = 1 cobra principal mais juros em uma única parcela', () => {
    const rows = new PriceSchedule().plan(reais(1_000), monthly(0.05), 1);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.payment.cents).toBe(105_000);
    expect(rows[0]?.balance.cents).toBe(0);
  });

  it('rejeita número de parcelas que não é inteiro positivo', () => {
    expect(() => new PriceSchedule().plan(reais(100), monthly(0.01), 0)).toThrow(
      'Número de parcelas',
    );
    expect(() => new PriceSchedule().plan(reais(100), monthly(0.01), 1.5)).toThrow(
      'Número de parcelas',
    );
  });
});

describe('SacSchedule (R2)', () => {
  it('primeira parcela R$ 1.120,00 e última R$ 1.010,00 para R$ 12.000,00 a 1% a.m. (critério 2)', () => {
    const rows = new SacSchedule().plan(reais(12_000), monthly(0.01), 12);
    expect(rows[0]?.payment.cents).toBe(112_000);
    expect(rows.at(-1)?.payment.cents).toBe(101_000);
  });

  it('amortização constante e saldo final zero', () => {
    const rows = new SacSchedule().plan(reais(12_000), monthly(0.01), 12);
    expect(rows.slice(0, -1).every((row) => row.principal.cents === 100_000)).toBe(true);
    expect(rows.at(-1)?.balance.cents).toBe(0);
  });

  it('resíduo de arredondamento vai para a última amortização', () => {
    const rows = new SacSchedule().plan(Money.fromCents(100), monthly(0), 3);
    expect(rows.map((row) => row.principal.cents)).toEqual([33, 33, 34]);
    expect(rows.at(-1)?.balance.cents).toBe(0);
  });

  it('com taxa zero as parcelas são só amortização', () => {
    const rows = new SacSchedule().plan(reais(600), monthly(0), 6);
    expect(rows.map((row) => row.payment.cents)).toEqual([
      10_000, 10_000, 10_000, 10_000, 10_000, 10_000,
    ]);
  });
});

describe('strategyFor', () => {
  it('devolve a estratégia correspondente ao sistema', () => {
    expect(strategyFor('PRICE').system).toBe('PRICE');
    expect(strategyFor('SAC').system).toBe('SAC');
  });
});
