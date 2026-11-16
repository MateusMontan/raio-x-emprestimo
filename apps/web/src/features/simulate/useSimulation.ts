import { reactive } from 'vue';
import {
  simulationInputSchema,
  type SimulationInput,
  type SimulationResult,
} from '@raiox/contracts';
import { calculateSimulation } from '../../shared/api/client';
import { todayIso } from '../../shared/today';
import { useValidatedRequest, type ValidatedRequest } from '../../shared/useValidatedRequest';
import {
  FORM_FIELDS,
  createDefaultForm,
  fromInput,
  toCandidate,
  type FormField,
  type SimulationFormState,
} from './simulationForm';

export type { RequestStatus as SimulationStatus } from '../../shared/useValidatedRequest';

export type Simulation = ValidatedRequest<SimulationInput, SimulationResult, FormField> & {
  form: SimulationFormState;
  load: (input: SimulationInput) => void;
};

/** Estado da simulação (F1) para uma tela. Sem store global: cada uso cria o seu. */
export function useSimulation(): Simulation {
  const form = reactive<SimulationFormState>(createDefaultForm(todayIso()));
  const request = useValidatedRequest({
    form,
    fields: FORM_FIELDS,
    toCandidate,
    validator: simulationInputSchema,
    send: (input, signal) => calculateSimulation(input, signal),
  });

  function load(input: SimulationInput): void {
    Object.assign(form, fromInput(input));
    request.errors.value = {};
  }

  return { form, ...request, load };
}
