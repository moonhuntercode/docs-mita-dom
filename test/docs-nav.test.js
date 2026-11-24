import { describe, it, expect, beforeEach } from 'vitest';
import { rutaActual } from 'mita-dom';
import {
  estadoDocActivo,
  estadoDocsLocales,
  guardarDocEnDbLocal,
  eliminarDocDeDbLocal
} from '../src/store/docsStore.js';
import '../src/componentes/mita-docs-nav/mita-docs-nav.js';
import '../src/componentes/mita-docs/mita-docs.js';

describe('MitaDocsNav (<mita-docs-nav>) — Buscador, Acordeones y Limpieza v2.7', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    rutaActual.set('/docs/readme');
    estadoDocActivo.set('readme');
  });

  it('muestra el índice en /docs, filtra documentos en vivo y limpia suscripciones al desmontar', async () => {
    const nav = document.createElement('mita-docs-nav');
    document.body.appendChild(nav);
    await new Promise((r) => setTimeout(r, 20));

    expect(nav.style.display).toBe('block');
    expect(nav.querySelectorAll('details.docs-accordion').length).toBeGreaterThanOrEqual(5);

    // 1. Probar buscador en tiempo real (v2.7.0 histórico + v2.8.0 actual 2026-11-24)
    const input = nav.querySelector('#docs-nav-search');
    expect(input).not.toBeNull();
    input.value = 'v2.7.0';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    const visibles = Array.from(nav.querySelectorAll('.docs-accordion-list li')).filter((li) => !li.hidden);
    expect(visibles.length).toBeGreaterThanOrEqual(1);
    expect(visibles[0].textContent).toContain('v2.7.0');

    // 1b. Verificar Changelog v2.8.0 (2026-11-24) e Informe Técnico v2.8.0 en índice y buscador
    expect(nav.querySelector('a[href="/docs/2026-11-24-v2.8.0"]')).not.toBeNull();
    expect(nav.querySelector('a[href="/docs/informe_tecnico_v2.8.0_2026-11-24"]')).not.toBeNull();
    input.value = 'v2.8.0';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    const visiblesV28 = Array.from(nav.querySelectorAll('.docs-accordion-list li')).filter((li) => !li.hidden);
    expect(visiblesV28.length).toBeGreaterThanOrEqual(2);
    expect(visiblesV28.some((li) => li.textContent.includes('2026-11-24'))).toBe(true);

    // 2. Probar estado sin resultados
    input.value = 'documento-inexistente-xyz';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(nav.querySelector('#docs-nav-empty').hidden).toBe(false);

    // 3. Limpiar búsqueda y verificar enlace activo + auto-apertura de acordeón
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    estadoDocActivo.set('auto_api_referencia');
    const activo = nav.querySelector('a[href="/docs/auto_api_referencia"]');
    expect(activo.classList.contains('activo')).toBe(true);

    // 4. Ocultar fuera de /docs
    rutaActual.set('/');
    expect(nav.style.display).toBe('none');

    // 5. Auto-limpieza en disconnectedCallback (0 memory leaks)
    const subsAntes = estadoDocActivo.suscriptores.size;
    nav.remove();
    expect(estadoDocActivo.suscriptores.size).toBe(subsAntes - 1);
  });

  it('MitaDocs (<mita-docs>): permite buscar/filtrar adentro, ajustar tamaño de letra (A-/A+) y usar el Dashboard Admin con File System Sync', async () => {
    estadoDocsLocales.set({});
    const docsView = document.createElement('mita-docs');
    document.body.appendChild(docsView);
    await new Promise((r) => setTimeout(r, 30));
    if (docsView._cargaDocsPromesa) await docsView._cargaDocsPromesa;

    // 1. Probar controles visuales de tamaño de letra (A+, A-)
    const btnInc = docsView.querySelector('#btn-font-increase');
    const btnRes = docsView.querySelector('#btn-font-reset');
    btnInc.click();
    expect(docsView.querySelector('#out-font-size').textContent).toBe('18px');
    expect(docsView.querySelector('#markdown-container').style.fontSize).toBe('18px');
    btnRes.click();
    expect(docsView.querySelector('#out-font-size').textContent).toBe('16px');

    // 2. Dashboard Admin está destruido del DOM por defecto (renderCondicional)
    expect(docsView.querySelector('#docs-admin-dashboard')).toBeNull();
    docsView.querySelector('#btn-toggle-admin-docs').click();
    expect(docsView.querySelector('#docs-admin-dashboard')).not.toBeNull();

    // 3. Probar buscador y filtro interno dentro de /docs
    const searchIn = docsView.querySelector('#docs-inline-search');
    searchIn.value = 'Anti-Spam';
    searchIn.dispatchEvent(new Event('input', { bubbles: true }));
    const panelRes = docsView.querySelector('#docs-filter-results');
    expect(panelRes.hidden).toBe(false);

    // 4. Guardar un documento personalizado en DB Local y verificar que se renderice en vivo
    guardarDocEnDbLocal('mi_doc_personalizado', {
      titulo: 'Mi Guía DB Local',
      categoria: 'local',
      contenido: '# Mi Guía DB Local\n\nContenido guardado en localStorage, IndexedDB y File System.'
    });
    estadoDocActivo.set('mi_doc_personalizado');
    await new Promise((r) => setTimeout(r, 20));

    expect(docsView.querySelector('#markdown-container').textContent).toContain('Mi Guía DB Local');
    expect(docsView.querySelector('#docs-local-badge').hidden).toBe(false);

    // 5. Probar Gamificación de Lectura (+50 XP) y Resaltador de Texto (<mark>)
    docsView.querySelector('#btn-mark-doc-read').click();
    expect(docsView.querySelector('#gamif-badge-level').textContent).toContain('XP');
    const hlInput = docsView.querySelector('#input-highlight-term');
    hlInput.value = 'Local';
    docsView.querySelector('#btn-add-highlight').click();
    expect(docsView.querySelector('#markdown-container mark.docs-user-highlight')).not.toBeNull();

    // 6. Restaurar / eliminar de DB Local
    eliminarDocDeDbLocal('mi_doc_personalizado');
    expect(estadoDocsLocales.get().mi_doc_personalizado).toBeUndefined();
    docsView.remove();
  });
});
