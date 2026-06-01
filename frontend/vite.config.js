import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true, // Нужно для корректного Hot Reload внутри Docker
    },
  },
  // ДОБАВЬ ЭТУ СЕКЦИЮ СЮДА:
  define: {
    global: 'window', // Принудительно заменяем global на window при сборке
  },
});