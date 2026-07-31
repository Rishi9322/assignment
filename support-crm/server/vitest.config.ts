import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globalSetup: "./tests/globalSetup.ts",
    env: {
      DATABASE_URL: "file:./prisma/test.db",
      JWT_SECRET: "test-secret-do-not-use-in-prod",
      JWT_EXPIRES_IN: "1h",
      CORS_ORIGIN: "http://localhost:5173",
      NODE_ENV: "test",
      WEBAUTHN_RP_ID: "localhost",
      WEBAUTHN_ORIGIN: "http://localhost:5173",
      WEBAUTHN_RP_NAME: "Support CRM Test",
    },
    testTimeout: 20000,
    hookTimeout: 30000,
    // All test files share one SQLite file and call resetDb() in beforeEach.
    // Running files concurrently (vitest's default) interleaves one file's
    // deletes with another's in-flight inserts against the same tables —
    // both singleFork *and* disabling file parallelism are needed to make
    // that safe.
    pool: "forks",
    singleFork: true,
    fileParallelism: false,
  },
});
