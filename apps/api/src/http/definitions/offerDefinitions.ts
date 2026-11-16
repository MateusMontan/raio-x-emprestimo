import { createRoute } from '@hono/zod-openapi';
import { offerAnalysisSchema, offerInputSchema } from '@raiox/contracts';
import { OFFER_EXAMPLE } from './examples';
import { BODY_ERRORS } from './responses';

/** F2: descobre a taxa implícita e o CET de uma oferta. Não grava nada. */
export const analyzeOfferRoute = createRoute({
  method: 'post',
  path: '/api/v1/offers/analyze',
  tags: ['Raio-X de oferta'],
  summary: 'Analisar oferta',
  description:
    'A partir do valor liberado, da parcela e do prazo informados pelo banco, ' +
    'descobre a taxa implícita e o CET (R4 e R5 da SPEC).',
  request: {
    body: {
      required: true,
      content: {
        'application/json': { schema: offerInputSchema, example: OFFER_EXAMPLE },
      },
    },
  },
  responses: {
    200: {
      description: 'Análise da oferta',
      content: { 'application/json': { schema: offerAnalysisSchema } },
    },
    ...BODY_ERRORS,
  },
});
