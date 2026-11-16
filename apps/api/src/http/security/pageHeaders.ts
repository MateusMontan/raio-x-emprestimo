/**
 * Política da página do front (/s/*). Mesma regra de apps/web/public/_headers, mas aplicada
 * pela própria API: a resposta não depende de o binding de assets repassar o _headers.
 */
export const PAGE_CONTENT_SECURITY_POLICY =
  "default-src 'self'; script-src 'self'; style-src 'self'; style-src-attr 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";

/** Headers aplicados em toda resposta de página: status muda com o link, então nunca cacheia. */
export const PAGE_SECURITY_HEADERS: Readonly<Record<string, string>> = {
  'Content-Security-Policy': PAGE_CONTENT_SECURITY_POLICY,
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'no-store',
};
