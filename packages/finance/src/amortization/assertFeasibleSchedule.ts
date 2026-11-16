import { InvalidInputError } from '../errors';
import type { Installment } from './types';

/**
 * Garante que nenhuma linha do cronograma ficou inviável. Se a parcela arredondada
 * quita a dívida antes do fim, o saldo fica negativo e a última linha passaria a ter
 * amortização negativa: o caso deve virar erro de entrada, não cronograma inválido.
 */
export function assertFeasibleSchedule(rows: readonly Installment[]): void {
  for (const row of rows) {
    if (row.payment.cents <= 0 || row.principal.cents < 0 || row.balance.cents < 0) {
      throw new InvalidInputError(
        'Valor baixo demais para este prazo: a parcela arredondada quitaria a dívida antes do fim. Reduza o prazo ou aumente o valor.',
      );
    }
  }
}
