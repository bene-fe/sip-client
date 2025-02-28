import tseslint from '@electron-toolkit/eslint-config-ts'
import eslintConfigPrettier from '@electron-toolkit/eslint-config-prettier'
import eslintPluginReact from 'eslint-plugin-react'
import eslintPluginReactHooks from 'eslint-plugin-react-hooks'
import eslintPluginReactRefresh from 'eslint-plugin-react-refresh'

export default tseslint.config(
  { ignores: ['**/node_modules', '**/dist', '**/out'] },
  tseslint.configs.recommended,
  eslintPluginReact.configs.flat.recommended,
  eslintPluginReact.configs.flat['jsx-runtime'],
  {
    settings: {
      react: {
        version: 'detect'
      }
    }
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': eslintPluginReactHooks,
      'react-refresh': eslintPluginReactRefresh
    },
    rules: {
      ...eslintPluginReactHooks.configs.recommended.rules,
      ...eslintPluginReactRefresh.configs.vite.rules,
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      'react/no-children-prop': 'off',
      'react/no-unstable-nested-components': 'off',
      'react/no-unknown-property': 'off',
      'react/no-unused-vars': 'off',
      'react/no-unused-prop-types': 'off',
      'react/no-unused-state': 'off',
      'react/no-unused-imports': 'off',
      'react/no-unused-imports-ts': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-prop-types': 'off',
      '@typescript-eslint/no-unused-state': 'off',
      '@typescript-eslint/no-unused-imports': 'off',
      '@typescript-eslint/no-unused-imports-ts': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off'
    }
  },
  eslintConfigPrettier
)
