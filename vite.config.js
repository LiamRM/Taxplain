import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite config — outputs to ./dist for GitHub Pages.
// Set `base` to "./" so the build works whether served at the domain root
// or at /<repo-name>/ on GitHub Pages.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist",
  },
});
