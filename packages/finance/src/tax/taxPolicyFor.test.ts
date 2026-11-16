import { describe, expect, it } from 'vitest';
import { TaxPolicyNotFoundError } from '../errors';
import { IsoDate } from '../date/IsoDate';
import { TAX_POLICIES } from './taxPolicies';
import { taxPolicyFor } from './taxPolicyFor';
import type { TaxPolicy } from './TaxPolicy';

const v1: TaxPolicy = { ...TAX_POLICIES[0]!, id: 'v1', validFrom: '2020-01-01' };
const v2: TaxPolicy = { ...v1, id: 'v2', validFrom: '2025-06-01', additionalRate: 0.0045 };

describe('taxPolicyFor', () => {
  it('usa a política vigente na data de contratação', () => {
    expect(taxPolicyFor(IsoDate.parse('2026-11-15')).id).toBe(TAX_POLICIES[0]?.id);
  });

  it('escolhe a versão mais recente já vigente, respeitando a data de vigência', () => {
    const policies = [v2, v1];
    expect(taxPolicyFor(IsoDate.parse('2025-05-31'), policies).id).toBe('v1');
    expect(taxPolicyFor(IsoDate.parse('2025-06-01'), policies).id).toBe('v2');
    expect(taxPolicyFor(IsoDate.parse('2030-01-01'), policies).id).toBe('v2');
  });

  it('lança erro quando nenhuma política está vigente na data', () => {
    expect(() => taxPolicyFor(IsoDate.parse('2019-12-31'), [v1])).toThrow(TaxPolicyNotFoundError);
  });

  it('a política padrão cita alíquotas da SPEC e a norma com link', () => {
    const policy = TAX_POLICIES[0];
    expect(policy?.dailyRate).toBe(0.000082);
    expect(policy?.additionalRate).toBe(0.0038);
    expect(policy?.maxDays).toBe(365);
    expect(policy?.legalReference.url).toMatch(/^https:\/\//);
  });
});
