// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    rules: {
      // TypeScript handles path resolution for @/ imports via tsconfig paths
      'import/no-unresolved': ['error', { ignore: ['^@/'] }],
    },
  },
]);
