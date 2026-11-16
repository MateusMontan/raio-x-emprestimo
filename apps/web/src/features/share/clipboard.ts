/** Copia texto para a área de transferência. Devolve false se o navegador não deixar. */
export async function copyToClipboard(texto: string): Promise<boolean> {
  if (!('clipboard' in navigator)) return false;
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    return false;
  }
}
