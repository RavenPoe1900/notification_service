// eslint.config.js  –  ESLint v9+  (Flat Config)
import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';
import prettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  /* ───────────────────────── 0. IGNORE PATHS  ───────────────────────── */
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      'coverage/',
      '.turbo/',          // Turborepo monorepos
      '.next/', 'out/',   // Next.js / SSG
      '**/*.min.js',
    ],
  },

  /* ───────────────────────── 1. BASE JS / TS  ───────────────────────── */
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    plugins: {
      unusedImports,
    },
    rules: {
      /* Recommended ESLint "pure" rules */
      ...pluginJs.configs.recommended.rules,

      /* General best practices */
      eqeqeq: ['error', 'smart'],
      'no-var': 'error',
      'prefer-const': ['error', { destructuring: 'all' }],
      curly: ['error', 'multi-line', 'consistent'],
      'object-shorthand': ['error', 'always'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',

      /* Automatic cleanup of unused imports/vars */
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
      ],
    },
  },

  /* ───────────────────────── 2. TYPE-SCRIPT  ───────────────────────── */
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: process.cwd(),
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      /* TS rules with type checking and style */
      ...tseslint.configs.recommendedTypeChecked.rules,
      ...tseslint.configs.stylisticTypeChecked.rules,

      /* Extra TS best practices */
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', disallowTypeAnnotations: false },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: false },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },

  /* ───────────────────────── 3. TESTS (Jest) ───────────────────────── */
  {
    files: [
      '**/*.test.{js,jsx,ts,tsx}',
      '**/__tests__/**/*.{js,jsx,ts,tsx}',
    ],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      /* In tests, console and unused variables are allowed */
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  /* ───────────────────────── 4. PRETTIER (disables formatting rules) */
  ...prettier,
];