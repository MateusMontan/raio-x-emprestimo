/** Atributos que o BaseField entrega ao controle: id, descrição e estado de erro. */
export interface FieldAttrs {
  id: string;
  describedBy?: string | undefined;
  invalid?: boolean | undefined;
}

/** Junta ids de descrição (dica, unidade, erro), ignorando os ausentes. */
export function joinIds(...ids: (string | undefined)[]): string | undefined {
  const presentes = ids.filter((id): id is string => Boolean(id));
  return presentes.length > 0 ? presentes.join(' ') : undefined;
}
