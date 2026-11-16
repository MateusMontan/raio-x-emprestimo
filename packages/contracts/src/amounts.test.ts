import { describe, expect, it } from 'vitest';
import {
  amountCentsSchema,
  installmentsSchema,
  monthlyRateSchema,
  paymentCentsSchema,
} from './amounts';

type Result = { success: boolean; error?: { issues: { message: string }[] } };

const firstMessage = (result: Result): string | undefined =>
  result.success ? undefined : result.error?.issues[0]?.message;

describe('amountCentsSchema (valor, R7)', () => {
  it('aceita o mínimo e o máximo', () => {
    expect(amountCentsSchema.safeParse(10_000).success).toBe(true);
    expect(amountCentsSchema.safeParse(1_000_000_000).success).toBe(true);
  });

  it('rejeita um centavo abaixo do mínimo e acima do máximo', () => {
    expect(firstMessage(amountCentsSchema.safeParse(9_999))).toBe(
      'O valor vai de R$ 100,00 a R$ 10.000.000,00.',
    );
    expect(firstMessage(amountCentsSchema.safeParse(1_000_000_001))).toBe(
      'O valor vai de R$ 100,00 a R$ 10.000.000,00.',
    );
  });

  it('rejeita valores não inteiros', () => {
    expect(firstMessage(amountCentsSchema.safeParse(10_000.5))).toBe(
      'O valor deve estar em centavos inteiros.',
    );
  });

  it('rejeita tipo errado e ausência com mensagem em pt-BR', () => {
    expect(firstMessage(amountCentsSchema.safeParse('10000'))).toBe('Informe o valor.');
    expect(firstMessage(amountCentsSchema.safeParse(undefined))).toBe('Informe o valor.');
    expect(firstMessage(amountCentsSchema.safeParse(Number.NaN))).toBe('Informe o valor.');
  });
});

describe('installmentsSchema (prazo, R7)', () => {
  it('aceita 1 e 420 meses', () => {
    expect(installmentsSchema.safeParse(1).success).toBe(true);
    expect(installmentsSchema.safeParse(420).success).toBe(true);
  });

  it('rejeita 0 e 421 meses', () => {
    expect(firstMessage(installmentsSchema.safeParse(0))).toBe('O prazo vai de 1 a 420 meses.');
    expect(firstMessage(installmentsSchema.safeParse(421))).toBe('O prazo vai de 1 a 420 meses.');
  });

  it('rejeita prazo fracionado', () => {
    expect(firstMessage(installmentsSchema.safeParse(12.5))).toBe(
      'O prazo deve ser um número inteiro de meses.',
    );
  });

  it('rejeita prazo ausente', () => {
    expect(firstMessage(installmentsSchema.safeParse(undefined))).toBe('Informe o prazo.');
  });
});

describe('monthlyRateSchema (taxa mensal, R7)', () => {
  it('aceita 0% e 30%', () => {
    expect(monthlyRateSchema.safeParse(0).success).toBe(true);
    expect(monthlyRateSchema.safeParse(0.3).success).toBe(true);
  });

  it('rejeita taxa negativa e acima de 30%', () => {
    expect(firstMessage(monthlyRateSchema.safeParse(-0.0001))).toBe(
      'A taxa mensal vai de 0% a 30%.',
    );
    expect(firstMessage(monthlyRateSchema.safeParse(0.3001))).toBe(
      'A taxa mensal vai de 0% a 30%.',
    );
  });

  it('rejeita taxa ausente', () => {
    expect(firstMessage(monthlyRateSchema.safeParse(undefined))).toBe('Informe a taxa mensal.');
  });
});

describe('paymentCentsSchema (parcela da oferta)', () => {
  it('aceita de 1 centavo até o teto de valor', () => {
    expect(paymentCentsSchema.safeParse(1).success).toBe(true);
    expect(paymentCentsSchema.safeParse(1_000_000_000).success).toBe(true);
  });

  it('rejeita zero, acima do teto e não inteiros', () => {
    expect(firstMessage(paymentCentsSchema.safeParse(0))).toBe(
      'O valor da parcela vai de R$ 0,01 a R$ 10.000.000,00.',
    );
    expect(firstMessage(paymentCentsSchema.safeParse(1_000_000_001))).toBe(
      'O valor da parcela vai de R$ 0,01 a R$ 10.000.000,00.',
    );
    expect(firstMessage(paymentCentsSchema.safeParse(1.5))).toBe(
      'O valor da parcela deve estar em centavos inteiros.',
    );
  });

  it('rejeita parcela ausente', () => {
    expect(firstMessage(paymentCentsSchema.safeParse(undefined))).toBe(
      'Informe o valor da parcela.',
    );
  });
});
