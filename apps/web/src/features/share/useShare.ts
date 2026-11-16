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

const MENSAGEM_GENERICA = 'Algo deu errado. Tente de novo.';
const MENSAGEM_COPIADO = `Link copiado. Ele vale por ${SHARE_TTL_DAYS} dias.`;
const MENSAGEM_MANUAL = 'Não foi possível copiar sozinho. Selecione o link abaixo e copie.';

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
    } catch (erro) {
      status.value = 'error';
      message.value = erro instanceof ApiError ? erro.problem.detail : MENSAGEM_GENERICA;
      return;
    }

    if (await copyToClipboard(link)) {
      status.value = 'copied';
      message.value = MENSAGEM_COPIADO;
    } else {
      status.value = 'manual';
      message.value = MENSAGEM_MANUAL;
    }
  }

  return { status, url, message, share };
}
