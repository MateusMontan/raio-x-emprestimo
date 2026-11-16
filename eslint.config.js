// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import pluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/.wrangler/**',
      '**/node_modules/**',
      '**/*.config.js',
      '**/*.config.ts',
    ],
  },
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    },
  },
  {
    files: ['apps/api/src/application/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: ['hono'],
          patterns: [
            {
              group: ['hono/*', '@hono/*'],
              message: 'A camada de aplicação não conhece Hono.',
            },
            {
              group: ['**/infrastructure/**', '**/http/**'],
              message:
                'A camada de aplicação depende só de ports, nunca de infraestrutura ou HTTP.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/api/src/http/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/infrastructure/**'],
              message: 'A camada HTTP depende de application e contracts, nunca de infraestrutura.',
            },
          ],
        },
      ],
    },
  },
  /*
   * Vue: as regras de template vêm do plugin; o <script> usa o parser TS sem
   * informação de tipos (o vue-tsc cobre os tipos de .vue).
   */
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
        projectService: false,
      },
    },
  },
  {
    files: ['**/*.vue'],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    /* Regras da raiz que exigem tipos: sem tipos em .vue, o vue-tsc cobre. */
    files: ['**/*.vue'],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    /* O front roda no navegador; os testes usam os mesmos globais (jsdom). */
    files: ['apps/web/**/*.{ts,vue}'],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['**/App.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
  prettier,
);
