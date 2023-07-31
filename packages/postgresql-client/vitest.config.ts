import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    mockReset: true,
    globalSetup: './packages/postgresql-client/setupTests.ts',
  },
})
