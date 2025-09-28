module.exports = {
  extends: ['./.eslintrc.cjs'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'import/no-anonymous-default-export': 'off',
  },
  overrides: [
    {
      files: ['lib/utils/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'warn',
        'import/no-anonymous-default-export': 'off',
      },
    },
  ],
};
