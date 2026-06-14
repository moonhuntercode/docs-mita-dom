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

      const contenidoRaw = DOCS_MAP[idDoc];
      
      if (!contenidoRaw) {
        const errorDetails = new Error(`El documento con ID "${idDoc}" no existe en el registro DOCS_MAP. Asegúrate de que el archivo .md esté presente y no haya sido filtrado.`);
        errorDetails.name = 'DocumentNotFoundError';
        this.renderErrorUI(errorDetails, '📄 Documento no encontrado');
        return;
      }

      try {
        let html = marked.parse(contenidoRaw);
        // Reemplazar bloques de código generados por Marked.js por nuestro <mita-code-editor>
        html = html.replace(/<pre><code class="language-([^"]+)">([\s\S]*?)<\/code><\/pre>/g, (match, lang, code) => {
          return `<mita-code-editor lenguaje="${lang}" archivo="ejemplo.${lang}"><pre><code class="language-${lang}">${code}</code></pre></mita-code-editor>`;
        });

        this.$container.innerHTML = html;
      } catch (err) {
        console.error(err);
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
            btnCopy.style.background = 'rgba(0,0,0,0.5)';
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
