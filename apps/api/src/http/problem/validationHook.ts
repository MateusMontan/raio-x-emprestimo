import type { FieldError } from '@raiox/contracts';
import { problemResponse } from './problemResponse';
import { validationProblem } from './problems';

interface ValidationIssue {
  readonly path: readonly PropertyKey[];
  readonly message: string;
}

interface ValidationResult {
  readonly success: boolean;
  readonly error?: { readonly issues: readonly ValidationIssue[] };
}

/** Caminho com pontos, ex.: `installments` ou `iof.mode`. */
export function toFieldPath(path: readonly PropertyKey[]): string {
  return path.map((segment) => String(segment)).join('.');
}

/** Hook padrão do OpenAPIHono: falha de validação vira 422 com errors[] por campo. */
export function validationHook(result: ValidationResult): Response | undefined {
  if (result.success || result.error === undefined) return undefined;
  const errors: FieldError[] = result.error.issues.map((issue) => ({
    path: toFieldPath(issue.path),
    message: issue.message,
  }));
  return problemResponse(validationProblem(errors));
}
