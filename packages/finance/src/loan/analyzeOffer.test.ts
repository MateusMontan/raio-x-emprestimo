import { describe, expect, it } from 'vitest';
import { InvalidInputError } from '../errors';
import { analyzeOffer } from './analyzeOffer';

const offer = {
  releasedCents: 500_000,
  paymentCents: 50_000,
  installments: 12,
  contractDate: '2026-11-15',
} as const;

describe('analyzeOffer (F2, Raio-X)', () => {
  it('critério 3: liberado R$ 5.000,00, parcela R$ 500,00, 12 meses → taxa implícita ≈ 2,92% a.m.', () => {
    const result = analyzeOffer(offer);
    expect(result.impliedMonthlyRate * 100).toBeCloseTo(2.92, 2);
  });

  it('taxa anual implícita é (1 + mensal)^12 − 1', () => {
    const result = analyzeOffer(offer);
    expect(result.impliedAnnualRate).toBeCloseTo((1 + result.impliedMonthlyRate) ** 12 - 1, 12);
  });

  it('CET da oferta é maior que a taxa implícita quando o liberado é menor que o valor pago', () => {
    const result = analyzeOffer(offer);
    expect(result.cetMonthly).toBeGreaterThan(result.impliedMonthlyRate);
  });

  it('total pago e custo: pago = parcela × n e custo = pago − liberado', () => {
    const result = analyzeOffer(offer);
    expect(result.totalPaidCents).toBe(600_000);
    expect(result.costCents).toBe(100_000);
  });

  it('usa o primeiro vencimento informado para calcular o CET', () => {
    const later = analyzeOffer({ ...offer, firstDueDate: '2027-01-15' });
    const standard = analyzeOffer(offer);
    expect(later.firstDueDate).toBe('2027-01-15');
    expect(later.cetAnnual).toBeLessThan(standard.cetAnnual);
  });

  it('parcela igual ao liberado dividido por n resulta em taxa zero e CET zero', () => {
    const result = analyzeOffer({ ...offer, releasedCents: 600_000, paymentCents: 50_000 });
    expect(result.impliedMonthlyRate).toBeCloseTo(0, 9);
    expect(result.cetMonthly).toBeCloseTo(0, 8);
  });

  it('rejeita valores não inteiros ou não positivos', () => {
    expect(() => analyzeOffer({ ...offer, releasedCents: 0 })).toThrow(InvalidInputError);
    expect(() => analyzeOffer({ ...offer, releasedCents: 1.5 })).toThrow(InvalidInputError);
    expect(() => analyzeOffer({ ...offer, paymentCents: -1 })).toThrow(InvalidInputError);
    expect(() => analyzeOffer({ ...offer, installments: 0 })).toThrow(InvalidInputError);
  });

  it('rejeita primeiro vencimento anterior à contratação', () => {
    expect(() => analyzeOffer({ ...offer, firstDueDate: '2026-11-01' })).toThrow(
      'Primeiro vencimento não pode ser anterior',
    );
  });

  it('resultado é serializável em JSON sem perda', () => {
    const result = analyzeOffer(offer);
    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
  });
});
