import type { IdGenerator } from '../ports/IdGenerator';

/** Devolve ids da lista, na ordem. Falha se acabarem, para o teste não mascarar o erro. */
export class SequenceIdGenerator implements IdGenerator {
  private index = 0;

  constructor(private readonly ids: readonly string[]) {}

  next(): string {
    const id = this.ids[this.index];
    if (id === undefined) {
      throw new Error('SequenceIdGenerator sem ids restantes');
    }
    this.index += 1;
    return id;
  }
}
