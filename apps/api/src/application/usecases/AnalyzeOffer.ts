import type { OfferInput } from '@raiox/contracts';
import { analyzeOffer, type OfferAnalysis } from '@raiox/finance';
import { toOfferInput } from '../mappers';

/** F2: descobre a taxa implícita e o CET de uma oferta. Não persiste nada. */
export class AnalyzeOffer {
  execute(input: OfferInput): OfferAnalysis {
    return analyzeOffer(toOfferInput(input));
  }
}
