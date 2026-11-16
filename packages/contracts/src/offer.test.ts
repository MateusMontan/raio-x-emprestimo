import { describe, expect, it } from 'vitest';
import { offerInputSchema } from './offer';

const base = {
  releasedCents: 500_000,
  paymentCents: 50_000,
  installments: 12,
  contractDate: '2026-01-15',
} as const;

const parse = (input: unknown) => offerInputSchema.safeParse(input);

describe('offerInputSchema (F2)', () => {
  it('aceita uma oferta válida sem primeiro vencimento', () => {
    expect(parse(base).success).toBe(true);
  });

  it('aceita primeiro vencimento igual à contratação', () => {
    expect(parse({ ...base, firstDueDate: '2026-01-15' }).success).toBe(true);
  });

  it('rejeita primeiro vencimento anterior à contratação', () => {
    const result = parse({ ...base, firstDueDate: '2026-01-14' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['firstDueDate']);
    expect(result.error?.issues[0]?.message).toBe(
      'O primeiro vencimento não pode ser antes da contratação.',
    );
  });

  it('usa os limites de valor da R7 para o valor liberado', () => {
    expect(parse({ ...base, releasedCents: 9_999 }).success).toBe(false);
    expect(parse({ ...base, releasedCents: 10_000 }).success).toBe(true);
  });

  it('rejeita parcela zero e prazo fora da faixa', () => {
    expect(parse({ ...base, paymentCents: 0 }).success).toBe(false);
    expect(parse({ ...base, installments: 421 }).success).toBe(false);
  });

  it('rejeita chaves desconhecidas, como o sistema de amortização', () => {
    expect(parse({ ...base, system: 'PRICE' }).success).toBe(false);
  });
});
