/*
 * Shim de `*.vue` para as ferramentas que só enxergam TypeScript (ESLint com
 * tipos). O vue-tsc usa os tipos reais dos componentes no typecheck.
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}
