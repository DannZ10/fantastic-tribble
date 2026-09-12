import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // three.js is dynamically imported by Gallery, so Rollup splits it out on
    // its own. Raise the warning limit only for that chunk's sake.
    chunkSizeWarningLimit: 700,
  },
})
