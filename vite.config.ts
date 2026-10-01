import path from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  // es2015 keeps the bundle parseable by old Chrome/WebView builds
  // (optional chaining, nullish coalescing, class fields, nested CSS are all
  // downleveled). Runtime API polyfills live in src/polyfills.ts.
  build: { target: "es2015" },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
