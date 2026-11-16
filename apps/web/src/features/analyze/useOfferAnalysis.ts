import { reactive } from 'vue';
import { offerInputSchema, type OfferAnalysis, type OfferInput } from '@raiox/contracts';
import { analyzeOffer } from '../../shared/api/client';
import { todayIso } from '../../shared/today';
import { useValidatedRequest, type ValidatedRequest } from '../../shared/useValidatedRequest';
import {
  OFFER_FIELDS,
  createDefaultOfferForm,
  toOfferCandidate,
  type OfferField,
  type OfferFormState,
} from './offerForm';

export type OfferAnalysisState = ValidatedRequest<OfferInput, OfferAnalysis, OfferField> & {
  form: OfferFormState;
};

/** Estado do Raio-X de oferta (F2) para uma tela. Cada uso cria o seu. */
export function useOfferAnalysis(): OfferAnalysisState {
  const form = reactive<OfferFormState>(createDefaultOfferForm(todayIso()));
  const request = useValidatedRequest({
    form,
    fields: OFFER_FIELDS,
    toCandidate: toOfferCandidate,
    validator: offerInputSchema,
    send: (input, signal) => analyzeOffer(input, signal),
  });
  return { form, ...request };
}
