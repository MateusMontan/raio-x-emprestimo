import { describe, expect, it } from 'vitest';
import {
  amortizationSystemSchema,
  iofModeSchema,
  isoDateSchema,
  simulationIdSchema,
} from './primitives';

describe('isoDateSchema', () => {
  it('aceita datas válidas dentro de 2000-01-01 e 2100-12-31', () => {
    expect(isoDateSchema.safeParse('2000-01-01').success).toBe(true);
    expect(isoDateSchema.safeParse('2100-12-31').success).toBe(true);
    expect(isoDateSchema.safeParse('2028-02-29').success).toBe(true);
  });

  it('rejeita data que não existe no calendário', () => {
    const result = isoDateSchema.safeParse('2025-02-30');
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Esta data não existe no calendário.');
  });

  it('rejeita 29 de fevereiro em ano não bissexto', () => {
    expect(isoDateSchema.safeParse('2025-02-29').success).toBe(false);
  });

  it('rejeita formato errado', () => {
    for (const value of ['15/03/2026', '2026-3-5', '2026-03-05T00:00:00Z', '20260305']) {
      const result = isoDateSchema.safeParse(value);
      expect(result.success, value).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('Use a data no formato AAAA-MM-DD.');
    }
  });

  it('rejeita datas antes de 2000 e depois de 2100', () => {
    const before = isoDateSchema.safeParse('1999-12-31');
    const after = isoDateSchema.safeParse('2101-01-01');
    expect(before.error?.issues[0]?.message).toBe('A data deve estar entre 2000 e 2100.');
    expect(after.error?.issues[0]?.message).toBe('A data deve estar entre 2000 e 2100.');
  });

  it('rejeita data ausente com mensagem em pt-BR', () => {
    const result = isoDateSchema.safeParse(undefined);
    expect(result.error?.issues[0]?.message).toBe('Informe a data.');
  });
});

describe('simulationIdSchema', () => {
  it('aceita 10 caracteres alfanuméricos', () => {
    expect(simulationIdSchema.safeParse('aZ09xyQ1Ab').success).toBe(true);
  });

  it('rejeita tamanho errado ou caracteres especiais', () => {
    for (const value of ['abc', 'abcdefghijk', 'abcdefghi-', 'abcdefghi ']) {
      const result = simulationIdSchema.safeParse(value);
      expect(result.success, value).toBe(false);
      expect(result.error?.issues[0]?.message).toBe(
        'O identificador deve ter 10 letras ou números.',
      );
    }
  });

  it('rejeita identificador ausente', () => {
    expect(simulationIdSchema.safeParse(undefined).error?.issues[0]?.message).toBe(
      'Informe o identificador da simulação.',
    );
  });
});

describe('enums', () => {
  it('aceita sistemas PRICE e SAC e rejeita outros', () => {
    expect(amortizationSystemSchema.safeParse('PRICE').success).toBe(true);
    expect(amortizationSystemSchema.safeParse('SAC').success).toBe(true);
    expect(amortizationSystemSchema.safeParse('SACRO').error?.issues[0]?.message).toBe(
      'O sistema deve ser Price ou SAC.',
    );
  });

  it('aceita modos de IOF válidos e rejeita outros', () => {
    expect(iofModeSchema.safeParse('CASH').success).toBe(true);
    expect(iofModeSchema.safeParse('NONE').success).toBe(true);
    expect(iofModeSchema.safeParse('X').success).toBe(false);
  });
});
