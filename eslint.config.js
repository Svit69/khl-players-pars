import pluginImport from 'eslint-plugin-import';

export default [
  {
    ignores: ['node_modules/', 'public/assets/', 'public/flags/', 'package-lock.json'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        document: true,
        window: true,
        navigator: true,
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
