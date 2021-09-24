module.exports = {
  root: true,
  extends: ['@react-native-community', 'prettier/@typescript-eslint', 'plugin:prettier/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    'no-console': 'warn',
    'react-hooks/exhaustive-deps': 0,
    'react-hooks/rules-of-hooks': 0,
    '@typescript-eslint/no-unused-vars': 0,
  },
}
