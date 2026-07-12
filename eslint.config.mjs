import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const innerHtmlRestriction = {
  selector:
    "MemberExpression[property.name='innerHTML'], MemberExpression[property.value='innerHTML']",
  message: 'Do not access innerHTML; construct trusted DOM nodes instead.',
};

export default tseslint.config(
  {
    ignores: [
      'artifacts/**',
      'coverage/**',
      'dist/**',
      'node_modules/**',
      'out/**',
      '.superpowers/**',
      '.vscode-test/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    rules: {
      'no-restricted-syntax': ['error', innerHtmlRestriction],
    },
  },
  {
    files: ['scripts/**/*.{js,mjs,cjs}', '*.config.{js,mjs,cjs}', '.vscode-test.mjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['webview/**/*.ts'],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['test/unit/**/*.ts', 'vitest.config.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
  },
  {
    files: ['test/integration/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.mocha,
        ...globals.node,
      },
    },
  },
);
