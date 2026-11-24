import { MitaElement } from '../../utils/MitaElement.js';
import { marked } from 'marked';
import {
  filtrarColeccion,
  renderCondicional,
  crearAmbitoConLimpiezaAutomatica,
  ejecutarConsejeroMitaDoc
} from 'mita-dom';
import {
  estadoDocActivo,
  estadoDocsLocales,
  estadoPreferenciasLectura,
  estadoAdminDocs,
  gestorPoliticasDocs,
  gestorGamificacionDocs,
  ajustarTamanoLetraDocs,
  guardarDocEnDbLocal,
  eliminarDocDeDbLocal,
  construirSnapshotFileSystem,
  sincronizarDbLocalConFileSystem,
  restaurarBackupEnDbLocal
} from '../../store/docsStore.js';
import '../ui/mita-dialog.js';

import htmlTemplate from './mita-docs.html?raw';
import './mita-docs.css';

function escaparHtml(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function transformarBloquesCodigo(html) {
  return html.replace(/<pre><code class="language-([^"]+)">([\s\S]*?)<\/code><\/pre>/g, (_match, lang, code) => {
    return `<mita-code-editor lenguaje="${lang}" archivo="ejemplo.${lang}"><pre><code class="language-${lang}">${code}</code></pre></mita-code-editor>`;
  });
}

function extraerPrimerTitulo(markdown, fallback) {
  const match = String(markdown || '').match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallback;
}

export class MitaDocs extends MitaElement {
  constructor() {
    super();
    this.ambitoMemoria = crearAmbitoConLimpiezaAutomatica('<mita-docs>');
    this._docsMap = {};
  }

  async render() {
    this.ambitoMemoria.reiniciarAmbitoParaNuevoRender();
    this.innerHTML = htmlTemplate;
    this.iniciarControlesLecturaVisual();
    this.iniciarDashboardAdminCondicional();
    this.iniciarLogica();
    this.iniciarLogicaUX();
    this.iniciarBuscadorYAdminLocal();

    this._cargaDocsPromesa = import('./docsRegistry.js')
      .then(({ DOCS_MAP }) => {
        if (!this.isConnected) return;
        this._docsMap = DOCS_MAP;
        if (typeof this._repintarDocumentoActivo === 'function') {
          this._repintarDocumentoActivo(estadoDocActivo.get());
        }
      })
      .catch(() => {
        // Ignorar si el componente ya fue desmontado durante teardown de tests
      });
    await this._cargaDocsPromesa;
  }

