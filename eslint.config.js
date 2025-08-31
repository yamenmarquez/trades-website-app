// Root ESLint flat config to lint all workspaces
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
// import * as path from 'node:path'; // Commented out to avoid parser complaints

export default [
  // Global ignores (applied before other configs)
  {
    ignores: [
      '**/*.d.ts',
      'scripts/**',
      'node_modules/**',
      'dist/**',
      '.next/**',
      'coverage/**',
      '.turbo/**',
      '.venv/**',
      '.vscode/**',
      '.husky/**',
      '.git/**',
      'apps/**/.next/**',
      'apps/**/next-env.d.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.config(tseslint.configs.recommended),
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        project: false,
      },
    },
    rules: { '@typescript-eslint/no-explicit-any': 'error' },
  },
];
