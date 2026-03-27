// @ts-check
import { includeIgnoreFile } from '@eslint/compat';
import eslint from '@eslint/js';
import pluginImport from 'eslint-plugin-import';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const gitignorePath = import.meta.dirname + '/.gitignore';

/**
 * ESLint 9 flat config with native `defineConfig()`.
 * `tseslint.configs.recommendedTypeChecked` and `tseslint.configs.stylisticTypeChecked`
 * return flat-config-compatible objects and are safe to spread here.
 *
 * @see https://typescript-eslint.io/packages/typescript-eslint/#config-deprecated
 */
export default defineConfig([
  // ── Ignore patterns (flat config, replaces .eslintignore) ──────────────────
  includeIgnoreFile(gitignorePath),

  // ── Base ───────────────────────────────────────────────────────────────────
  eslint.configs.recommended,

  // ── TypeScript ──────────────────────────────────────────────────────────────
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // ── Prettier ───────────────────────────────────────────────────────────────
  eslintPluginPrettierRecommended,

  // ── Import plugin ───────────────────────────────────────────────────────────
  {
    plugins: {
      import: pluginImport,
    },
    rules: {
      'import/first': 'error',
      'import/newline-after-import': ['error', { count: 1 }],
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'off',
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling'],
            'index',
            'object',
            'type',
          ],
          pathGroups: [
            { pattern: '@nestjs/**', group: 'external', position: 'before' },
            { pattern: '@core/**', group: 'internal', position: 'before' },
            { pattern: '@shared/**', group: 'internal', position: 'before' },
            { pattern: '@auth/**', group: 'internal', position: 'before' },
          ],
          pathGroupsExcludedImportTypes: ['type'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-named-as-default': 'warn',
    },
  },

  // ── Global language options ─────────────────────────────────────────────────
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
        ...globals.es2025,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // ── Global rules ────────────────────────────────────────────────────────────
  {
    rules: {
      // ── TypeScript ────────────────────────────────────────────────────────
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'warn',

      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/consistent-indexed-object-style': ['error', 'record'],
      '@typescript-eslint/member-ordering': [
        'error',
        {
          default: [
            'private-static-field',
            'public-static-field',
            'public-instance-field',
            'private-instance-field',
            'constructor',
            'public-static-method',
            'private-static-method',
            'public-instance-method',
            'private-instance-method',
          ],
        },
      ],
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/no-misused-new': 'error',
      '@typescript-eslint/no-base-to-string': 'error',
      '@typescript-eslint/no-array-delete': 'warn',
      '@typescript-eslint/prefer-promise-reject-errors': [
        'error',
        { allowEmptyReject: true },
      ],
      '@typescript-eslint/no-var-requires': 'error',

      // ── Prettier ───────────────────────────────────────────────────────────
      'prettier/prettier': ['error', { endOfLine: 'auto' }],

      // ── Best practices ─────────────────────────────────────────────────────
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-empty': 'warn',
      'no-unused-vars': 'off',
      'prefer-const': 'error',
      'no-var': 'error',

      // ── Style ──────────────────────────────────────────────────────────────
      'spaced-comment': ['error', 'always', { markers: ['/'] }],
      'array-bracket-spacing': ['error', 'never'],
      'object-curly-spacing': ['error', 'always'],
      'object-curly-newline': ['error', { consistent: true }],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: ['const', 'let'], next: '*' },
        { blankLine: 'any', prev: ['const', 'let'], next: ['const', 'let'] },
      ],
      'lines-between-class-members': [
        'error',
        'always',
        { exceptAfterSingleLine: true },
      ],
    },
  },

  // ── Test files: relaxed rules ─────────────────────────────────────────────
  {
    files: ['**/*.spec.ts', '**/*.test.ts', 'test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-console': 'off',
      'no-debugger': 'off',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },

  // ── Config / bootstrap files: very relaxed ────────────────────────────────
  {
    files: ['**/configs/**/*.ts', '**/src/main.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },
]);
