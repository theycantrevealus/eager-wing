import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "#assets": path.resolve(__dirname, "src/assets"),
      "#types": path.resolve(__dirname, "src/types"),
      "#stores": path.resolve(__dirname, "src/stores"),
      "#interfaces": path.resolve(__dirname, "src/interfaces"),
      "#constants": path.resolve(__dirname, "src/constants"),
      "#utils": path.resolve(__dirname, "src/utils"),
      "#GL": path.resolve(__dirname, "src/gl"),
      "#vite/components": path.resolve(__dirname, "src/components"),
    },
  },
})
