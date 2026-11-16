import type {
  OfferAnalysis,
  OfferInput,
  ShareResponse,
  SharedSimulation,
  SimulationRequest,
  SimulationResult,
} from '@raiox/contracts';
import { apiRequest } from './http';

/** Cálculo do cronograma, CET e IOF (F1). */
export function calculateSimulation(
  req: SimulationRequest,
  signal?: AbortSignal,
): Promise<SimulationResult> {
  return apiRequest<SimulationResult>('/simulations/calculate', {
    method: 'POST',
    body: req,
    signal,
  });
}

/** Taxa implícita e CET de uma oferta do banco (F2). */
export function analyzeOffer(req: OfferInput, signal?: AbortSignal): Promise<OfferAnalysis> {
  return apiRequest<OfferAnalysis>('/offers/analyze', { method: 'POST', body: req, signal });
}

/** Salva as entradas e devolve o link curto (F4). */
export function shareSimulation(req: SimulationRequest): Promise<ShareResponse> {
  return apiRequest<ShareResponse>('/simulations', { method: 'POST', body: req });
}

/** Lê uma simulação compartilhada; o resultado é recalculado pela API. */
export function getSharedSimulation(id: string, signal?: AbortSignal): Promise<SharedSimulation> {
  return apiRequest<SharedSimulation>(`/simulations/${encodeURIComponent(id)}`, {
    method: 'GET',
    signal,
  });
}
