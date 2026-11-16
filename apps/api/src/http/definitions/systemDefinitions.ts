import { createRoute } from '@hono/zod-openapi';
import { healthSchema } from '@raiox/contracts';

/** Verificação de saúde do serviço. */
export const healthRoute = createRoute({
  method: 'get',
  path: '/api/health',
  tags: ['Sistema'],
  summary: 'Verificar saúde',
  description: 'Confirma que a API está no ar.',
  responses: {
    200: {
      description: 'Serviço no ar',
      content: { 'application/json': { schema: healthSchema } },
    },
  },
});