  iniciarControlesLecturaVisual() {
    const btnDec = this.querySelector('#btn-font-decrease');
    const btnRes = this.querySelector('#btn-font-reset');
    const btnInc = this.querySelector('#btn-font-increase');
    const btnComf = this.querySelector('#btn-reading-comfort');
    const btnToggleAdmin = this.querySelector('#btn-toggle-admin-docs');
    const outFont = this.querySelector('#out-font-size');
    const container = this.querySelector('#markdown-container');
    const btnMarkRead = this.querySelector('#btn-mark-doc-read');
    const btnHighlight = this.querySelector('#btn-add-highlight');
    const inputHighlight = this.querySelector('#input-highlight-term');
    const btnAdvisor = this.querySelector('#btn-docs-run-advisor');
    const btnCookiesAccept = this.querySelector('#btn-docs-cookies-accept');
    const btnCookiesEssential = this.querySelector('#btn-docs-cookies-essential');
    const pillCookies = this.querySelector('#docs-cookies-pill');
    const txtCookies = this.querySelector('#docs-cookies-text');

    this.ambitoMemoria.vincularSignalConLimpieza(
      gestorPoliticasDocs.estado,
      (st) => {
        if (pillCookies) {
          pillCookies.textContent = st.cookiesAnaliticas
            ? '🟢 Cookies + Analíticas ON'
            : '🛡️ Solo Cookies Esenciales';
        }
        if (txtCookies) {
          txtCookies.textContent = `${st.textoTerminos} (${st.eventosAnalitica.length} eventos registrados)`;
        }
      },
      'cookies-banner-docs'
    );

    this.ambitoMemoria.escucharEventoDomConLimpieza(btnCookiesAccept, 'click', () => {
      gestorPoliticasDocs.aceptarTodo();
    });
    this.ambitoMemoria.escucharEventoDomConLimpieza(btnCookiesEssential, 'click', () => {
      gestorPoliticasDocs.soloEsenciales();
    });
    this.ambitoMemoria.escucharEventoDomConLimpieza(btnAdvisor, 'click', () => {
      const diag = ejecutarConsejeroMitaDoc({ raizDom: this });
      if (this.$localBadge) {
        this.$localBadge.hidden = false;
        this.$localBadge.textContent = `🩺 Mita Doc Advisor (${diag.puntajeSalud}/100): ${diag.estadoGeneral} — ${diag.aciertos[0] || ''}`;
      }
    });

    const actualizarBarraGamificacion = () => {
      const totalCatalogo = this.obtenerCatalogoUnificado().length || 28;
      const res = gestorGamificacionDocs.obtenerResumenGamificacion(totalCatalogo, gestorPoliticasDocs);
      const docActual = estadoDocActivo.get();
      const yaLeido = (gestorGamificacionDocs.estado.get().documentosLeidos || []).includes(docActual);

      const badgeLvl = this.querySelector('#gamif-badge-level');
      const progTxt = this.querySelector('#gamif-progress-text');
      const precTxt = this.querySelector('#gamif-precision-out');

      if (badgeLvl) badgeLvl.textContent = `${res.nivelActual} • ${res.puntosXP} XP`;
      if (progTxt) {
        progTxt.textContent = `📚 ${res.leidosCount}/${res.totalCatalogoDocs} leídas (${res.porcentajeProgreso}%) • 🖍️ ${res.totalResaltados}`;
      }
      if (precTxt) {
        precTxt.textContent = `📊 Precisión: ${res.segundosLecturaAcumulados}s activos`;
      }
      if (btnMarkRead) {
        btnMarkRead.textContent = yaLeido ? '✅ Guía Completada' : '✅ Marcar Leída (+50 XP)';
      }
    };

    this.ambitoMemoria.vincularSignalConLimpieza(
      gestorGamificacionDocs.estado,
      () => actualizarBarraGamificacion(),
      'gamificacion-lectura'
    );

    this.ambitoMemoria.escucharEventoDomConLimpieza(btnMarkRead, 'click', () => {
      gestorGamificacionDocs.marcarDocumentoComoLeido(estadoDocActivo.get(), 35);
      if (estadoAdminDocs.get().autoGuardado) {
        sincronizarDbLocalConFileSystem().catch(() => {});
      }
    });

    this.ambitoMemoria.escucharEventoDomConLimpieza(btnHighlight, 'click', () => {
      const seleccionNavegador =
        typeof window !== 'undefined' && window.getSelection
          ? String(window.getSelection()?.toString() || '').trim()
          : '';
      const termino = (inputHighlight?.value || '').trim() || seleccionNavegador;
      if (!termino) return;
      gestorGamificacionDocs.agregarResaltadoDeTexto(estadoDocActivo.get(), termino, 'amarillo');
      if (inputHighlight) inputHighlight.value = '';
      // Re-aplicar resaltado en vivo sobre el contenedor actual
      if (this.$container) {
        this.$container.innerHTML = gestorGamificacionDocs.aplicarResaltadosEnHtml(
          estadoDocActivo.get(),
          this.$container.innerHTML
        );
      }
    });

    this.ambitoMemoria.vincularSignalConLimpieza(
      estadoPreferenciasLectura,
      (prefs) => {
        const size = prefs.fontSizePx || 16;
        this.style.setProperty('--docs-font-size', `${size}px`);
        if (container) {
          container.style.fontSize = `${size}px`;
          container.classList.toggle('docs-comfort-mode', Boolean(prefs.modoComodo));
        }
        if (outFont) outFont.textContent = `${size}px`;
        if (btnComf) {
          btnComf.textContent = prefs.modoComodo ? '📖 Lectura Cómoda: ON' : '📖 Lectura Cómoda';
        }
      },
      'preferencias-lectura'
    );

    this.ambitoMemoria.vincularSignalConLimpieza(
      estadoAdminDocs,
      (adm) => {
        if (btnToggleAdmin) {
          btnToggleAdmin.textContent = adm.esAdmin ? '🛡️ Modo Admin: ON' : '🛡️ Modo Admin: OFF';
        }
      },
      'toggle-admin-label'
    );

    this.ambitoMemoria.escucharEventoDomConLimpieza(btnDec, 'click', () => ajustarTamanoLetraDocs(-2));
    this.ambitoMemoria.escucharEventoDomConLimpieza(btnRes, 'click', () => ajustarTamanoLetraDocs(0));
    this.ambitoMemoria.escucharEventoDomConLimpieza(btnInc, 'click', () => ajustarTamanoLetraDocs(2));
    this.ambitoMemoria.escucharEventoDomConLimpieza(btnComf, 'click', () => {
      estadoPreferenciasLectura.patch({ modoComodo: !estadoPreferenciasLectura.get().modoComodo });
    });
    this.ambitoMemoria.escucharEventoDomConLimpieza(btnToggleAdmin, 'click', () => {
      estadoAdminDocs.patch({ esAdmin: !estadoAdminDocs.get().esAdmin });
    });
  }

