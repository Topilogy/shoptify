// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [
//     tailwindcss(),
//     react()
//   ],
// })
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],

  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://192.168.1.19:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})