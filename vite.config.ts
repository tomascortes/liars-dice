import { defineConfig } from "vite";

export default defineConfig({
  root: "./front",
  base: process.env.NODE_ENV === 'production' ? '/liars-dice/' : '/',
  server: {
    port: 3000,
    open: false,
  },
  optimizeDeps: {
    exclude: ["phaser"],
  },
});
