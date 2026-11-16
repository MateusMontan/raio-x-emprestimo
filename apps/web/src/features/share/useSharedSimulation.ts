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

const MENSAGEM_GENERICA = 'Algo deu errado. Tente de novo.';

function isAbortError(erro: unknown): boolean {
  return erro instanceof Error && erro.name === 'AbortError';
}

/** Carrega uma simulação compartilhada (F4). `getId` é lido a cada carga. */
export function useSharedSimulation(getId: () => string): SharedSimulationState {
  const status = ref<SharedStatus>('loading');
  const shared = ref<SharedSimulation | null>(null);
  const message = ref<string | null>(null);
  let controller: AbortController | undefined;

  async function load(): Promise<void> {
    controller?.abort();
    const atual = new AbortController();
    controller = atual;
    status.value = 'loading';
    message.value = null;

    try {
      const data = await getSharedSimulation(getId(), atual.signal);
      if (atual.signal.aborted) return;
      shared.value = data;
      status.value = 'success';
    } catch (erro) {
      if (atual.signal.aborted || isAbortError(erro)) return;
      shared.value = null;
      if (erro instanceof ApiError && erro.status === 404) {
        status.value = 'not-found';
        return;
      }
      status.value = 'error';
      message.value = erro instanceof ApiError ? erro.problem.detail : MENSAGEM_GENERICA;
    }
  }

  onScopeDispose(() => controller?.abort());

  return { status, shared, message, load };
}
