import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypeScript from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  globalIgnores([
    '.next/**',
    'dist/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'legacy-vue/**',
    'src/**',
    'vite.config.ts',
    'tsconfig.app.json',
    'tsconfig.node.json',
  ]),
  {
    rules: {
      // Firebase listeners and countdown callbacks intentionally transition local UI state.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])
