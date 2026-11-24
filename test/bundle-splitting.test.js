import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import '../src/componentes/ui/mita-search.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Code Splitting y Presupuesto de Bundle (0 Warnings Vite > 500 kB)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('mita-search.js carga docsRegistry de forma diferida (sin import estático en el entry bundle)', async () => {
    const searchSrc = fs.readFileSync(
      path.resolve(__dirname, '../src/componentes/ui/mita-search.js'),
      'utf8'
    );

    // Prohibido importar docsRegistry de forma estática en mita-search.js
    expect(searchSrc).not.toMatch(/^import\s+.*docsRegistry/m);
    expect(searchSrc).toContain("import('../mita-docs/docsRegistry.js')");

    // Verifica que el buscador funciona realmente cargando el índice bajo demanda
    const buscador = document.createElement('mita-search');
    document.body.appendChild(buscador);
    await new Promise((r) => setTimeout(r, 20));

    expect(buscador.motorBusqueda).toBeNull();
    await buscador.realizarBusqueda('Signal');
    expect(buscador.motorBusqueda).not.toBeNull();
    expect(buscador.querySelectorAll('.search-result-item').length).toBeGreaterThan(0);
  });

  it('vite.config.js define codeSplitting real sin silenciar chunkSizeWarningLimit y usa Oxc nativo', () => {
    const viteCfg = fs.readFileSync(path.resolve(__dirname, '../vite.config.js'), 'utf8');
    expect(viteCfg).toContain('codeSplitting');
    expect(viteCfg).toContain('docs-referencia');
    expect(viteCfg).toContain('docs-aprende');
    expect(viteCfg).not.toMatch(/^\s*chunkSizeWarningLimit\s*:/m);
    expect(viteCfg).not.toMatch(/^\s*minify\s*:\s*['"]terser['"]/m);
    expect(viteCfg).toMatch(/^\s*minify\s*:\s*true/m);
    expect(viteCfg).not.toContain('@vitejs/plugin-legacy');

    const vitestCfg = fs.readFileSync(path.resolve(__dirname, '../vitest.config.js'), 'utf8');
    expect(vitestCfg).toMatch(/pool\s*:\s*['"]vmThreads['"]/);
  });
});
