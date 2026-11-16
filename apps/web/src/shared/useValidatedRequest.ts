import { onScopeDispose, ref, watch, type Ref } from 'vue';
import { ApiError } from './api/errors';

export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';
export type FieldErrors<Field extends string> = Partial<Record<Field, string>>;

/** Forma mínima de um schema Zod: basta para validar sem acoplar ao zod. */
export interface InputValidator<Input> {
  safeParse(value: unknown): ValidationOutcome<Input>;
}

type ValidationOutcome<Input> =
  | { success: true; data: Input }
  | { success: false; error: { issues: readonly ValidationIssue[] } };

interface ValidationIssue {
  path: readonly PropertyKey[];
  message: string;
}

export interface ValidatedRequestOptions<Form extends object, Input, Output, Field extends string> {
  /** Estado editável do formulário (reativo). */
  form: Form;
  /** Campos do formulário, na ordem da tela. Erros fora dessa lista não aparecem por campo. */
  fields: readonly Field[];
  /** Converte o formulário na entrada crua aceita pelo schema. */
  toCandidate: (form: Form) => unknown;
  validator: InputValidator<Input>;
  /** Chamada à API. Recebe o sinal para cancelar a requisição anterior. */
  send: (input: Input, signal: AbortSignal) => Promise<Output>;
  /** Atraso do recálculo automático, em ms. */
  debounceMs?: number;
}

export interface ValidatedRequest<Input, Output, Field extends string> {
  errors: Ref<FieldErrors<Field>>;
  generalError: Ref<string | null>;
  status: Ref<RequestStatus>;
  result: Ref<Output | null>;
  /** Entrada validada que gerou `result`. */
  resultInput: Ref<Input | null>;
  /** true só quando o resultado atual veio de envio explícito. */
  isFresh: Ref<boolean>;
  submit: () => Promise<void>;
}

const DEBOUNCE_MS = 400;
const GENERIC_MESSAGE = 'Algo deu errado. Tente de novo.';

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

/**
 * Mecânica comum de uma tela de cálculo: valida, chama a API, cancela a
 * chamada anterior, mapeia erros por campo e recalcula com debounce depois
 * do primeiro envio. Cada feature fornece o schema, o formulário e a chamada.
 */
export function useValidatedRequest<Form extends object, Input, Output, Field extends string>(
  options: ValidatedRequestOptions<Form, Input, Output, Field>,
): ValidatedRequest<Input, Output, Field> {
  const { form, fields, toCandidate, validator, send } = options;
  const debounceMs = options.debounceMs ?? DEBOUNCE_MS;

  const errors = ref<FieldErrors<Field>>({}) as Ref<FieldErrors<Field>>;
  const generalError = ref<string | null>(null);
  const status = ref<RequestStatus>('idle');
  const result = ref<Output | null>(null) as Ref<Output | null>;
  const resultInput = ref<Input | null>(null) as Ref<Input | null>;
  const isFresh = ref(false);

  /* Depois da primeira tentativa, erros aparecem ao mudar o formulário. */
  let engaged = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let controller: AbortController | undefined;

  function isField(key: string): key is Field {
    return (fields as readonly string[]).includes(key);
  }

  /** Primeira mensagem de cada campo conhecido. Campos desconhecidos ficam de fora. */
  function errorsFromIssues(issues: readonly ValidationIssue[]): FieldErrors<Field> {
    const byField: FieldErrors<Field> = {};
    for (const issue of issues) {
      const key = String(issue.path[0] ?? '');
      if (isField(key)) byField[key] ??= issue.message;
    }
    return byField;
  }

  function clearTimer(): void {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
  }

  function validate(): Input | null {
    const parsed = validator.safeParse(toCandidate(form));
    if (parsed.success) {
      errors.value = {};
      return parsed.data;
    }
    errors.value = errorsFromIssues(parsed.error.issues);
    return null;
  }

  function handleError(error: unknown): void {
    status.value = 'error';
    if (!(error instanceof ApiError)) {
      generalError.value = GENERIC_MESSAGE;
      return;
    }
    const known: FieldErrors<Field> = {};
    for (const [key, message] of Object.entries(error.fieldErrors())) {
      if (isField(key)) known[key] = message;
    }
    if (error.status === 422 && Object.keys(known).length > 0) {
      errors.value = known;
      return;
    }
    generalError.value = error.problem.detail;
  }

  async function run(fresh: boolean): Promise<void> {
    const input = validate();
    if (!input) return;

    controller?.abort();
    const current = new AbortController();
    controller = current;
    status.value = 'loading';
    generalError.value = null;

    try {
      const data = await send(input, current.signal);
      if (current.signal.aborted) return;
      result.value = data;
      resultInput.value = input;
      isFresh.value = fresh;
      status.value = 'success';
    } catch (error) {
      if (current.signal.aborted || isAbortError(error)) return;
      handleError(error);
    }
  }

  function onFormChange(): void {
    if (!engaged) return;
    clearTimer();
    const input = validate();
    if (input && result.value !== null) {
      timer = setTimeout(() => {
        void run(false);
      }, debounceMs);
    }
  }

  watch(() => form, onFormChange, { deep: true });

  onScopeDispose(() => {
    clearTimer();
    controller?.abort();
  });

  async function submit(): Promise<void> {
    engaged = true;
    clearTimer();
    await run(true);
  }

  return { errors, generalError, status, result, resultInput, isFresh, submit };
}
