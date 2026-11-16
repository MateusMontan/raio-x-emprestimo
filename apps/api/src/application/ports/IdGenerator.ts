/** Gera identificadores curtos para simulações compartilhadas. */
export interface IdGenerator {
  next(): string;
}
