/** Remove simulações expiradas (vencidas até o instante informado). Devolve quantas foram apagadas. */
export interface SimulationPurger {
  deleteExpired(nowIso: string): Promise<number>;
}
