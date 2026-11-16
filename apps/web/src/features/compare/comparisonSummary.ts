import { formatMoney, formatPercent } from '../../shared/format';
import { bestBy } from './bestBy';
import type { ComparedResult } from './normalizeResult';

/** Cenário com resultado pronto, pronto para a frase-resumo. */
export interface ReadyEntry {
  id: string;
  label: string;
  result: ComparedResult;
}

/** Sem artigo: o rótulo pode ser qualquer texto ("Oferta 2", "Simulação"). */
function subject(labels: readonly string[]): string {
  return labels.join(' e ');
}

function verb(labels: readonly string[]): string {
  return labels.length === 1 ? 'tem' : 'têm';
}

function sentence(labels: readonly string[], text: string): string {
  return `${subject(labels)} ${verb(labels)} ${text}.`;
}

/**
 * Frase-resumo da comparação. Com menos de dois resultados prontos, não há o que comparar.
 */
export function buildComparisonSummary(entries: readonly ReadyEntry[]): string | null {
  if (entries.length < 2) return null;
  const cet = bestBy(entries, (entry) => entry.result.cetMonthly);
  const total = bestBy(entries, (entry) => entry.result.totalPaidCents);
  if (!cet || !total) return null;

  const cetLabels = entries.filter((entry) => cet.ids.has(entry.id)).map((entry) => entry.label);
  const totalLabels = entries
    .filter((entry) => total.ids.has(entry.id))
    .map((entry) => entry.label);
  const cetText = `o menor CET (${formatPercent(cet.value)} ao mês)`;
  const totalText = `o menor total pago (${formatMoney(total.value)})`;

  const same = [...cet.ids].sort().join() === [...total.ids].sort().join();
  if (same) return sentence(cetLabels, `${cetText} e ${totalText}`);
  return `${sentence(cetLabels, cetText)} ${sentence(totalLabels, totalText)}`;
}
