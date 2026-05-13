import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["**/*.test.ts"],
    restoreMocks: true,
    clearMocks: true,
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