  iniciarDashboardAdminCondicional() {
    const slot = this.querySelector('#docs-admin-dashboard-slot');
    if (!slot) return;

    const detenerCond = renderCondicional({
      estado: estadoAdminDocs,
      contenedor: slot,
      cuando: (adm) => adm.esAdmin === true,
      mostrar: (adm) => {
        const localesCount = Object.keys(estadoDocsLocales.get() || {}).length;
        const totalDocs = this.obtenerCatalogoUnificado().length;
        const politicas = gestorPoliticasDocs.estado.get();
        const saludMemoria = this.ambitoMemoria.auditarSaludDeMemoria();

        return `
          <aside id="docs-admin-dashboard" class="docs-admin-dashboard" aria-label="Dashboard exclusivo de administración de documentación">
            <header class="docs-admin-head">
              <h3>🛡️ Dashboard Exclusivo Admin — Auto-Documentación, DB Local y File System</h3>
              <label>
                <input type="checkbox" id="chk-admin-autosave" ${adm.autoGuardado ? 'checked' : ''} />
                <span>💾 Auto-guardar en File System</span>
              </label>
            </header>

            <ul class="docs-admin-kpis">
              <li class="docs-admin-kpi">
                <small>Catálogo Total</small>
                <strong>${totalDocs} guías activas</strong>
              </li>
              <li class="docs-admin-kpi">
                <small>Overrides DB Local + Repo</small>
                <strong>${localesCount} documentos</strong>
              </li>
              <li class="docs-admin-kpi">
                <small>Última Sync File System</small>
                <strong>${escaparHtml(adm.ultimaSincronizacionFs)}</strong>
              </li>
              <li class="docs-admin-kpi">
                <small>Rust Memory Guard</small>
                <strong>${saludMemoria.recursosActivosCount} recursos seguros</strong>
              </li>
            </ul>

            <menu class="docs-actions-menu">
              <li>
                <button type="button" id="btn-edit-doc-local" class="btn-secundario docs-action-btn">
                  ✏️ Editar Doc Actual
                </button>
              </li>
              <li>
                <button type="button" id="btn-new-doc-local" class="btn-secundario docs-action-btn">
                  ➕ Nuevo Doc
                </button>
              </li>
              <li>
                <button type="button" id="btn-restore-doc-local" class="btn-secundario docs-action-btn">
                  ↺ Restaurar Original
                </button>
              </li>
              <li>
                <button type="button" id="btn-sync-fs-now" class="btn-primario docs-action-btn">
                  🔄 Sincronizar con File System (Git Pull/Repo)
                </button>
              </li>
              <li>
                <button type="button" id="btn-backup-manual-json" class="btn-secundario docs-action-btn">
                  📥 Backup Manual (.json)
                </button>
              </li>
            </menu>

            <details class="docs-admin-policies">
              <summary><strong>🍪 Auto-Administrar Términos y Condiciones + URL Guía en la Nube</strong></summary>
              <form id="form-admin-terminos-docs" class="docs-admin-form">
                <label class="docs-admin-label">
                  Texto de Términos y Condiciones:
                  <input type="text" id="input-admin-terminos-txt" class="docs-inline-input" value="${escaparHtml(politicas.textoTerminos)}" required />
                </label>
                <label class="docs-admin-label">
                  URL de Guía en la Nube / Repositorio:
                  <input type="url" id="input-admin-guia-url" class="docs-inline-input" value="${escaparHtml(politicas.urlGuiaNube)}" required />
                </label>
                <button type="submit" class="btn-primario docs-action-btn">💾 Actualizar Términos y Sincronizar</button>
              </form>
            </details>

            <output id="docs-admin-status-out" class="docs-local-badge">${escaparHtml(adm.mensajeEstado)}</output>
          </aside>
        `;
      },
      sino: () => '',
      siempreActualizar: true
    });

    this.registrarLimpieza(detenerCond);

    this.ambitoMemoria.escucharEventoDomConLimpieza(slot, 'click', (e) => {
      const target = e.target;
      if (!target) return;
      if (target.id === 'btn-edit-doc-local') {
        this.abrirModalEditor(estadoDocActivo.get(), false);
      } else if (target.id === 'btn-new-doc-local') {
        this.abrirModalEditor('', true);
      } else if (target.id === 'btn-restore-doc-local') {
        eliminarDocDeDbLocal(estadoDocActivo.get());
      } else if (target.id === 'btn-sync-fs-now') {
        sincronizarDbLocalConFileSystem();
      } else if (target.id === 'btn-backup-manual-json') {
        this.descargarBackupManualJson();
      }
    });

    this.ambitoMemoria.escucharEventoDomConLimpieza(slot, 'change', (e) => {
      if (e.target && e.target.id === 'chk-admin-autosave') {
        estadoAdminDocs.patch({
          autoGuardado: Boolean(e.target.checked),
          mensajeEstado: e.target.checked
            ? '💾 Auto-guardado automático activado.'
            : '⏸️ Auto-guardado pausado (usa Backup Manual o Sincronizar).'
        });
      }
    });

    this.ambitoMemoria.escucharEventoDomConLimpieza(slot, 'submit', (e) => {
      if (e.target && e.target.id === 'form-admin-terminos-docs') {
        e.preventDefault();
        const txt = slot.querySelector('#input-admin-terminos-txt')?.value || '';
        const url = slot.querySelector('#input-admin-guia-url')?.value || '';
        gestorPoliticasDocs.actualizarTerminosYPoliticas({
          textoTerminos: txt,
          urlGuiaNube: url
        });
        sincronizarDbLocalConFileSystem();
      }
    });
  }

