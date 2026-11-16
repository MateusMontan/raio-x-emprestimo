import {
  MAX_COMPARE_SCENARIOS,
  offerInputSchema,
  simulationInputSchema,
  type OfferInput,
  type SimulationInput,
} from '@raiox/contracts';

export { MAX_COMPARE_SCENARIOS };

export type ScenarioKind = 'simulation' | 'offer';

/** Cenário validado, ainda sem identidade na lista. */
export type ScenarioDraft =
  { kind: 'simulation'; input: SimulationInput } | { kind: 'offer'; input: OfferInput };

/** Cenário da comparação: id estável, rótulo editável e entrada validada. */
export type Scenario = ScenarioDraft & { id: string; label: string };

/** Valida a entrada conforme o tipo. Devolve null se a entrada não passa no schema. */
export function toDraft(kind: ScenarioKind, input: unknown): ScenarioDraft | null {
  if (kind === 'simulation') {
    const parsed = simulationInputSchema.safeParse(input);
    return parsed.success ? { kind: 'simulation', input: parsed.data } : null;
  }
  const parsed = offerInputSchema.safeParse(input);
  return parsed.success ? { kind: 'offer', input: parsed.data } : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Revalida o que veio do sessionStorage e descarta os itens inválidos. */
export function parseStoredScenarios(raw: unknown): Scenario[] {
  if (!Array.isArray(raw)) return [];
  const scenarios: Scenario[] = [];
  for (const item of raw) {
    if (scenarios.length >= MAX_COMPARE_SCENARIOS) break;
    if (!isRecord(item)) continue;
    const { id, label, kind, input } = item;
    if (typeof id !== 'string' || typeof label !== 'string') continue;
    if (kind !== 'simulation' && kind !== 'offer') continue;
    const draft = toDraft(kind, input);
    if (draft) scenarios.push({ ...draft, id, label });
  }
  return scenarios;
}
