import type { TaxPolicy } from './TaxPolicy';

/**
 * Políticas de IOF versionadas. Uma mudança de alíquota é uma nova entrada com nova
 * `validFrom`, sem alterar o algoritmo. Manter em ordem crescente de `validFrom`.
 */
export const TAX_POLICIES: readonly TaxPolicy[] = [
  {
    id: 'br-iof-pf-credito-decreto-6306',
    validFrom: '2007-12-14',
    dailyRate: 0.000082,
    additionalRate: 0.0038,
    maxDays: 365,
    legalReference: {
      title: 'Decreto nº 6.306/2007, art. 7º',
      url: 'https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2007/decreto/d6306.htm',
    },
  },
];
