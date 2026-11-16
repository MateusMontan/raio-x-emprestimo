import { simulationInputSchema } from '@raiox/contracts';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { shareSimulation } from '../../shared/api/client';
import { ApiError } from '../../shared/api/errors';
import { useShare } from './useShare';

vi.mock('../../shared/api/client', () => ({ shareSimulation: vi.fn() }));

const compartilhar = vi.mocked(shareSimulation);
const SHORT_URL = 'https://raiox.exemplo/s/abc123';

function entry() {
  return simulationInputSchema.parse({
    amountCents: 1_000_000,
    monthlyRate: 0.02,
    installments: 12,
    system: 'PRICE',
    contractDate: '2026-11-15',
  });
}

function setClipboard(valor: unknown): void {
  Object.defineProperty(globalThis.navigator, 'clipboard', { value: valor, configurable: true });
}

describe('useShare', () => {
  beforeEach(() => {
    compartilhar.mockReset();
    compartilhar.mockResolvedValue({
      id: 'abc123',
      url: SHORT_URL,
      expiresAt: '2027-05-14T12:00:00.000Z',
    });
  });

  afterEach(() => {
    setClipboard(undefined);
  });

  it('copia o link e avisa que vale por 180 dias', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });
    const compartilhamento = useShare();

    await compartilhamento.share(entry());

    expect(writeText).toHaveBeenCalledWith(SHORT_URL);
    expect(compartilhamento.status.value).toBe('copied');
    expect(compartilhamento.message.value).toBe('Link copiado. Ele vale por 180 dias.');
    expect(compartilhamento.url.value).toBe(SHORT_URL);
  });

  it('cai no modo manual quando não há área de transferência', async () => {
    setClipboard(undefined);
    const compartilhamento = useShare();

    await compartilhamento.share(entry());

    expect(compartilhamento.status.value).toBe('manual');
    expect(compartilhamento.url.value).toBe(SHORT_URL);
    expect(compartilhamento.message.value).toContain('Selecione o link abaixo');
  });

  it('cai no modo manual quando a cópia falha', async () => {
    setClipboard({ writeText: vi.fn().mockRejectedValue(new Error('negado')) });
    const compartilhamento = useShare();

    await compartilhamento.share(entry());

    expect(compartilhamento.status.value).toBe('manual');
  });

  it('mostra o detail do problema quando a API responde 429', async () => {
    compartilhar.mockRejectedValue(
      new ApiError({
        type: 'about:blank',
        title: 'Muitas tentativas',
        status: 429,
        detail: 'Muitas tentativas seguidas. Espere um pouco e tente de novo.',
      }),
    );
    const compartilhamento = useShare();

    await compartilhamento.share(entry());

    expect(compartilhamento.status.value).toBe('error');
    expect(compartilhamento.message.value).toBe(
      'Muitas tentativas seguidas. Espere um pouco e tente de novo.',
    );
    expect(compartilhamento.url.value).toBeNull();
  });
});
