import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    workspace: ['packages/*', 'apps/*/vitest.config.ts'],
  },
})
