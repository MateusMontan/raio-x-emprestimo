/**
 * Tira o `readonly` dos tipos do domínio para casar com os schemas Zod do contrato
 * (que usam arrays mutáveis). É só tipo: o JSON gerado é o mesmo.
 */
export type Mutable<T> = T extends readonly (infer U)[]
  ? Mutable<U>[]
  : T extends object
    ? { -readonly [K in keyof T]: Mutable<T[K]> }
    : T;

/** Converte o valor para a forma mutável do contrato, sem copiar nada. */
export function asMutable<T>(value: T): Mutable<T> {
  return value as Mutable<T>;
}
