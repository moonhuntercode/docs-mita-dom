import { defineConfig } from 'vitest/config';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localMitaDomSrc = path.resolve(__dirname, '../mita-dom/src/index.js');
const localMitaDomDist = path.resolve(__dirname, '../mita-dom/dist/mita-dom.js');
const aliasMitaDom = fs.existsSync(localMitaDomSrc)
  ? { 'mita-dom': localMitaDomSrc }
  : fs.existsSync(localMitaDomDist)
    ? { 'mita-dom': localMitaDomDist }
    : {};

export default defineConfig({
  resolve: {
    alias: aliasMitaDom
  },
  server: {
    fs: {
      allow: ['..'] // Permite a la UI de Vitest leer el paquete mita-dom en el nivel superior
    }
  },
  test: {
    environment: 'jsdom',
    pool: 'vmThreads',
    globals: true,
    setupFiles: ['./test/setup.js'],
    include: ['test/**/*.test.js'],
    api: {
      port: 3005,
      host: '127.0.0.1'
    }
  }
});
