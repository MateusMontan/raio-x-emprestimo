import { describe, expect, it } from 'vitest';
import { DomainError } from '../errors';
import { requireAt } from './requireAt';

describe('requireAt', () => {
  it('devolve o item no índice informado', () => {
    expect(requireAt(['a', 'b'], 1)).toBe('b');
  });

  it('falha explicitamente fora do intervalo', () => {
    expect(() => requireAt(['a'], 1)).toThrow(DomainError);
    expect(() => requireAt(['a'], -1)).toThrow('fora do intervalo');
  });
});
