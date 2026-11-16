import { InvalidInputError } from '../errors';

export function assertInstallments(installments: number): void {
  if (!Number.isSafeInteger(installments) || installments < 1) {
    throw new InvalidInputError(`Número de parcelas deve ser inteiro >= 1 (${String(installments)})`);
  }
}
