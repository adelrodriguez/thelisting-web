/// <reference types="vitest" />
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [tsconfigPaths()],

  test: {
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/playwright/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress}.config.*",
    ],
    setupFiles: ["./tests/setup.ts", "./mocks/index.ts"],
  },
})
