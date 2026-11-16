import { z } from 'zod';
import { simulationInputSchema, simulationResultSchema } from './simulation';
import { simulationIdSchema } from './primitives';

/** Resposta ao compartilhar (F4). */
export const shareResponseSchema = z.object({
  id: simulationIdSchema,
  url: z.url(),
  expiresAt: z.iso.datetime(),
});

/** Simulação compartilhada: guarda as entradas; o resultado é recalculado. */
export const sharedSimulationSchema = z.object({
  id: simulationIdSchema,
  createdAt: z.iso.datetime(),
  expiresAt: z.iso.datetime(),
  input: simulationInputSchema,
  result: simulationResultSchema,
});
