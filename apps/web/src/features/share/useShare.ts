import { ref, type Ref } from 'vue';
import { SHARE_TTL_DAYS, type SimulationInput } from '@raiox/contracts';
import { shareSimulation } from '../../shared/api/client';
import { ApiError } from '../../shared/api/errors';
import { copyToClipboard } from './clipboard';

export type ShareStatus = 'idle' | 'loading' | 'copied' | 'manual' | 'error';

export interface ShareState {
  status: Ref<ShareStatus>;
  /** Link curto, quando já foi criado. */
  url: Ref<string | null>;
  /** Mensagem para o leitor de tela e para a tela. */
  message: Ref<string | null>;
  share: (input: SimulationInput) => Promise<void>;
}

const GENERIC_MESSAGE = 'Algo deu errado. Tente de novo.';
const COPIED_MESSAGE = `Link copiado. Ele vale por ${SHARE_TTL_DAYS} dias.`;
const MANUAL_MESSAGE = 'Não foi possível copiar sozinho. Selecione o link abaixo e copie.';

/** Salva a simulação (F4) e leva o link para a área de transferência. */
export function useShare(): ShareState {
  const status = ref<ShareStatus>('idle');
  const url = ref<string | null>(null);
  const message = ref<string | null>(null);

  async function share(input: SimulationInput): Promise<void> {
    let link: string;
    status.value = 'loading';
    message.value = null;
    try {
      const criado = await shareSimulation(input);
      link = criado.url;
      url.value = link;
    } catch (error) {
      status.value = 'error';
      message.value = error instanceof ApiError ? error.problem.detail : GENERIC_MESSAGE;
      return;
    }

    if (await copyToClipboard(link)) {
      status.value = 'copied';
      message.value = COPIED_MESSAGE;
    } else {
      status.value = 'manual';
      message.value = MANUAL_MESSAGE;
    }
  }

  return { status, url, message, share };
}
