import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    mockReset: true,
    globalSetup: './clients/postgresql-client/setupTests.ts',
  },
})
