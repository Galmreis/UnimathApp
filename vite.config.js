import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config. The React plugin enables JSX + Fast Refresh (hot reload).
// That's all we need — Vite handles bundling, dev server and CSS Modules natively.
export default defineConfig({
  plugins: [react()],
})
