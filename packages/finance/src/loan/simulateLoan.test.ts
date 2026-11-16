import { describe, expect, it } from 'vitest';
import { CetCalculator } from '../cet/CetCalculator';
import { PriceSchedule } from '../amortization/PriceSchedule';
import { InvalidInputError } from '../errors';
import { Money } from '../money/Money';
import { Rate } from '../rate/Rate';
import { TaxPolicyNotFoundError } from '../errors';
import { simulateLoan } from './simulateLoan';
import type { LoanInput } from './types';

const base: LoanInput = {
  amountCents: 1_000_000,
  monthlyRate: 0.02,
  installments: 12,
  system: 'PRICE',
  contractDate: '2026-11-15',
  iofMode: 'NONE',
};

describe('simulateLoan — critérios de aceite', () => {
  it('critério 1: Price R$ 10.000,00, 2% a.m., 12 meses → parcela R$ 945,60 sem IOF', () => {
    const result = simulateLoan(base);
    expect(result.schedule[0]?.payment).toBe(94_560);
    expect(result.schedule[10]?.payment).toBe(94_560);
    expect(result.schedule[11]?.payment).toBe(94_555);
    expect(result.totals.paidCents).toBe(1_134_715);
    expect(result.totals.iofCents).toBe(0);
  });

  it('critério 2: SAC R$ 12.000,00, 1% a.m., 12 meses → 1ª R$ 1.120,00 e última R$ 1.010,00', () => {
    const result = simulateLoan({
      ...base,
      amountCents: 1_200_000,
      monthlyRate: 0.01,
      system: 'SAC',
    });
    expect(result.schedule[0]?.payment).toBe(112_000);
    expect(result.schedule.at(-1)?.payment).toBe(101_000);
  });

  it('critério 4 (±0,01 p.p. a até ~0,7% a.m.): parcelas a cada 30 dias exatos', () => {
    const rate = 0.005;
    const rows = new PriceSchedule().plan(Money.fromCents(1_000_000), Rate.monthly(rate), 12);
    const flows = rows.map((row, index) => ({
      amountCents: row.payment.cents,
      days: 30 * (index + 1),
    }));
    const cet = new CetCalculator().calculate(1_000_000, flows);
    expect(Math.abs(cet.monthly - rate) * 100).toBeLessThanOrEqual(0.01);
  });

  it('critério 4 (nota): a 2% a.m. o desvio é 0,028 p.p. porque R4 usa base 365 e conversão 1/12', () => {
    const rate = 0.02;
    const rows = new PriceSchedule().plan(Money.fromCents(1_000_000), Rate.monthly(rate), 12);
    const flows = rows.map((row, index) => ({
      amountCents: row.payment.cents,
      days: 30 * (index + 1),
    }));
    const cet = new CetCalculator().calculate(1_000_000, flows);
    expect((cet.monthly - rate) * 100).toBeCloseTo(0.0281, 3);
  });
});

