import { describe, expect, it } from 'vitest';
import { healthSchema } from './health';
import { problemSchema } from './problem';
import { shareResponseSchema } from './share';

describe('shareResponseSchema (F4)', () => {
  it('aceita id, url e expiração válidos', () => {
    const result = shareResponseSchema.safeParse({
      id: 'aZ09xyQ1Ab',
      url: 'https://raiox.example/s/aZ09xyQ1Ab',
      expiresAt: '2026-09-11T00:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('rejeita url inválida e id fora do formato', () => {
    const result = shareResponseSchema.safeParse({
      id: 'curto',
      url: 'nao e url',
      expiresAt: '2026-09-11T00:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });
});

describe('problemSchema (RFC 9457)', () => {
  it('aceita Problem Details com errors[] por campo', () => {
    const result = problemSchema.safeParse({
      type: 'about:blank',
      title: 'Dados inválidos',
      status: 422,
      detail: 'Revise os campos.',
      code: 'VALIDATION',
      errors: [{ path: 'installments', message: 'O prazo vai de 1 a 420 meses.' }],
    });
    expect(result.success).toBe(true);
  });

  it('aceita Problem Details mínimo, sem code nem errors', () => {
    const result = problemSchema.safeParse({
      type: 'about:blank',
      title: 'Não encontrado',
      status: 404,
      detail: 'x',
    });
    expect(result.success).toBe(true);
  });

  it('rejeita status que não é inteiro', () => {
    const result = problemSchema.safeParse({
      type: 'about:blank',
      title: 't',
      status: 404.5,
      detail: 'x',
    });
    expect(result.success).toBe(false);
  });
});

describe('healthSchema', () => {
  it('aceita somente status ok', () => {
    expect(healthSchema.safeParse({ status: 'ok' }).success).toBe(true);
    expect(healthSchema.safeParse({ status: 'down' }).success).toBe(false);
  });
});
