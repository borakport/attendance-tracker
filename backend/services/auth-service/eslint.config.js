const js = require('@eslint/js');
const typescript = require('typescript-eslint');

module.exports = [
  {
    ignores: ['eslint.config.js', 'dist/**', 'node_modules/**', 'prisma/**'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      globals: {
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        console: 'readonly',
      }
    }
  },
  js.configs.recommended,
  ...typescript.configs.recommended,
  {
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off', // Allow any types for flexibility
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-namespace': 'off', // Allow namespaces
      'no-console': 'off', // Allow console statements
      'prefer-const': 'warn', // Warn instead of error
    },
  },
];
