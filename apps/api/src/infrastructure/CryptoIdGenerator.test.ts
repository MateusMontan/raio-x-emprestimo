import { describe, expect, it } from 'vitest';
import { CryptoIdGenerator } from './CryptoIdGenerator';

const ALPHABET = /^[0-9A-Za-z]{10}$/;

/** Fonte falsa que entrega os bytes na ordem dada, repetindo o último quando acabam. */
function sourceOf(bytes: number[]) {
  let pos = 0;
  return (buffer: Uint8Array): Uint8Array => {
    for (let i = 0; i < buffer.length; i++) {
      buffer[i] = bytes[Math.min(pos, bytes.length - 1)] ?? 0;
      pos++;
    }
    return buffer;
  };
}

describe('CryptoIdGenerator', () => {
  it('gera 10 caracteres do alfabeto base62', () => {
    const id = new CryptoIdGenerator().next();
    expect(id).toMatch(ALPHABET);
  });

  it('descarta bytes >= 248 e completa o id com os próximos bytes válidos', () => {
    // Primeiro bloco: 248 e 255 são descartados; restam 0, 61, 62, 1, 2, 3, 4, 5.
    // Segundo bloco: 6 e 7 completam o id; o 248 final é ignorado.
    // Mapeamento: 0→'0', 61→'z', 62%62=0→'0', 1..7→'1'..'7'.
    const bytes = [248, 0, 255, 61, 62, 1, 2, 3, 4, 5, 6, 7, 248];
    const id = new CryptoIdGenerator(sourceOf(bytes)).next();
    expect(id).toBe('0z01234567');
  });

  it('gera 1.000 ids sem repetição com a fonte real', () => {
    const generator = new CryptoIdGenerator();
    const ids = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      const id = generator.next();
      expect(id).toMatch(ALPHABET);
      ids.add(id);
    }
    expect(ids.size).toBe(1000);
  });
});
