/*
 * Formatação e leitura de valores em pt-BR.
 * Dinheiro é sempre centavos inteiros; o front não calcula nada financeiro.
 */

const NUMERO = new Intl.NumberFormat('pt-BR');
const INTEIRO = /^\d+$/;
const PARTE_INTEIRA_MONETARIA = /^(\d+|\d{1,3}(\.\d{3})+)?$/;
const PARTE_DECIMAL = /^\d{0,2}$/;
const PERCENTUAL_TEXTO = /^\d+(,\d+)?$/;
const DATA_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Valor em centavos como texto de campo, sem o prefixo: "10.000,00". */
export function formatMoneyInput(cents: number): string {
  const sinal = cents < 0 ? '-' : '';
  const absoluto = Math.trunc(Math.abs(cents));
  const reais = Math.floor(absoluto / 100);
  const centavos = absoluto % 100;
  return `${sinal}${NUMERO.format(reais)},${String(centavos).padStart(2, '0')}`;
}

/** Valor em centavos para leitura: "R$ 10.000,00" (espaço não quebrável). */
export function formatMoney(cents: number): string {
  return `R$\u00a0${formatMoneyInput(cents)}`;
}

/** Fração decimal para leitura: 0,0292 vira "2,92%". */
export function formatPercent(decimal: number, casas = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(decimal);
}

/** Fração decimal como texto de campo, sem o %: 0,0292 vira "2,92". */
export function formatPercentInput(decimal: number): string {
  return String(Number((decimal * 100).toFixed(6))).replace('.', ',');
}

/** Data ISO (YYYY-MM-DD) para leitura: "15/12/2026". Sem Date, logo sem fuso. */
export function formatDate(iso: string): string {
  const partes = DATA_ISO.exec(iso);
  if (!partes) return iso;
  const [, ano = '', mes = '', dia = ''] = partes;
  return `${dia}/${mes}/${ano}`;
}

/** Texto de campo em centavos. Retorna null se o texto não for um valor. */
export function parseMoney(texto: string): number | null {
  const limpo = texto.replace(/R\$/g, '').replace(/\s/g, '');
  const partes = limpo.split(',');
  if (partes.length > 2) return null;
  const [inteira = '', decimal = ''] = partes;
  if (!PARTE_INTEIRA_MONETARIA.test(inteira) || !PARTE_DECIMAL.test(decimal)) return null;
  if (inteira === '' && decimal === '') return null;
  const reais = Number(inteira.replace(/\./g, '') || '0');
  const centavos = Number(decimal.padEnd(2, '0'));
  return reais * 100 + centavos;
}

/** Texto de campo inteiro. Retorna null se não for um inteiro não negativo. */
export function parseInteger(texto: string): number | null {
  const limpo = texto.trim();
  return INTEIRO.test(limpo) ? Number(limpo) : null;
}

/** Texto de campo percentual ("2,5" ou "2,5%") vira fração decimal (0,025). */
export function parsePercent(texto: string): number | null {
  const limpo = texto.replace(/%/g, '').replace(/\s/g, '');
  if (!PERCENTUAL_TEXTO.test(limpo)) return null;
  const valor = Number(limpo.replace(',', '.'));
  return Number((valor / 100).toPrecision(12));
}
