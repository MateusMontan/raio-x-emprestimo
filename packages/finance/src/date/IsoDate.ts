import { InvalidInputError } from '../errors';

const MS_PER_DAY = 86_400_000;
const ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Data sem hora no formato YYYY-MM-DD (R6). Independe do fuso do ambiente. */
export class IsoDate {
  readonly value: string;
  private readonly year: number;
  private readonly month: number; // 1..12
  private readonly day: number; // 1..31

  private constructor(year: number, month: number, day: number) {
    this.year = year;
    this.month = month;
    this.day = day;
    this.value = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  static parse(text: string): IsoDate {
    const match = ISO_PATTERN.exec(text);
    if (!match) {
      throw new InvalidInputError(`Data inválida, use YYYY-MM-DD: ${text}`);
    }
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
      throw new InvalidInputError(`Data inexistente: ${text}`);
    }
    return new IsoDate(year, month, day);
  }

  /** Soma dias corridos. */
  addDays(days: number): IsoDate {
    const shifted = new Date(Date.UTC(this.year, this.month - 1, this.day) + days * MS_PER_DAY);
    return new IsoDate(
      shifted.getUTCFullYear(),
      shifted.getUTCMonth() + 1,
      shifted.getUTCDate(),
    );
  }

  /**
   * Soma meses preservando o dia. Se o mês de destino não tiver esse dia,
   * usa o último dia do mês (31/jan + 1 mês = 28 ou 29/fev). Sempre calculado a partir
   * da data original, nunca encadeado, para que 31/jan + 2 meses seja 31/mar.
   */
  addMonths(months: number): IsoDate {
    const totalMonths = this.year * 12 + (this.month - 1) + months;
    const year = Math.floor(totalMonths / 12);
    const month = (totalMonths % 12) + 1;
    const day = Math.min(this.day, daysInMonth(year, month));
    return new IsoDate(year, month, day);
  }

  /** Dias corridos de `this` até `other` (negativo se `other` for anterior). */
  daysUntil(other: IsoDate): number {
    return Math.round((other.utcMs() - this.utcMs()) / MS_PER_DAY);
  }

  equals(other: IsoDate): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  private utcMs(): number {
    return Date.UTC(this.year, this.month - 1, this.day);
  }
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}
