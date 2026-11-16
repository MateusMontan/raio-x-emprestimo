/** Caso de uso de limpeza, visto só pelo que o Cron precisa dele. */
export interface PurgeRunner {
  execute(): Promise<number>;
}

/** Executa a limpeza disparada pelo Cron e registra quantas simulações foram removidas. */
export async function purgeOnSchedule(purge: PurgeRunner): Promise<number> {
  const deleted = await purge.execute();
  console.log(`[cron] simulações expiradas removidas: ${deleted}`);
  return deleted;
}
