import type { OfferAnalysis } from '@raiox/contracts';
import { formatMoney, formatPercent } from '../../shared/format';
import type { RequestStatus } from '../../shared/useValidatedRequest';

/** Texto anunciado pela região aria-live do Raio-X. Só lê o resultado já calculado. */
export function offerAnnouncement(status: RequestStatus, analysis: OfferAnalysis | null): string {
  if (status === 'loading') return 'Calculando…';
  if (status !== 'success' || analysis === null) return '';
  return (
    `Resultado atualizado: você recebe ${formatMoney(analysis.releasedCents)} ` +
    `e devolve ${formatMoney(analysis.totalPaidCents)}. ` +
    `Taxa embutida de ${formatPercent(analysis.impliedMonthlyRate)} ao mês. ` +
    `CET de ${formatPercent(analysis.cetMonthly)} ao mês.`
  );
}
