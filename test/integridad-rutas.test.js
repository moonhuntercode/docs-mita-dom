import { describe, it, expect } from 'vitest';
import { DOCS_MAP } from '../src/componentes/mita-docs/docsRegistry.js';
import mitaDocsNavHtml from '../src/componentes/mita-docs-nav/mita-docs-nav.html?raw';

describe('Integridad de Enlaces de Navegación', () => {

  it('Debe tener todos los archivos Markdown de la barra de navegación en caché (Evitar 404s)', () => {
    // 1. Extraer todos los href que apuntan a /docs/ del HTML
    // Buscamos patrones como: href="/docs/filosofia"
    const regex = /href="\/docs\/([^"]+)"/g;
    const linksEncontrados = [];
    let match;

    while ((match = regex.exec(mitaDocsNavHtml)) !== null) {
      linksEncontrados.push(match[1]); // e.g. "filosofia", "readme"
    }

    expect(linksEncontrados.length).toBeGreaterThan(0); // Validar que encontramos enlaces

    // 2. Comprobar que cada enlace esté en el DOCS_MAP de la caché
    const missingDocs = [];
    for (const docId of linksEncontrados) {
      // readme suele ser un alias de MitaDOM (Readme), 
      // pero en DOCS_MAP se indexa bajo su nombre base.
      if (!DOCS_MAP[docId.toLowerCase()]) {
        missingDocs.push(docId);
      }
    }

    // 3. Fallar el test si falta algún documento, mostrando exactamente cuáles
    if (missingDocs.length > 0) {
      throw new Error(
        `🚨 INTEGRITY CHECK FALLIDO: Se encontraron enlaces en <mita-docs-nav> apuntando a vistas inexistentes.\n` +
        `Faltan los siguientes archivos .md en src/assets/mita-docs-cache (o mita-dom/docs): \n` +
        missingDocs.join(', ') +
        `\n\n Solución: Crea los archivos faltantes o corrige los enlaces HTML.`
      );
    }
    
    expect(missingDocs.length).toBe(0);
  });

});
