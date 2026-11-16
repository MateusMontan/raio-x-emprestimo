import { describe, expect, it } from 'vitest';
import { simulationInputSchema } from './simulation';

const base = {
  amountCents: 1_000_000,
  monthlyRate: 0.02,
  installments: 12,
  system: 'PRICE',
  contractDate: '2026-03-10',
} as const;

const parse = (input: unknown) => simulationInputSchema.safeParse(input);

/** Mensagem e caminho do primeiro erro, para asserts precisos. */
const firstIssue = (input: unknown): { message: string | undefined; path: string } => {
  const result = parse(input);
  if (result.success) throw new Error('esperava falha de validação');
  const issue = result.error.issues[0];
  return { message: issue?.message, path: (issue?.path ?? []).join('.') };
};

describe('simulationInputSchema (F1)', () => {
  it('aceita uma entrada mínima válida', () => {
    expect(parse(base).success).toBe(true);
  });

  it('aplica os defaults de tarifas (0) e IOF (FINANCED)', () => {
    const result = parse(base);
    expect(result.success && result.data.feesCents).toBe(0);
    expect(result.success && result.data.iofMode).toBe('FINANCED');
  });

  it('mantém os valores informados quando presentes', () => {
    const result = parse({
      ...base,
      feesCents: 5_000,
      iofMode: 'CASH',
      firstDueDate: '2026-05-01',
    });
    expect(result.success && result.data).toMatchObject({
      feesCents: 5_000,
      iofMode: 'CASH',
      firstDueDate: '2026-05-01',
    });
  });

  it('aceita o limite exato de 50% das tarifas e rejeita 1 centavo acima', () => {
    expect(parse({ ...base, feesCents: 500_000 }).success).toBe(true);
    expect(firstIssue({ ...base, feesCents: 500_001 })).toEqual({
      message: 'Tarifas e seguro não podem passar de 50% do valor.',
      path: 'feesCents',
    });
  });

  it('rejeita tarifas negativas e não inteiras', () => {
    expect(firstIssue({ ...base, feesCents: -1 }).message).toBe(
      'As tarifas não podem ser negativas.',
    );
    expect(firstIssue({ ...base, feesCents: 10.5 }).message).toBe(
      'As tarifas devem estar em centavos inteiros.',
    );
  });

  it('valida valor, prazo e taxa nos limites da R7 e aponta o campo', () => {
    expect(parse({ ...base, amountCents: 10_000 }).success).toBe(true);
    expect(firstIssue({ ...base, amountCents: 9_999 })).toEqual({
      message: 'O valor vai de R$ 100,00 a R$ 10.000.000,00.',
      path: 'amountCents',
    });
    expect(parse({ ...base, installments: 420 }).success).toBe(true);
    expect(firstIssue({ ...base, installments: 421 })).toEqual({
      message: 'O prazo vai de 1 a 420 meses.',
      path: 'installments',
    });
    expect(parse({ ...base, monthlyRate: 0.3 }).success).toBe(true);
    expect(firstIssue({ ...base, monthlyRate: 0.31 })).toEqual({
      message: 'A taxa mensal vai de 0% a 30%.',
      path: 'monthlyRate',
    });
  });

  it('rejeita prazo não inteiro', () => {
    expect(firstIssue({ ...base, installments: 1.5 }).message).toBe(
      'O prazo deve ser um número inteiro de meses.',
    );
  });

  it('aceita SAC e rejeita sistema desconhecido', () => {
    expect(parse({ ...base, system: 'SAC' }).success).toBe(true);
    expect(firstIssue({ ...base, system: 'OUTRO' }).path).toBe('system');
  });

  it('rejeita data de contratação inexistente e formato errado', () => {
    expect(firstIssue({ ...base, contractDate: '2025-02-30' })).toEqual({
      message: 'Esta data não existe no calendário.',
      path: 'contractDate',
    });
    expect(firstIssue({ ...base, contractDate: '10/03/2026' }).message).toBe(
      'Use a data no formato AAAA-MM-DD.',
    );
  });

  it('rejeita primeiro vencimento anterior à contratação, e aceita o mesmo dia', () => {
    expect(firstIssue({ ...base, firstDueDate: '2026-03-09' })).toEqual({
      message: 'O primeiro vencimento não pode ser antes da contratação.',
      path: 'firstDueDate',
    });
    expect(parse({ ...base, firstDueDate: '2026-03-10' }).success).toBe(true);
  });

  it('rejeita data de primeiro vencimento inexistente', () => {
    expect(firstIssue({ ...base, firstDueDate: '2026-04-31' }).message).toBe(
      'Esta data não existe no calendário.',
    );
  });

  it('rejeita chaves desconhecidas', () => {
    expect(parse({ ...base, taxa: 1 }).success).toBe(false);
  });

  it('rejeita campos obrigatórios ausentes com mensagem em pt-BR', () => {
    expect(firstIssue({ ...base, amountCents: undefined }).message).toBe('Informe o valor.');
    expect(firstIssue({ ...base, contractDate: undefined }).message).toBe('Informe a data.');
  });
});
