import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'
import { adminCmsPlugin } from "./vite-admin-cms"

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const plugins = [inspectAttr(), react()]

  // Middleware runs only when running dev server, never bundled in production build
  if (command === 'serve') {
    plugins.push(adminCmsPlugin())
  }

  return {
    base: command === 'build' ? '/portfolio/' : '/',
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})
