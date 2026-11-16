import { parseStoredScenarios, type Scenario } from './scenario';

const STORAGE_KEY = 'raiox:comparison';

/** Lê a comparação salva na aba. Sem sessionStorage (ou JSON ruim), começa vazia. */
export function loadScenarios(): Scenario[] {
  try {
    const bruto = window.sessionStorage.getItem(STORAGE_KEY);
    if (bruto === null) return [];
    return parseStoredScenarios(JSON.parse(bruto));
  } catch {
    return [];
  }
}

/** Salva a comparação na aba. Falha silenciosa: a tela segue funcionando sem persistência. */
export function saveScenarios(scenarios: readonly Scenario[]): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
  } catch {
    /* sessionStorage indisponível: a comparação vale só nesta página. */
  }
}
