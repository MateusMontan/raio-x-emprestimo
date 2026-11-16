import type { AssetsFetcher } from '../types';

/** HTML que o fake de assets devolve para qualquer caminho, como a SPA faria. */
export const FAKE_PAGE_HTML =
  '<!doctype html><html lang="pt-BR"><head><title>Raio-X</title></head><body><div id="app"></div></body></html>';

/** Assets em memória: guarda as URLs pedidas e devolve sempre a página da SPA. */
export class FakeAssets implements AssetsFetcher {
  readonly requestedUrls: string[] = [];

  fetch(request: Request): Promise<Response> {
    this.requestedUrls.push(request.url);
    return Promise.resolve(
      new Response(FAKE_PAGE_HTML, {
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8', 'x-asset-source': 'fake' },
      }),
    );
  }
}
