import { defineConfig } from 'vitest/config'

/**
 * Unit-test config for the branch-scoped ABAC (lib/access). These are pure
 * logic tests: the access module has no runtime dependency on Payload or a DB
 * (a fake `req.payload` is injected), so they run fast in a plain node env.
 */
export default defineConfig({
  test: {
    include: ['lib/**/*.test.ts'],
    environment: 'node',
  },
})
