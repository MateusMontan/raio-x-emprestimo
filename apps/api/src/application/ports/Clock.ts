/** Relógio do sistema. Única fonte de "agora" na camada de aplicação. */
export interface Clock {
  now(): Date;
}
