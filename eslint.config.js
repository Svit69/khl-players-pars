import js from '@eslint/js';
import pluginImport from 'eslint-plugin-import';

export default [
  {
    ignores: ['node_modules/**', 'public/assets/**', 'public/flags/**', 'dist/**', 'coverage/**'],
  },
  {
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: true,
        document: true,
        console: true,
        navigator: true,
        setTimeout: true,
        clearTimeout: true,
      },
    },
    plugins: {
      import: pluginImport,
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'import/no-unresolved': 'off',
    },
  },
];
