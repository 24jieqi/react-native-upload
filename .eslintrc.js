module.exports = {
  root: true,
  extends: ['@fruits-chain/eslint-config-rn'],
  // parser: '@typescript-eslint/parser',
  // plugins: ['@typescript-eslint'],
  rules: {
    'no-console': 'warn',
    'react-hooks/exhaustive-deps': 0,
    'react-hooks/rules-of-hooks': 0,
    '@typescript-eslint/no-unused-vars': 0,
    'import/no-named-as-default': 0,
    '@typescript-eslint/no-require-imports': 0,
    '@typescript-eslint/consistent-type-assertions': 0,
  },
}
