/** Atributos que o BaseField entrega ao controle: id, descrição e estado de erro. */
export interface FieldAttrs {
  id: string;
  describedBy?: string | undefined;
  invalid?: boolean | undefined;
}
