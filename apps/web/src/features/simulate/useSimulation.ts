import { onScopeDispose, reactive, ref, watch, type Ref } from 'vue';
import {
  simulationInputSchema,
  type SimulationInput,
  type SimulationResult,
} from '@raiox/contracts';
import { calculateSimulation } from '../../shared/api/client';
import { ApiError } from '../../shared/api/errors';
import { todayIso } from '../../shared/today';
import {
  FORM_FIELDS,
  createDefaultForm,
  fromInput,
  toCandidate,
  type FormErrors,
  type FormField,
  type SimulationFormState,
} from './simulationForm';

export type SimulationStatus = 'idle' | 'loading' | 'success' | 'error';

const DEBOUNCE_MS = 400;
const MENSAGEM_GENERICA = 'Algo deu errado. Tente de novo.';

export interface Simulation {
  form: SimulationFormState;
  errors: Ref<FormErrors>;
  generalError: Ref<string | null>;
  status: Ref<SimulationStatus>;
  result: Ref<SimulationResult | null>;
  /** Entrada validada que gerou `result`. */
  resultInput: Ref<SimulationInput | null>;
  /** true só quando o resultado atual veio de "Calcular". */
  isFresh: Ref<boolean>;
  submit: () => Promise<void>;
  load: (input: SimulationInput) => void;
}

function isFormField(chave: string): chave is FormField {
  return (FORM_FIELDS as readonly string[]).includes(chave);
}

/** Primeira mensagem de cada campo conhecido. Campos desconhecidos ficam de fora. */
function errorsFromIssues(issues: readonly { path: readonly PropertyKey[]; message: string }[]) {
  const porCampo: FormErrors = {};
  for (const issue of issues) {
    const chave = String(issue.path[0] ?? '');
    if (isFormField(chave)) porCampo[chave] ??= issue.message;
  }
  return porCampo;
}

function isAbortError(erro: unknown): boolean {
  return erro instanceof Error && erro.name === 'AbortError';
}

/** Estado da simulação (F1) para uma tela. Sem store global: cada uso cria o seu. */
export function useSimulation(): Simulation {
  const form = reactive<SimulationFormState>(createDefaultForm(todayIso()));
  const errors = ref<FormErrors>({});
  const generalError = ref<string | null>(null);
  const status = ref<SimulationStatus>('idle');
  const result = ref<SimulationResult | null>(null);
  const resultInput = ref<SimulationInput | null>(null);
  const isFresh = ref(false);

  /* Depois da primeira tentativa, erros aparecem ao mudar o formulário. */
  let engaged = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let controller: AbortController | undefined;

  function clearTimer(): void {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
  }

  function validate(): SimulationInput | null {
    const lido = simulationInputSchema.safeParse(toCandidate(form));
    if (lido.success) {
      errors.value = {};
      return lido.data;
    }
    errors.value = errorsFromIssues(lido.error.issues);
    return null;
  }

  function handleError(erro: unknown): void {
    status.value = 'error';
    if (!(erro instanceof ApiError)) {
      generalError.value = MENSAGEM_GENERICA;
      return;
    }
    const porCampo = erro.fieldErrors();
    const conhecidos: FormErrors = {};
    for (const [chave, mensagem] of Object.entries(porCampo)) {
      if (isFormField(chave)) conhecidos[chave] = mensagem;
    }
    if (erro.status === 422 && Object.keys(conhecidos).length > 0) {
      errors.value = conhecidos;
      return;
    }
    generalError.value = erro.problem.detail;
  }

  async function run(fresh: boolean): Promise<void> {
    const input = validate();
    if (!input) return;

    controller?.abort();
    const atual = new AbortController();
    controller = atual;
    status.value = 'loading';
    generalError.value = null;

    try {
      const data = await calculateSimulation(input, atual.signal);
      if (atual.signal.aborted) return;
      result.value = data;
      resultInput.value = input;
      isFresh.value = fresh;
      status.value = 'success';
    } catch (erro) {
      if (atual.signal.aborted || isAbortError(erro)) return;
      handleError(erro);
    }
  }

  function onFormChange(): void {
    if (!engaged) return;
    clearTimer();
    const input = validate();
    if (input && result.value !== null) {
      timer = setTimeout(() => {
        void run(false);
      }, DEBOUNCE_MS);
    }
  }

  watch(form, onFormChange, { deep: true });

  onScopeDispose(() => {
    clearTimer();
    controller?.abort();
  });

  async function submit(): Promise<void> {
    engaged = true;
    clearTimer();
    await run(true);
  }

  function load(input: SimulationInput): void {
    Object.assign(form, fromInput(input));
    errors.value = {};
  }

  return {
    form,
    errors,
    generalError,
    status,
    result,
    resultInput,
    isFresh,
    submit,
    load,
  };
}
