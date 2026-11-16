import { DomainError } from '../errors';

/** Acesso por índice que falha explicitamente, para não espalhar `?? valor` pelo domínio. */
export function requireAt<T>(items: readonly T[], index: number): T {
  if (index < 0 || index >= items.length) {
    throw new DomainError('INTERNAL_INDEX', `Índice ${index} fora do intervalo (${items.length})`);
  }
  return items[index] as T;
}
