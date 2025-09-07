module.exports = {
  root: true,
  extends: [
    '@expo/eslint-config',
    'eslint:recommended',
    '@typescript-eslint/recommended'
  ],
  rules: {
    // Prevent common issues that can cause unresponsive UI
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-alert': 'error',
    'no-unused-vars': 'off', // Let TypeScript handle this
    '@typescript-eslint/no-unused-vars': ['warn'],
    'react-hooks/exhaustive-deps': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    
    // Async/Promise best practices
    'no-async-promise-executor': 'error',
    'no-await-in-loop': 'warn',
    'no-promise-executor-return': 'error',
    'require-await': 'warn',
    
    // Error handling
    'no-empty': 'error',
    'no-empty-function': 'warn',
    'no-implicit-coercion': 'warn',
    
    // Performance
    'react/jsx-no-bind': 'warn',
    'react/jsx-no-literals': 'off',
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-hooks'],
  env: {
    node: true,
    browser: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
};
