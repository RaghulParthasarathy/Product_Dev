import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin"
    },
    host: '0.0.0.0', // Bind to all available interfaces (important for deployment)
    port: process.env.PORT ? Number(process.env.PORT) : 5173, // Use Render's dynamic PORT environment variable, fallback to 5173 if not available
    allowedHosts: [
      'localhost',
      'product-dev-kriti-25-front-end.onrender.com' // Allow your Render deployment
    ],
  },
  define: {
    "process.env": {}, // Prevents Babel from throwing process-related errors
  },
});
