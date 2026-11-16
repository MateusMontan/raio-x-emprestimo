import { createRoute, z } from '@hono/zod-openapi';
import {
  shareResponseSchema,
  sharedSimulationSchema,
  simulationInputSchema,
  simulationResultSchema,
} from '@raiox/contracts';
import { SIMULATION_EXAMPLE } from './examples';
import { BODY_ERRORS, problemDoc } from './responses';

const TAG = 'Simulações';

const simulationBody = {
  required: true,
  content: {
    'application/json': { schema: simulationInputSchema, example: SIMULATION_EXAMPLE },
  },
};

/** F1: calcula cronograma, IOF e CET sem gravar nada. */
export const calculateRoute = createRoute({
  method: 'post',
  path: '/api/v1/simulations/calculate',
  tags: [TAG],
  summary: 'Calcular simulação',
  description:
    'Gera o cronograma completo, o IOF e o CET (R1 a R4 da SPEC). Não grava nada. ' +
    'Com o exemplo, a 1ª parcela é R$ 945,60 e o total pago é R$ 11.347,15.',
  request: { body: simulationBody },
  responses: {
    200: {
      description: 'Simulação calculada',
      content: { 'application/json': { schema: simulationResultSchema } },
    },
    ...BODY_ERRORS,
  },
});

/** F4: valida, grava só as entradas e devolve o link curto. */
export const shareRoute = createRoute({
  method: 'post',
  path: '/api/v1/simulations',
  tags: [TAG],
  summary: 'Compartilhar simulação',
  description:
    'Grava só as entradas da simulação, válidas por 180 dias, e devolve um link `/s/{id}`. ' +
    'Limitado a 10 pedidos por minuto por IP.',
  request: { body: simulationBody },
  responses: {
    201: {
      description: 'Simulação gravada',
      content: { 'application/json': { schema: shareResponseSchema } },
    },
    429: problemDoc('Limite de compartilhamentos por minuto atingido (cabeçalho Retry-After: 60)'),
    ...BODY_ERRORS,
  },
});

/** F4: lê a simulação compartilhada e recalcula o resultado. */
export const getSharedRoute = createRoute({
  method: 'get',
  path: '/api/v1/simulations/{id}',
  tags: [TAG],
  summary: 'Ler simulação compartilhada',
  description:
    'Devolve as entradas guardadas e o resultado recalculado. ' +
    'Id inexistente, expirado ou malformado devolve 404.',
  request: {
    params: z.object({
      id: z.string().describe('Identificador curto de 10 caracteres (base62)'),
    }),
  },
  responses: {
    200: {
      description: 'Simulação compartilhada',
      content: { 'application/json': { schema: sharedSimulationSchema } },
    },
    404: problemDoc('Simulação não encontrada ou expirada'),
    410: problemDoc('Simulação gravada em formato que não é mais aceito (faça uma nova)'),
    500: BODY_ERRORS[500],
  },
});