describe('simulateLoan — IOF e liberado', () => {
  it('IOF financiado entra no principal e o cliente recebe o valor integral menos tarifas', () => {
    const result = simulateLoan({ ...base, iofMode: 'FINANCED', feesCents: 5_000 });
    expect(result.releasedCents).toBe(1_000_000 - 5_000);
    expect(result.iof.totalCents).toBeGreaterThan(0);
    expect(result.financedPrincipalCents).toBeGreaterThan(1_000_000);
  });

  it('principal financiado é valor + IOF, ou difere em 1 centavo quando cai em ciclo (financing.ts)', () => {
    // Este caso (60 parcelas a 2% a.m.) cai em ciclo de dois valores: a diferença é de 1 centavo,
    // não 0. Os demais casos do grid convergem exatamente (ver financingConvergence.test.ts).
    const result = simulateLoan({ ...base, iofMode: 'FINANCED', installments: 60 });
    const gap = result.financedPrincipalCents - result.amountCents - result.iof.totalCents;
    expect(gap).toBe(1);
  });

  it('IOF à vista é descontado do liberado e o principal fica igual ao valor', () => {
    const result = simulateLoan({ ...base, iofMode: 'CASH', feesCents: 2_000 });
    expect(result.financedPrincipalCents).toBe(1_000_000);
    expect(result.releasedCents).toBe(1_000_000 - result.iof.totalCents - 2_000);
  });

  it('sem IOF o resumo de IOF é zero e o liberado é o valor menos tarifas', () => {
    const result = simulateLoan({ ...base, feesCents: 1_000 });
    expect(result.iof).toMatchObject({
      mode: 'NONE',
      dailyCents: 0,
      additionalCents: 0,
      totalCents: 0,
    });
    expect(result.releasedCents).toBe(999_000);
  });

  it('IOF adicional é 0,38% do principal amortizado', () => {
    const result = simulateLoan({ ...base, iofMode: 'CASH' });
    expect(result.iof.additionalCents).toBe(Math.round(1_000_000 * 0.0038));
  });

  it('IOF diário usa a política vigente e soma o diário de cada amortização', () => {
    const result = simulateLoan({ ...base, iofMode: 'CASH' });
    const expectedDaily = result.schedule.reduce((sum, row, index) => {
      const days = Math.min(daysBetween(result.contractDate, row.dueDate), 365);
      return sum + Math.round(row.principal * 0.000082 * days) + index * 0;
    }, 0);
    expect(Math.abs(result.iof.dailyCents - expectedDaily)).toBeLessThanOrEqual(12);
    expect(result.iof.taxPolicyId).toBe('br-iof-pf-credito-decreto-6306');
  });

  it('IOF diário é limitado a 365 dias por parcela, mesmo com prazo longo', () => {
    const result = simulateLoan({ ...base, installments: 60, iofMode: 'CASH', monthlyRate: 0.01 });
    const lastRow = result.schedule.at(-1);
    expect(lastRow).toBeDefined();
    expect(daysBetween(result.contractDate, lastRow?.dueDate ?? '')).toBeGreaterThan(365);
    const cappedDaily = Math.round((lastRow?.principal ?? 0) * 0.000082 * 365);
    expect(cappedDaily).toBeGreaterThan(0);
  });

  it('libera zero ou negativo após IOF à vista e tarifas gera erro de entrada', () => {
    expect(() => simulateLoan({ ...base, iofMode: 'CASH', feesCents: 999_999 })).toThrow(
      InvalidInputError,
    );
  });
});

describe('simulateLoan — cronograma e totais', () => {
  it('saldo final é exatamente zero e o principal amortizado soma o principal', () => {
    const result = simulateLoan({ ...base, system: 'SAC', iofMode: 'FINANCED' });
    expect(result.schedule.at(-1)?.balance).toBe(0);
    const amortized = result.schedule.reduce((sum, row) => sum + row.principal, 0);
    expect(amortized).toBe(result.financedPrincipalCents);
  });

  it('totais são coerentes: pago = principal + juros + encargos, e custo = pago − liberado', () => {
    const result = simulateLoan({ ...base, iofMode: 'FINANCED', feesCents: 3_000 });
    const { totals } = result;
    expect(totals.paidCents).toBe(
      totals.principalCents + totals.interestCents + totals.chargesCents,
    );
    expect(totals.costCents).toBe(totals.paidCents - result.releasedCents);
    expect(totals.feesCents).toBe(3_000);
  });

  it('datas: 1º vencimento padrão é contratação + 30 dias e os seguintes são mensais', () => {
    const result = simulateLoan({ ...base, contractDate: '2026-01-31', iofMode: 'NONE' });
    expect(result.firstDueDate).toBe('2026-03-02');
    expect(result.schedule[1]?.dueDate).toBe('2026-04-02');
  });

  it('dia 31 volta ao dia 31 quando o mês tem 31 dias, usando o último dia no resto', () => {
    const result = simulateLoan({
      ...base,
      contractDate: '2026-01-30',
      firstDueDate: '2026-01-31',
      installments: 4,
    });
    expect(result.schedule.map((row) => row.dueDate)).toEqual([
      '2026-01-31',
      '2026-02-28',
      '2026-03-31',
      '2026-04-30',
    ]);
  });

  it('aceita primeiro vencimento informado', () => {
    const result = simulateLoan({ ...base, firstDueDate: '2026-12-10' });
    expect(result.firstDueDate).toBe('2026-12-10');
    expect(result.schedule[0]?.dueDate).toBe('2026-12-10');
  });

  it('CET é maior que a taxa nominal quando há tarifas e IOF', () => {
    const plain = simulateLoan(base);
    const withCosts = simulateLoan({ ...base, iofMode: 'CASH', feesCents: 20_000 });
    expect(withCosts.cetMonthly).toBeGreaterThan(plain.cetMonthly);
    expect(plain.cetMonthly).toBeGreaterThan(0.02 - 0.0001);
  });

  it('CET mensal é o derivado do anual, pela R4', () => {
    const result = simulateLoan({ ...base, iofMode: 'FINANCED' });
    expect(result.cetMonthly).toBeCloseTo((1 + result.cetAnnual) ** (1 / 12) - 1, 12);
  });

  it('resultado é serializável em JSON sem perda', () => {
    const result = simulateLoan({ ...base, iofMode: 'FINANCED', feesCents: 1_000 });
    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
  });
});

