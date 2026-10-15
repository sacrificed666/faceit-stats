import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(new URL("./src/test/emptyModule.ts", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    // One jsdom per worker with each test file in its own context: about twice as fast
    pool: "vmThreads",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/test/setup.ts"],
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/app/**", "src/features/seo/og/**", "src/test/**", "src/types/**", "src/**/*.test.{ts,tsx}"],
      reporter: ["text", "html", "json-summary"],
      thresholds: {
        statements: 96,
        branches: 89,
        functions: 96,
        lines: 97,
      },
    },
  },
});
