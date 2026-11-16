import { ref, watch } from 'vue';

interface FormattedInputOptions<T> {
  /** Valor do modelo, lido a cada mudança externa. */
  value: () => T | null;
  /** Texto exibido no campo para um valor. */
  format: (value: T) => string;
  /** Lê o texto digitado. Devolve null quando não é um valor. */
  parse: (text: string) => T | null;
  /** Avisa o pai do novo valor (ou null). */
  emit: (value: T | null) => void;
}

/**
 * Campo que digita em texto pt-BR e mantém um valor tipado.
 * Não reformata enquanto o usuário digita; formata ao sair do campo.
 */
export function useFormattedInput<T>(options: FormattedInputOptions<T>) {
  const initial = options.value();
  const text = ref(initial === null ? '' : options.format(initial));

  watch(options.value, (value) => {
    if (value !== options.parse(text.value)) {
      text.value = value === null ? '' : options.format(value);
    }
  });

  function onInput(event: Event): void {
    if (!(event.target instanceof HTMLInputElement)) return;
    text.value = event.target.value;
    options.emit(options.parse(text.value));
  }

  function onBlur(): void {
    const value = options.value();
    if (value !== null) text.value = options.format(value);
  }

  return { text, onInput, onBlur };
}
