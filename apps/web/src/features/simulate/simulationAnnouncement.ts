import type { SimulationResult } from '@raiox/contracts';
import { formatMoney, formatPercent } from '../../shared/format';
import type { RequestStatus } from '../../shared/useValidatedRequest';

/** Texto anunciado pela região aria-live da simulação. Só lê o resultado já calculado. */
export function simulationAnnouncement(
  status: RequestStatus,
  result: SimulationResult | null,
): string {
  if (status === 'loading') return 'Calculando…';
  if (status !== 'success' || result === null) return '';
  return (
    `Resultado atualizado: você recebe ${formatMoney(result.releasedCents)} ` +
    `e devolve ${formatMoney(result.totals.paidCents)}. ` +
    `CET de ${formatPercent(result.cetMonthly)} ao mês.`
  );
}
