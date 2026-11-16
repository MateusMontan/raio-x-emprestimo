import { formatMoney, formatPercent } from '../../shared/format';
import { bestBy } from './bestBy';
import type { ComparedResult } from './normalizeResult';

/** Cenário com resultado pronto, pronto para a frase-resumo. */
export interface ReadyEntry {
  id: string;
  label: string;
  result: ComparedResult;
}

function subject(names: readonly string[]): string {
  const [first] = names;
  if (names.length === 1 && first !== undefined) return `A ${first}`;
  return names.join(' e ');
}

function verb(names: readonly string[]): string {
  return names.length === 1 ? 'tem' : 'têm';
}

function sentence(names: readonly string[], text: string): string {
  return `${subject(names)} ${verb(names)} ${text}.`;
}

/**
 * Frase-resumo da comparação. Com menos de dois resultados prontos, não há o que comparar.
 */
export function buildComparisonSummary(entries: readonly ReadyEntry[]): string | null {
  if (entries.length < 2) return null;
  const cet = bestBy(entries, (entry) => entry.result.cetMonthly);
  const total = bestBy(entries, (entry) => entry.result.totalPaidCents);
  if (!cet || !total) return null;

  const namesCet = entries.filter((entry) => cet.ids.has(entry.id)).map((e) => e.label);
  const namesTotal = entries.filter((entry) => total.ids.has(entry.id)).map((e) => e.label);
  const textCet = `o menor CET (${formatPercent(cet.value)} ao mês)`;
  const textTotal = `o menor total pago (${formatMoney(total.value)})`;

  const same = [...cet.ids].sort().join() === [...total.ids].sort().join();
  if (same) return sentence(namesCet, `${textCet} e ${textTotal}`);
  return `${sentence(namesCet, textCet)} ${sentence(namesTotal, textTotal)}`;
}
