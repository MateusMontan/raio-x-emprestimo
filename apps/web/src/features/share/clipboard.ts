/** Copia texto para a área de transferência. Devolve false se o navegador não deixar. */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!('clipboard' in navigator)) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
