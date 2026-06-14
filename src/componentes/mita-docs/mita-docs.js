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
    const changelogFiles = import.meta.glob('@mita-docs/changelogs/*.md', { query: '?raw', import: 'default' });

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
          this.$container.innerHTML = '<h3>Error al cargar los changelogs.</h3>';
        }
        return;
      }

      // Parsear MD a HTML
      const rawMarkdown = DOCS_MAP[idDoc] || '# Documento no encontrado';
      
      let html = marked.parse(rawMarkdown);
      // Reemplazar bloques de código generados por Marked.js por nuestro <mita-code-editor>
      html = html.replace(/<pre><code class="language-([^"]+)">([\s\S]*?)<\/code><\/pre>/g, (match, lang, code) => {
        return `<mita-code-editor lenguaje="${lang}" archivo="ejemplo.${lang}"><pre><code class="language-${lang}">${code}</code></pre></mita-code-editor>`;
      });

      this.$container.innerHTML = html;
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
}

if (!customElements.get('mita-docs')) {
  customElements.define('mita-docs', MitaDocs);
}
