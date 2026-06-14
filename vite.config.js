// @ts-check
import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';

import { mitaHmrPlugin } from 'mita-dom';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    mitaHmrPlugin(),
    // Fallback inteligente para navegadores que no soportan ES Modules o Web Components
    legacy({
      targets: ['defaults', 'not IE 11'], // Navegadores antiguos (Excepto IE11 que ya murió)
      polyfills: ['es.promise.finally', 'es/map', 'es/set'], // Inyección automática de Core-JS
    })
  ],

  resolve: {
    alias: {
      '@mita-docs': fs.existsSync(path.resolve(__dirname, '../mita-dom/package.json'))
        ? path.resolve(__dirname, '../mita-dom')
        : path.resolve(__dirname, 'node_modules/mita-dom')
    }
  },

  // Evitar que Vite limpie la consola constantemente, así podemos leer advertencias/errores
  clearScreen: false,

  server: {
    // Esencial para SPAs: Si recargas /perfil, redirige a index.html en vez de dar 404 de servidor
    historyApiFallback: true,
  },

  build: {
    // Minificamos el código, pero NO destruimos los logs porque nuestro Logger
    // maneja internamente la Telemetría (envío asíncrono al backend) en Producción.
    minify: 'terser'
  }
});
