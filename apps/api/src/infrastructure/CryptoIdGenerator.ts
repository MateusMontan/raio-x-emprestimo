import type { IdGenerator } from '../application/ports/IdGenerator';

/** Fonte de bytes aleatórios: `crypto.getRandomValues` por padrão, injetável nos testes. */
export type RandomByteSource = (buffer: Uint8Array) => Uint8Array;

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const ID_LENGTH = 10;
/** 248 = 4 × 62: só bytes abaixo disso são usados, sem viés de módulo. */
const REJECTION_LIMIT = 248;

/** Gera ids de 10 caracteres base62 com bytes criptograficamente aleatórios. */
export class CryptoIdGenerator implements IdGenerator {
  constructor(
    private readonly randomBytes: RandomByteSource = (buf) => crypto.getRandomValues(buf),
  ) {}

  next(): string {
    let id = '';
    while (id.length < ID_LENGTH) {
      const buffer = this.randomBytes(new Uint8Array(ID_LENGTH));
      for (const byte of buffer) {
        if (byte >= REJECTION_LIMIT) continue;
        id += ALPHABET.charAt(byte % ALPHABET.length);
        if (id.length === ID_LENGTH) break;
      }
    }
    return id;
  }
}
