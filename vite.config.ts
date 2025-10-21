import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "__&types": path.resolve(__dirname, "src/types"),
      "__&interfaces": path.resolve(__dirname, "src/interfaces"),
      "__&constants": path.resolve(__dirname, "src/constants"),
      "__&utils": path.resolve(__dirname, "src/utils"),
      "__&GL": path.resolve(__dirname, "src/gl"),
      "__&vite/components": path.resolve(__dirname, "src/components"),
    },
  },
})
