import { MitaElement } from '../../utils/MitaElement.js';
import { marked } from 'marked';
import { estadoDocActivo } from '../../store/docsStore.js';

import htmlTemplate from './mita-docs.html?raw';
import './mita-docs.css';

import { DOCS_MAP } from './docsRegistry.js';

export class MitaDocs extends MitaElement {
  constructor() {
    super();
  }

  async render() {
    this.innerHTML = htmlTemplate;
    this.iniciarLogica();
    this.iniciarLogicaUX();
  }

  iniciarLogica() {
    this.$container = this.querySelector('#markdown-container');

    // Cargar Changelogs dinámicamente usando Vite Glob Imports
    const changelogFiles = import.meta.glob('../../assets/mita-docs-cache/changelogs/*.md', { query: '?raw', import: 'default' });

    // Suscribirse al Estado Global para Renderizar Markdown Quirúrgicamente
    estadoDocActivo.suscribir(async (idDoc) => {
      if (idDoc === 'changelog') {
        this.$container.innerHTML = '<h3>Cargando Registro de Cambios...</h3>';
        try {
          let fullChangelog = '# 🔄 Registro de Cambios (Changelog)\n\nHistorial completo de versiones de MitaDOM extraído automáticamente.\n\n';

          // Ordenamos los archivos por nombre (fecha) de forma descendente (más nuevo primero)
          const paths = Object.keys(changelogFiles).sort().reverse();

          for (const path of paths) {
            const getMarkdown = changelogFiles[path];
            // @ts-ignore
            const mdContent = await getMarkdown();
            fullChangelog += mdContent + '\n\n---\n\n';
          }

          this.$container.innerHTML = marked.parse(fullChangelog);
        } catch (err) {
          console.error(err);
          this.renderErrorUI(err, 'Error al cargar los changelogs.');
        }
        return;
      }

      const contenidoRaw = DOCS_MAP[idDoc]?.contenido;

      if (!contenidoRaw) {
        console.error(`[MitaDocs] ❌ Error 404: El archivo Markdown '${idDoc}.md' no existe o no pudo ser renderizado.`);
        this.$container.innerHTML = `
          <div style="text-align: center; padding: 3rem 1rem;">
            <h1 style="font-size: 4rem; margin: 0; color: var(--color-primario);">404</h1>
            <h2 style="margin-top: 0.5rem; margin-bottom: 2rem;">Documento no encontrado</h2>
            <p style="opacity: 0.8; margin-bottom: 2rem;">
              El documento <strong>"${idDoc}.md"</strong> no existe o no ha sido sincronizado en el registro de documentación.
            </p>
            <button onclick="window.navigation.navigate('/')" class="btn-primario" style="padding: 0.8rem 1.5rem; font-size: 1.1rem; cursor: pointer;">
              🏠 Volver al Inicio
            </button>
            <button onclick="window.navigation.navigate('/docs/readme')" class="btn-doc" style="margin-left: 1rem; padding: 0.8rem 1.5rem; font-size: 1.1rem; cursor: pointer; background: transparent; border: 1px solid var(--color-borde); color: var(--color-texto);">
              📚 Ver Índice
            </button>
          </div>
        `;
        return;
      }

      try {
        let html = marked.parse(contenidoRaw);
        // Reemplazar bloques de código generados por Marked.js por nuestro <mita-code-editor>
        html = html.replace(/<pre><code class="language-([^"]+)">([\s\S]*?)<\/code><\/pre>/g, (match, lang, code) => {
          return `<mita-code-editor lenguaje="${lang}" archivo="ejemplo.${lang}"><pre><code class="language-${lang}">${code}</code></pre></mita-code-editor>`;
        });

        this.$container.innerHTML = html;
        console.log(`%c[MitaDocs] ✅ Documento Markdown '${idDoc}.md' renderizado con éxito.`, 'color: #3b82f6; font-weight: bold;');
      } catch (err) {
        console.error(`[MitaDocs] ❌ Error Crítico de Renderizado (Markdown Parser) en '${idDoc}.md'`, err);
        this.renderErrorUI(err, `Error al parsear el documento "${idDoc}"`);
      }
    });

    // Event Delegation: Interceptar clics en enlaces nativos de Markdown
    this.$container.addEventListener('click', (e) => {
      // @ts-ignore
      const $enlace = e.target.closest('a');
      if (!$enlace) return;

      const href = $enlace.getAttribute('href');

      // Si es un enlace interno a otro Markdown (ej. "./FILOSOFIA.md" o "../FUNDAMENTOS.md")
      if (href && href.toLowerCase().endsWith('.md')) {
        e.preventDefault(); // Detenemos la navegación por defecto (que daría 404)

        // Extraemos solo el nombre base sin extensión y lo pasamos a minúsculas
        // Ej: "./FILOSOFIA.md" -> "filosofia"
        const partes = href.split('/');
        const archivo = partes[partes.length - 1];
        const idDoc = archivo.replace(/\.md$/i, '').toLowerCase();

        // Si el documento existe en nuestro DOCS_MAP, navegamos usando Navigation API nativa
        if (DOCS_MAP[idDoc]) {
          // @ts-ignore
          if (window.navigation) {
            // @ts-ignore
            window.navigation.navigate(`/docs/${idDoc}`);
          } else {
            // Fallback
            estadoDocActivo.set(idDoc);
          }
        } else {
          console.warn(`Enlace a documento no encontrado: ${idDoc}`);
        }
      }
    });
  }

  iniciarLogicaUX() {
    this.$btnCopyIA = this.querySelector('#btn-copy-ia');
    this.$btnPrintPDF = this.querySelector('#btn-print-pdf');

    if (this.$btnCopyIA) {
      this.$btnCopyIA.addEventListener('click', () => {
        // Obtenemos el texto limpio de todo el contenedor de markdown actual
        const texto = this.$container.innerText;
        navigator.clipboard.writeText(texto).then(() => {
          const originalText = this.$btnCopyIA.innerHTML;
          this.$btnCopyIA.innerHTML = '✅ ¡Copiado para IA!';
          setTimeout(() => { this.$btnCopyIA.innerHTML = originalText; }, 2000);
        }).catch(err => console.error('Error al copiar:', err));
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
            img { max-width: 100%; height: auto; }
            blockquote { border-left: 4px solid #007bff; margin-left: 0; padding-left: 1rem; color: #555; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 1rem; page-break-inside: avoid; }
            th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; }
            th { background: #f8f9fa; }
            .page-break { page-break-after: always; }
            @media print {
              body { font-size: 11pt; max-width: 100%; padding: 0; margin: 0; }
              a { text-decoration: none; color: #000; }
            }
          </style>
        </head>
        <body>
          <div style="text-align: center; padding: 4rem 0;" class="page-break">
            <h1 style="font-size: 3rem; border: none;">Libro de Documentación: MitaDOM</h1>
            <p style="font-size: 1.2rem; color: #666;">Generado automáticamente (Production Ready)</p>
          </div>
    `;

    const docs = Object.values(DOCS_MAP).sort((a, b) => a.categoria.localeCompare(b.categoria) || a.idDoc.localeCompare(b.idDoc));
    
    docs.forEach(doc => {
      // Ignorar changelogs para no engordar el PDF
      if (doc.categoria === 'changelogs') return;

      const parsedHtml = marked.parse(doc.contenido);
      htmlConsolidado += `
        <div class="doc-section page-break">
          <div style="font-size: 0.8rem; color: #666; text-transform: uppercase; margin-bottom: 1rem; border-bottom: 1px dashed #ccc; padding-bottom: 0.5rem;">Categoría: ${doc.categoria} | ID: ${doc.idDoc}</div>
          ${parsedHtml}
        </div>
      `;
    });

    htmlConsolidado += `
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlConsolidado);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  }

  /**
   * Renderiza una interfaz de error robusta con Stack Trace y botón de copiar
   */
  renderErrorUI(error, titulo) {
    const stackTrace = error.stack || error.message || 'Error desconocido sin stacktrace.';

    this.$container.innerHTML = `
      <div class="docs-error-container" style="background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
        <h2 style="color: #ef4444; margin-top: 0; display: flex; align-items: center; gap: 0.5rem;">
          ⚠️ ${titulo}
        </h2>
        <p style="color: var(--color-texto); opacity: 0.9; margin-bottom: 1rem;">
          Se ha producido un error técnico. Si eres desarrollador, revisa los detalles a continuación:
        </p>
        <div style="position: relative;">
          <button id="btn-copy-error" class="btn-primario" style="position: absolute; top: 0.5rem; right: 0.5rem; padding: 0.3rem 0.6rem; font-size: 0.8rem; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2);">
            📋 Copiar Stacktrace
          </button>
          <pre style="background: #111827; padding: 1rem; border-radius: 6px; overflow-x: auto; color: #f87171; font-family: monospace; font-size: 0.85rem; margin: 0; white-space: pre-wrap;"><code>${stackTrace}</code></pre>
        </div>
      </div>
    `;

    // Lógica para copiar al portapapeles
    const btnCopy = this.$container.querySelector('#btn-copy-error');
    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        navigator.clipboard.writeText(stackTrace).then(() => {
          btnCopy.innerHTML = '✅ ¡Copiado!';
          btnCopy.style.background = '#10b981';
          setTimeout(() => {
            btnCopy.innerHTML = '📋 Copiar Stacktrace';
            btnCopy.style.background = 'rgba(0,0,0,0.1)';
          }, 2000);
        }).catch(err => {
          console.error('Error al copiar:', err);
          btnCopy.innerHTML = '❌ Error';
        });
      });
    }
  }
}

if (!customElements.get('mita-docs')) {
  customElements.define('mita-docs', MitaDocs);
}
