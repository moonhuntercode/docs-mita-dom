// @ts-check
import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { mitaHmrPlugin } from 'mita-dom';
import mitaTelemetryPlugin from './vite-plugin-mita-telemetry.js';

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
  optimizeDeps: {
    exclude: ['mita-dom']
  },
  plugins: [
    mitaTelemetryPlugin(),
    mitaHmrPlugin()
  ],

  // Evitar que Vite limpie la consola constantemente, así podemos leer advertencias/errores
  clearScreen: false,

  server: {
    // Esencial para SPAs: Si recargas /perfil, redirige a index.html en vez de dar 404 de servidor
    historyApiFallback: true,
  },

  build: {
    // Vite 8 (Rolldown + Oxc en Rust): `minify: true` es ~20x más rápido que `terser` en JS,
    // preserva los console.* de nuestro Logger por defecto y elimina el cuello de botella [PLUGIN_TIMINGS].
    minify: true,
    // Code Splitting real (Vite 8 / Rolldown) para mantener cada chunk muy por debajo de 500 kB
    // SIN silenciar ni elevar chunkSizeWarningLimit.
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'docs-referencia',
              test: /mita-docs-cache[\\/]docs[\\/]referencia/
            },
            {
              name: 'docs-aprende',
              test: /mita-docs-cache[\\/]docs[\\/](aprende|filosofia)/
            },
            {
              name: 'docs-changelogs',
              test: /mita-docs-cache[\\/](changelogs|docs[\\/]changelogs)/
            },
            {
              name: 'vendor-marked',
              test: /node_modules[\\/]marked/
            },
            {
              name: 'vendor-mita-dom',
              test: /mita-dom[\\/](src|dist)/
            }
          ]
        }
      }
    }
  }
});
