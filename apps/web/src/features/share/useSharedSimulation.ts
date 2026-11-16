import { onScopeDispose, ref, type Ref } from 'vue';
import type { SharedSimulation } from '@raiox/contracts';
import { getSharedSimulation } from '../../shared/api/client';
import { ApiError } from '../../shared/api/errors';

export type SharedStatus = 'loading' | 'success' | 'not-found' | 'error';

export interface SharedSimulationState {
  status: Ref<SharedStatus>;
  shared: Ref<SharedSimulation | null>;
  /** Mensagem de erro para a tela, quando status é 'error'. */
  message: Ref<string | null>;
  load: () => Promise<void>;
}

const GENERIC_MESSAGE = 'Algo deu errado. Tente de novo.';

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

/** Carrega uma simulação compartilhada (F4). `getId` é lido a cada carga. */
export function useSharedSimulation(getId: () => string): SharedSimulationState {
  const status = ref<SharedStatus>('loading');
  const shared = ref<SharedSimulation | null>(null);
  const message = ref<string | null>(null);
  let controller: AbortController | undefined;

  async function load(): Promise<void> {
    controller?.abort();
    const current = new AbortController();
    controller = current;
    status.value = 'loading';
    message.value = null;

    try {
      const data = await getSharedSimulation(getId(), current.signal);
      if (current.signal.aborted) return;
      shared.value = data;
      status.value = 'success';
    } catch (error) {
      if (current.signal.aborted || isAbortError(error)) return;
      shared.value = null;
      if (error instanceof ApiError && error.status === 404) {
        status.value = 'not-found';
        return;
      }
      status.value = 'error';
      message.value = error instanceof ApiError ? error.problem.detail : GENERIC_MESSAGE;
    }
  }

  onScopeDispose(() => controller?.abort());

  return { status, shared, message, load };
}
