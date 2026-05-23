import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      react: path.resolve(__dirname, "../node_modules/react"),
      "react-dom": path.resolve(__dirname, "../node_modules/react-dom"),
      "react/jsx-dev-runtime": path.resolve(__dirname, "../node_modules/react/jsx-dev-runtime.js"),
      "react/jsx-runtime": path.resolve(__dirname, "../node_modules/react/jsx-runtime.js")
    }
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"]
  }
});
