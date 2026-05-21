import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/AR_Space/',
  plugins: [
    react(),
    tailwindcss(),
  ],
})
