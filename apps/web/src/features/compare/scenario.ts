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
    const lido = simulationInputSchema.safeParse(input);
    return lido.success ? { kind: 'simulation', input: lido.data } : null;
  }
  const lido = offerInputSchema.safeParse(input);
  return lido.success ? { kind: 'offer', input: lido.data } : null;
}

function isRecord(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null;
}

/** Revalida o que veio do sessionStorage e descarta os itens inválidos. */
export function parseStoredScenarios(bruto: unknown): Scenario[] {
  if (!Array.isArray(bruto)) return [];
  const cenarios: Scenario[] = [];
  for (const item of bruto) {
    if (cenarios.length >= MAX_COMPARE_SCENARIOS) break;
    if (!isRecord(item)) continue;
    const { id, label, kind, input } = item;
    if (typeof id !== 'string' || typeof label !== 'string') continue;
    if (kind !== 'simulation' && kind !== 'offer') continue;
    const draft = toDraft(kind, input);
    if (draft) cenarios.push({ ...draft, id, label });
  }
  return cenarios;
}
