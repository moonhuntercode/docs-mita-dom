import { MitaElement } from '../../utils/MitaElement.js';
import { marked } from 'marked';
import { estadoDocActivo } from '../../store/docsStore.js';

import htmlTemplate from './mita-docs.html?raw';
import './mita-docs.css';

// Importamos los archivos MD como strings gracias a Vite (?raw) y el alias
import mdReadme from '@mita-docs/README.md?raw';
import mdComponentes from '@mita-docs/GUIA_COMPONENTES.md?raw';
import mdEjemplos from '@mita-docs/EJEMPLOS_PRACTICOS.md?raw';
import mdTesting from '@mita-docs/GUIA_TESTING.md?raw';
import mdTeleport from '@mita-docs/TELEPORT.md?raw';
import mdFilosofia from '@mita-docs/FILOSOFIA.md?raw';
import mdFundamentos from '@mita-docs/FUNDAMENTOS.md?raw';
import mdArquitectura from '@mita-docs/ARQUITECTURA.md?raw';
import mdWebComponentsNativos from '@mita-docs/WEB_COMPONENTS_NATIVOS.md?raw';
import mdConditionalRendering from '@mita-docs/CONDITIONAL_RENDERING.md?raw';
import mdDatosYApis from '@mita-docs/DATOS_Y_APIS.md?raw';
import mdEcosistemaVite from '@mita-docs/ECOSISTEMA_VITE.md?raw';
import mdEnrutamientoSpa from '@mita-docs/ENRUTAMIENTO_SPA.md?raw';
import mdFundamentosWeb from '@mita-docs/FUNDAMENTOS_WEB.md?raw';

const DOCS_MAP = {
  readme: mdReadme,
  componentes: mdComponentes,
  ejemplos: mdEjemplos,
  testing: mdTesting,
  teleport: mdTeleport,
  filosofia: mdFilosofia,
  fundamentos: mdFundamentos,
  arquitectura: mdArquitectura,
  web_components_nativos: mdWebComponentsNativos,
  conditional_rendering: mdConditionalRendering,
  datos_y_apis: mdDatosYApis,
  ecosistema_vite: mdEcosistemaVite,
  enrutamiento_spa: mdEnrutamientoSpa,
  fundamentos_web: mdFundamentosWeb
};

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

    // Suscribirse al Estado Global para Renderizar Markdown Quirúrgicamente
    estadoDocActivo.suscribir((idDoc) => {
      // Parsear MD a HTML
      const rawMarkdown = DOCS_MAP[idDoc] || '# Documento no encontrado';
      
      // Sanitizar el Markdown es ideal en prod, pero aquí confiamos en nuestros docs locales.
      // Insertamos el HTML renderizado de forma ultra rápida
      this.$container.innerHTML = marked.parse(rawMarkdown);
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
