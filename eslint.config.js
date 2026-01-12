import { globalIgnores } from 'eslint/config'
import globals from 'globals'
import pluginVitest from '@vitest/eslint-plugin'
import js from '@eslint/js'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,cjs}'],
  },

  globalIgnores(['**/dist/**', '**/coverage/**', '**/node_modules/**']),

  // Базовые рекомендованные правила ESLint
  js.configs.recommended,

  // Глобальные переменные
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
  },

  // Пользовательские правила
  {
    rules: {
      'indent': ['warn', 2],
      'arrow-spacing': 'warn',
      'space-infix-ops': 'warn',
      'no-multi-spaces': 'warn',
      'no-trailing-spaces': 'warn',
      'no-unused-vars': 'warn',
      'no-console': 'warn',
      'no-debugger': 'warn',
      'no-undef': 'warn',
      'no-unused-expressions': 'warn',
      'no-constant-condition': 'warn',
      'no-empty': 'warn',
      'no-extra-semi': 'warn',
      'no-fallthrough': 'warn',
      'no-irregular-whitespace': 'warn',
      'no-mixed-spaces-and-tabs': 'warn',
      'no-redeclare': 'warn',
      'no-duplicate-imports': 'warn',
      'no-var': 'off',
      'no-unreachable': 'off', // Отключает удаление кода после process.exit()

      'sort-imports': ['off', {
        'ignoreCase': false,
        'ignoreDeclarationSort': false,
        'ignoreMemberSort': false,
        'memberSyntaxSortOrder': ['none', 'all', 'multiple', 'single'],
        'allowSeparatedGroups': false,
      }],
      'comma-dangle': ['warn', {
        'arrays': 'always-multiline',
        'objects': 'always-multiline',
        'imports': 'always-multiline',
        'exports': 'always-multiline',
        'functions': 'ignore',
      }],
      'array-bracket-spacing': ['warn', 'never', {
        'singleValue': false,
        'objectsInArrays': false,
        'arraysInArrays': false,
      }],
      'space-in-parens': ['warn', 'never'],
      'object-curly-spacing': ['warn', 'always', {
        'arraysInObjects': false,
        'objectsInObjects': false,
      }],
    },
  },

  // Конфигурация для тестов Vitest
  {
    ...pluginVitest.configs.recommended,
    files: ['**/__tests__/**/*', '**/*.test.js', '**/*.spec.js'],
  },
]