  descargarBackupManualJson() {
    const snapshot = construirSnapshotFileSystem();
    if (typeof Blob === 'undefined' || typeof URL.createObjectURL !== 'function') return snapshot;
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mita-docs-db-backup-${snapshot.sincronizadoEn}.json`;
    a.click();
    URL.revokeObjectURL(url);
    estadoAdminDocs.patch({
      mensajeEstado: `📥 Backup manual descargado: mita-docs-db-backup-${snapshot.sincronizadoEn}.json`
    });
    return snapshot;
  }

  obtenerCatalogoUnificado() {
    const locales = estadoDocsLocales.get() || {};
    const mapa = { ...(this._docsMap || {}) };

    for (const clave of Object.keys(locales)) {
      mapa[clave] = {
        idDoc: clave,
        categoria: locales[clave].categoria || 'local',
        contenido: locales[clave].contenido,
        esLocal: true,
        actualizadoEn: locales[clave].actualizadoEn
      };
    }

    return Object.values(mapa).map((doc) => ({
      idDoc: doc.idDoc,
      categoria: doc.esLocal ? 'local' : doc.categoria,
      categoriaOriginal: doc.categoria,
      titulo: extraerPrimerTitulo(doc.contenido, doc.idDoc),
      contenido: doc.contenido,
      esLocal: Boolean(doc.esLocal),
      actualizadoEn: doc.actualizadoEn || null
    }));
  }

  iniciarLogica() {
    this.$container = this.querySelector('#markdown-container');
    this.$localBadge = this.querySelector('#docs-local-badge');

    const changelogFiles = import.meta.glob('../../assets/mita-docs-cache/changelogs/*.md', {
      query: '?raw',
      import: 'default'
    });

    const pintarDocumentoActivo = async (idDoc) => {
      if (idDoc === 'changelog') {
        if (this.$localBadge) this.$localBadge.hidden = true;
        this.$container.innerHTML = '<h3>Cargando Registro de Cambios...</h3>';
        try {
          let fullChangelog =
            '# 🔄 Registro de Cambios (Changelog)\n\nHistorial completo de versiones de MitaDOM extraído automáticamente.\n\n';
          const paths = Object.keys(changelogFiles).sort().reverse();

          for (const path of paths) {
            const getMarkdown = changelogFiles[path];
            const mdContent = await getMarkdown();
            fullChangelog += mdContent + '\n\n---\n\n';
          }

          this.$container.innerHTML = transformarBloquesCodigo(marked.parse(fullChangelog));
        } catch (err) {
          console.error(err);
          this.renderErrorUI(err, 'Error al cargar los changelogs.');
        }
        return;
      }

      const locales = estadoDocsLocales.get() || {};
      const docLocal = locales[idDoc];
      const contenidoRaw = docLocal?.contenido || this._docsMap?.[idDoc]?.contenido;

      if (this.$localBadge) {
        this.$localBadge.hidden = !docLocal;
        if (docLocal) {
          this.$localBadge.textContent = `🗄️ Viendo versión sincronizada en DB Local + File System (${docLocal.actualizadoEn || 'hoy'}). Activa Modo Admin para editarla o restaurar el archivo original.`;
        }
      }

      if (!contenidoRaw) {
        this.$container.innerHTML = `
          <section style="text-align: center; padding: 3rem 1rem;">
            <h1 style="font-size: 3.5rem; margin: 0; color: var(--color-primario);">404</h1>
            <h2>Documento no encontrado</h2>
            <p style="opacity: 0.8; margin-bottom: 1.5rem;">
              El documento <strong>"${idDoc}.md"</strong> no existe en caché ni en tu DB Local.
            </p>
            <button type="button" id="btn-create-missing-doc" class="btn-primario" style="padding: 0.7rem 1.3rem; cursor: pointer;">
              ➕ Crear "${idDoc}" en DB Local + File System
            </button>
          </section>
        `;
        const btnCrearMissing = this.querySelector('#btn-create-missing-doc');
        if (btnCrearMissing) {
          btnCrearMissing.addEventListener('click', () => this.abrirModalEditor(idDoc, true));
        }
        return;
      }

      try {
        const htmlBase = transformarBloquesCodigo(marked.parse(contenidoRaw));
        const htmlConResaltados = gestorGamificacionDocs.aplicarResaltadosEnHtml(idDoc, htmlBase);
        this.$container.innerHTML = htmlConResaltados;
      } catch (err) {
        this.renderErrorUI(err, `Error al parsear el documento "${idDoc}"`);
      }
    };

    this._repintarDocumentoActivo = pintarDocumentoActivo;

    this.escucharEstado(estadoDocActivo, (idDoc) => {
      pintarDocumentoActivo(idDoc);
    });

    this.escucharEstado(estadoDocsLocales, () => {
      pintarDocumentoActivo(estadoDocActivo.get());
    });

    this.$container.addEventListener('click', (e) => {
      const $enlace = e.target.closest('a');
      if (!$enlace) return;

      const href = $enlace.getAttribute('href');
      if (href && href.toLowerCase().endsWith('.md')) {
        e.preventDefault();
        const partes = href.split('/');
        const archivo = partes[partes.length - 1];
        const idDoc = archivo.replace(/\.md$/i, '').toLowerCase();

        if (this._docsMap?.[idDoc] || (estadoDocsLocales.get() || {})[idDoc]) {
          if (window.navigation) {
            window.navigation.navigate(`/docs/${idDoc}`);
          } else {
            estadoDocActivo.set(idDoc);
          }
        }
      }
    });
  }

  iniciarBuscadorYAdminLocal() {
    const inputSearch = this.querySelector('#docs-inline-search');
    const selectCat = this.querySelector('#docs-category-filter');
    const panelResultados = this.querySelector('#docs-filter-results');
    const modal = this.querySelector('#modal-admin-doc');
    const form = this.querySelector('#form-admin-doc');
    const btnCancel = this.querySelector('#btn-cancel-admin-doc');

    const actualizarFiltro = () => {
      if (!panelResultados) return;
      const busqueda = inputSearch ? inputSearch.value.trim() : '';
      const categoria = selectCat ? selectCat.value : 'todos';

      if (!busqueda && categoria === 'todos') {
        panelResultados.hidden = true;
        panelResultados.innerHTML = '';
        return;
      }

      const catalogo = this.obtenerCatalogoUnificado();
      const resultados = filtrarColeccion(catalogo, {
        busqueda,
        categoria,
        campoCategoria: 'categoria',
        camposTexto: ['idDoc', 'titulo', 'contenido']
      }).slice(0, 12);

      panelResultados.hidden = false;
      if (resultados.length === 0) {
        panelResultados.innerHTML = `<p style="margin:0;">Sin coincidencias para "${busqueda}" en la categoría seleccionada.</p>`;
        return;
      }

      panelResultados.innerHTML = `
        <strong>🔎 ${resultados.length} documentos encontrados (haz clic para abrir):</strong>
        <ul class="docs-filter-grid">
          ${resultados
            .map(
              (r) => `
            <li>
              <button type="button" class="docs-filter-item-btn" data-open-doc="${r.idDoc}">
                <span>📄 <strong>${r.titulo}</strong></span>
                <small>${r.esLocal ? '🗄️ DB Local + FS' : r.categoriaOriginal}</small>
              </button>
            </li>
          `
            )
            .join('')}
        </ul>
      `;
    };

    if (inputSearch) inputSearch.addEventListener('input', actualizarFiltro);
    if (selectCat) selectCat.addEventListener('change', actualizarFiltro);

    if (panelResultados) {
      panelResultados.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-open-doc]');
        if (!btn) return;
        const destino = btn.getAttribute('data-open-doc');
        if (destino) {
          estadoDocActivo.set(destino);
          panelResultados.hidden = true;
        }
      });
    }

    if (btnCancel && modal) {
      btnCancel.addEventListener('click', () => modal.cerrar());
    }

    if (form && modal) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const idInput = this.querySelector('#admin-doc-id');
        const titleInput = this.querySelector('#admin-doc-title');
        const catSelect = this.querySelector('#admin-doc-category');
        const contentArea = this.querySelector('#admin-doc-content');

        const guardado = guardarDocEnDbLocal(idInput.value, {
          titulo: titleInput.value,
          categoria: catSelect.value,
          contenido: contentArea.value
        });

        modal.cerrar();
        if (guardado) {
          estadoDocActivo.set(guardado.idDoc);
        }
      });
    }
  }

  abrirModalEditor(idDoc, esNuevo = false) {
    const modal = this.querySelector('#modal-admin-doc');
    const idInput = this.querySelector('#admin-doc-id');
    const titleInput = this.querySelector('#admin-doc-title');
    const catSelect = this.querySelector('#admin-doc-category');
    const contentArea = this.querySelector('#admin-doc-content');
    if (!modal || !idInput || !titleInput || !catSelect || !contentArea) return;

    if (esNuevo) {
      idInput.value = idDoc || 'nuevo_documento_local';
      titleInput.value = 'Nueva Guía Local MitaDOM';
      catSelect.value = 'local';
      contentArea.value = `# Nueva Guía Local MitaDOM\n\nDocumento administrado desde la DB Local + File System (\`src/assets/mita-docs-db.json\`).\n\n\`\`\`javascript\nimport { crearEstadoReactivoInmutable } from 'mita-dom';\nconst estado = crearEstadoReactivoInmutable('doc:demo', { listo: true });\n\`\`\``;
    } else {
      const locales = estadoDocsLocales.get() || {};
      const existente = locales[idDoc] || this._docsMap?.[idDoc];
      const contenido = existente?.contenido || `# ${idDoc}\n`;
      idInput.value = idDoc;
      titleInput.value = extraerPrimerTitulo(contenido, idDoc);
      catSelect.value = existente?.categoria || 'local';
      contentArea.value = contenido;
    }

