import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import { globalIgnores } from 'eslint/config'
import globals from 'globals'
import pluginVitest from '@vitest/eslint-plugin'
import pluginVue from 'eslint-plugin-vue'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
      },
    },
  },

  {
    files: ['**/*.{ts,mts,tsx,vue}'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',

      'vue/multi-word-component-names': 'off',
      'vue/no-unused-components': 'warn',
      'vue/no-v-html': 'off',
      'vue/block-lang': 'off',

      "indent": ["warn", 2],
      "arrow-spacing": "warn",
      "space-infix-ops": "warn",
      "no-multi-spaces": "warn",
      "no-trailing-spaces": "warn",
      "no-unused-vars": "warn",
      "no-console": "warn",
      "no-debugger": "warn",
      "no-undef": "warn",
      "no-unused-expressions": "warn",
      "no-constant-condition": "warn",
      "no-empty": "warn",
      "no-extra-semi": "warn",
      "no-fallthrough": "warn",
      "no-irregular-whitespace": "warn",
      "no-mixed-spaces-and-tabs": "warn",
      "no-redeclare": "warn",
      "no-duplicate-imports": "warn",
      "no-var": "off",

      "sort-imports": ["off", {
        "ignoreCase": false,
        "ignoreDeclarationSort": false,
        "ignoreMemberSort": false,
        "memberSyntaxSortOrder": ["none", "all", "multiple", "single"],
        "allowSeparatedGroups": false,
      }],
      "comma-dangle": ["warn", {
        "arrays": "always-multiline",
        "objects": "always-multiline",
        "imports": "always-multiline",
        "exports": "always-multiline",
        "functions": "ignore",
      }],
      "array-bracket-spacing": ["warn", "never", {
        "singleValue": false,
        "objectsInArrays": false,
        "arraysInArrays": false,
      }],
      "space-in-parens": ["warn", "never"],
      "object-curly-spacing": ["warn", "always", {
        "arraysInObjects": false,
        "objectsInObjects": false,
      }],
      "vue/attributes-order": ["warn", {
        "order": [
          "DEFINITION",
          "LIST_RENDERING",
          "CONDITIONALS",
          "RENDER_MODIFIERS",
          "GLOBAL",
          ["UNIQUE", "SLOT"],
          "TWO_WAY_BINDING",
          "OTHER_DIRECTIVES",
          "OTHER_ATTR",
          "EVENTS",
          "CONTENT",
        ],
        "alphabetical": true,
      }],
    },
  },
  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },
)
