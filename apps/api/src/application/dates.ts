const MS_PER_DAY = 86_400_000;

/** Soma dias corridos (24 h cada) a um instante. Não muda o objeto recebido. */
export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

/**
 * Expirado quando `expiresAt <= now`. Datas inválidas são tratadas como expiradas,
 * para nunca servir um link cuja validade não se consegue ler.
 */
export function isExpired(expiresAtIso: string, now: Date): boolean {
  return !(Date.parse(expiresAtIso) > now.getTime());
}
