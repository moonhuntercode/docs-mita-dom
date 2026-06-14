import { defineConfig } from 'vitest/config';

export default defineConfig({
  server: {
    fs: {
      allow: ['..'] // Permite a la UI de Vitest leer el paquete mita-dom en el nivel superior
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.js'],
    include: ['test/**/*.test.js'],
    api: {
      port: 3005,
      host: '127.0.0.1'
    }
  }
});
