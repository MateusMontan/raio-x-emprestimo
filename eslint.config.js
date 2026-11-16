// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
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
  prettier,
);