    modal.abrir();
  }

  iniciarLogicaUX() {
    this.$btnCopyIA = this.querySelector('#btn-copy-ia');
    this.$btnPrintPDF = this.querySelector('#btn-print-pdf');

    if (this.$btnCopyIA) {
      this.$btnCopyIA.addEventListener('click', () => {
        const texto = this.$container.innerText;
        navigator.clipboard
          .writeText(texto)
          .then(() => {
            const originalText = this.$btnCopyIA.innerHTML;
            this.$btnCopyIA.innerHTML = '✅ ¡Copiado para IA!';
            setTimeout(() => {
              this.$btnCopyIA.innerHTML = originalText;
            }, 2000);
          })
          .catch((err) => console.error('Error al copiar:', err));
      });
    }

    if (this.$btnPrintPDF) {
      this.$btnPrintPDF.addEventListener('click', () => {
        this.exportarPDFLibro();
      });
    }
  }

  exportarPDFLibro() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor permite los popups en tu navegador para exportar el PDF.');
      return;
    }

    let htmlConsolidado = `
      <html>
        <head>
          <title>Libro Completo - MitaDOM SPA</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; padding: 2rem; max-width: 900px; margin: 0 auto; }
            h1, h2, h3 { color: #111; border-bottom: 1px solid #ccc; padding-bottom: 0.5rem; page-break-after: avoid; }
            pre { background: #f4f4f4; padding: 1rem; border-radius: 6px; overflow-x: auto; font-size: 0.9em; page-break-inside: avoid; }
            code { font-family: monospace; background: #eee; padding: 0.1rem 0.3rem; border-radius: 3px; }
            .page-break { page-break-after: always; }
          </style>
        </head>
        <body>
    `;

    const docs = this.obtenerCatalogoUnificado();
    docs.forEach((doc) => {
      if (doc.categoria === 'changelogs') return;
      htmlConsolidado += `<section class="doc-section page-break">${marked.parse(doc.contenido)}</section>`;
    });

    htmlConsolidado += `</body></html>`;
    printWindow.document.open();
    printWindow.document.write(htmlConsolidado);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  }

  renderErrorUI(error, titulo) {
    const stackTrace = error.stack || error.message || 'Error desconocido.';
    this.$container.innerHTML = `
      <section class="docs-error-container" style="background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; padding: 1.5rem; border-radius: 8px;">
        <h2 style="color: #ef4444; margin-top: 0;">⚠️ ${titulo}</h2>
        <button id="btn-copy-error" class="btn-primario">📋 Copiar Stacktrace</button>
        <pre><code>${stackTrace}</code></pre>
      </section>
    `;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.ambitoMemoria.liberarMemoriaCompleta();
    restaurarBackupEnDbLocal({});
  }
}

if (!customElements.get('mita-docs')) {
  customElements.define('mita-docs', MitaDocs);
}
