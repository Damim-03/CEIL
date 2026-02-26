import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist", // Output to client/dist/
    sourcemap: false, // Smaller bundle for production
  },
  server: {
    proxy: {
      "/api": "http://localhost:8000", // Only used in development
    },
  },
});
