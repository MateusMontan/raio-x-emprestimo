import { TaxPolicyNotFoundError } from '../errors';
import { IsoDate } from '../date/IsoDate';
import { TAX_POLICIES } from './taxPolicies';
import type { TaxPolicy } from './TaxPolicy';

/** Devolve a versão com `validFrom` mais recente que ainda não passou de `asOf`. */
export function taxPolicyFor(
  asOf: IsoDate,
  policies: readonly TaxPolicy[] = TAX_POLICIES,
): TaxPolicy {
  let chosen: TaxPolicy | undefined;
  let chosenFrom: IsoDate | undefined;
  for (const policy of policies) {
    const from = IsoDate.parse(policy.validFrom);
    if (from.daysUntil(asOf) < 0) continue;
    if (!chosenFrom || chosenFrom.daysUntil(from) > 0) {
      chosen = policy;
      chosenFrom = from;
    }
  }
  if (!chosen) {
    throw new TaxPolicyNotFoundError(asOf.value);
  }
  return chosen;
}
