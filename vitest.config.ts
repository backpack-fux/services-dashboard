import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    browser: {
      enabled: false,
      name: "chromium",
    },
    globals: true,
    environment: "jsdom",
    setupFiles: ["src/tests/integration/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "src/tests/integration/setup.ts"],
    },
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    exclude: ["**/e2e/**", "**/node_modules/**"],
  },
});