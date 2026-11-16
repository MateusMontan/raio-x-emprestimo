/** Metadados do documento OpenAPI 3.1 servido em /api/openapi.json. */
export const OPENAPI_DOCUMENT = {
  openapi: '3.1.0',
  info: {
    title: 'Raio-X do Empréstimo API',
    version: '1.0.0',
    description:
      'Calcula quanto um empréstimo custa de verdade: cronograma, IOF, CET e taxa implícita ' +
      'de uma oferta. Todas as regras são públicas (ver a especificação do projeto). ' +
      'Erros seguem RFC 9457 (application/problem+json).',
  },
  tags: [
    { name: 'Simulações', description: 'Cálculo, compartilhamento e leitura de simulações' },
    { name: 'Raio-X de oferta', description: 'Taxa implícita e CET a partir da oferta do banco' },
    { name: 'Sistema', description: 'Saúde do serviço' },
  ],
};