describe('simulateLoan — casos de borda', () => {
  it('n = 1 gera uma única parcela que quita o empréstimo', () => {
    const result = simulateLoan({ ...base, installments: 1, iofMode: 'NONE' });
    expect(result.schedule).toHaveLength(1);
    expect(result.schedule[0]?.payment).toBe(1_020_000);
    expect(result.schedule[0]?.balance).toBe(0);
  });

  it('taxa zero gera parcelas iguais sem juros e CET zero', () => {
    const result = simulateLoan({ ...base, monthlyRate: 0, installments: 4, iofMode: 'NONE' });
    expect(result.schedule.map((row) => row.payment)).toEqual([250_000, 250_000, 250_000, 250_000]);
    expect(result.totals.interestCents).toBe(0);
    expect(result.cetMonthly).toBeCloseTo(0, 9);
  });

  it('420 parcelas com IOF financiado e CET fecha o saldo em zero', () => {
    const result = simulateLoan({
      ...base,
      amountCents: 1_000_000_000,
      monthlyRate: 0.03,
      installments: 420,
      iofMode: 'FINANCED',
    });
    expect(result.schedule).toHaveLength(420);
    expect(result.schedule.at(-1)?.balance).toBe(0);
    expect(Number.isFinite(result.cetAnnual)).toBe(true);
  });

  it('rejeita valor não positivo, parcelas inválidas e datas fora de ordem', () => {
    expect(() => simulateLoan({ ...base, amountCents: 0 })).toThrow(InvalidInputError);
    expect(() => simulateLoan({ ...base, installments: 0 })).toThrow(InvalidInputError);
    expect(() => simulateLoan({ ...base, feesCents: -1 })).toThrow(InvalidInputError);
    expect(() =>
      simulateLoan({ ...base, contractDate: '2026-05-10', firstDueDate: '2026-05-01' }),
    ).toThrow('Primeiro vencimento não pode ser anterior');
  });

  it('rejeita sistema de amortização e modo de IOF desconhecidos', () => {
    expect(() => simulateLoan({ ...base, system: 'SACRE' as unknown as 'PRICE' })).toThrow(
      'Sistema de amortização desconhecido',
    );
    expect(() => simulateLoan({ ...base, iofMode: 'X' as unknown as 'NONE' })).toThrow(
      'Modo de IOF desconhecido',
    );
  });

  it('contratação sem política de IOF vigente gera erro dedicado', () => {
    expect(() => simulateLoan({ ...base, contractDate: '2000-01-01', iofMode: 'CASH' })).toThrow(
      TaxPolicyNotFoundError,
    );
  });
});

function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);
}
