/// <reference types="vitest/config" />
import path from 'node:path'
import { defineProject } from 'vitest/config'


export default defineProject({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './app'),
    },
  },
})
