import { formatMoney, formatPercent } from '../../shared/format';
import { bestBy } from './bestBy';
import type { ComparedResult } from './normalizeResult';

/** Cenário com resultado pronto, pronto para a frase-resumo. */
export interface ReadyEntry {
  id: string;
  label: string;
  result: ComparedResult;
}

function subject(nomes: readonly string[]): string {
  const [primeiro] = nomes;
  if (nomes.length === 1 && primeiro !== undefined) return `A ${primeiro}`;
  return nomes.join(' e ');
}

function verb(nomes: readonly string[]): string {
  return nomes.length === 1 ? 'tem' : 'têm';
}

function sentence(nomes: readonly string[], texto: string): string {
  return `${subject(nomes)} ${verb(nomes)} ${texto}.`;
}

/**
 * Frase-resumo da comparação. Com menos de dois resultados prontos, não há o que comparar.
 */
export function buildComparisonSummary(entradas: readonly ReadyEntry[]): string | null {
  if (entradas.length < 2) return null;
  const cet = bestBy(entradas, (entrada) => entrada.result.cetMonthly);
  const total = bestBy(entradas, (entrada) => entrada.result.totalPaidCents);
  if (!cet || !total) return null;

  const nomesCet = entradas.filter((entrada) => cet.ids.has(entrada.id)).map((e) => e.label);
  const nomesTotal = entradas.filter((entrada) => total.ids.has(entrada.id)).map((e) => e.label);
  const textoCet = `o menor CET (${formatPercent(cet.value)} ao mês)`;
  const textoTotal = `o menor total pago (${formatMoney(total.value)})`;

  const mesmos = [...cet.ids].sort().join() === [...total.ids].sort().join();
  if (mesmos) return sentence(nomesCet, `${textoCet} e ${textoTotal}`);
  return `${sentence(nomesCet, textoCet)} ${sentence(nomesTotal, textoTotal)}`;
}
