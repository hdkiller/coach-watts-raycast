import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    alias: {
      "@raycast/api": path.resolve(__dirname, "./tests/mocks/raycast-api.ts"),
      "@raycast/utils": path.resolve(__dirname, "./tests/mocks/raycast-utils.ts"),
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*"],
      exclude: ["src/**/*.d.ts"],
    },
  },
});
