import type { TaxPolicy } from './TaxPolicy';

/**
 * Políticas de IOF versionadas. Uma mudança de alíquota é uma nova entrada com nova
 * `validFrom`, sem alterar o algoritmo. Manter em ordem crescente de `validFrom`.
 * Versões anteriores a 2022 não são modeladas: o app simula contratações a partir de hoje.
 */
export const TAX_POLICIES: readonly TaxPolicy[] = [
  {
    id: 'br-iof-pf-credito-decreto-6306',
    validFrom: '2022-01-01',
    dailyRate: 0.000082,
    additionalRate: 0.0038,
    maxDays: 365,
    legalReference: {
      title:
        'Decreto nº 6.306/2007, art. 7º (alíquotas PF vigentes desde o fim do aumento temporário do Decreto nº 10.797/2021)',
      url: 'https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2007/decreto/d6306.htm',
    },
  },
];
