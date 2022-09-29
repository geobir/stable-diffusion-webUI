module.exports = {
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:react/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    root: true,
    rules: {
      "no-unused-vars": 0, // TOREMOVE LATER
    },
  };