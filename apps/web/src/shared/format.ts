/*
 * Formatação e leitura de valores em pt-BR.
 * Dinheiro é sempre centavos inteiros; o front não calcula nada financeiro.
 */

const NUMBER_FORMAT = new Intl.NumberFormat('pt-BR');
const INTEGER_PATTERN = /^\d+$/;
const MONEY_INTEGER_PATTERN = /^(\d+|\d{1,3}(\.\d{3})+)?$/;
const DECIMAL_PART_PATTERN = /^\d{0,2}$/;
const PERCENT_TEXT_PATTERN = /^\d+(,\d+)?$/;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Valor em centavos como texto de campo, sem o prefixo: "10.000,00". */
export function formatMoneyInput(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const absolute = Math.trunc(Math.abs(cents));
  const units = Math.floor(absolute / 100);
  const centsPart = absolute % 100;
  return `${sign}${NUMBER_FORMAT.format(units)},${String(centsPart).padStart(2, '0')}`;
}

/** Valor em centavos para leitura: "R$ 10.000,00" (espaço não quebrável). */
export function formatMoney(cents: number): string {
  return `R$\u00a0${formatMoneyInput(cents)}`;
}

/** Fração decimal para leitura: 0,0292 vira "2,92%". */
export function formatPercent(decimalPart: number, casas = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(decimalPart);
}

/** Fração decimal como texto de campo, sem o %: 0,0292 vira "2,92". */
export function formatPercentInput(decimalPart: number): string {
  return String(Number((decimalPart * 100).toFixed(6))).replace('.', ',');
}

/** Data ISO (YYYY-MM-DD) para leitura: "15/12/2026". Sem Date, logo sem fuso. */
export function formatDate(iso: string): string {
  const parts = ISO_DATE_PATTERN.exec(iso);
  if (!parts) return iso;
  const [, year = '', month = '', day = ''] = parts;
  return `${day}/${month}/${year}`;
}

/** Texto de campo em centavos. Retorna null se o texto não for um valor. */
export function parseMoney(text: string): number | null {
  const clean = text.replace(/R\$/g, '').replace(/\s/g, '');
  const parts = clean.split(',');
  if (parts.length > 2) return null;
  const [integerPart = '', decimalPart = ''] = parts;
  if (!MONEY_INTEGER_PATTERN.test(integerPart) || !DECIMAL_PART_PATTERN.test(decimalPart))
    return null;
  if (integerPart === '' && decimalPart === '') return null;
  const units = Number(integerPart.replace(/\./g, '') || '0');
  const centsPart = Number(decimalPart.padEnd(2, '0'));
  return units * 100 + centsPart;
}

/** Texto de campo inteiro. Retorna null se não for um inteiro não negativo. */
export function parseInteger(text: string): number | null {
  const clean = text.trim();
  return INTEGER_PATTERN.test(clean) ? Number(clean) : null;
}

/** Texto de campo percentual ("2,5" ou "2,5%") vira fração decimal (0,025). */
export function parsePercent(text: string): number | null {
  const clean = text.replace(/%/g, '').replace(/\s/g, '');
  if (!PERCENT_TEXT_PATTERN.test(clean)) return null;
  const value = Number(clean.replace(',', '.'));
  return Number((value / 100).toPrecision(12));
}
