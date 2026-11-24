// @ts-check
import { MitaElement } from '../../utils/MitaElement.js';
import { conectarFiltroAcordeones } from '../../utils/navFilter.js';
import { rutaActual } from 'mita-dom';
import { estadoDocActivo } from '../../store/docsStore.js';

import htmlTemplate from './mita-docs-nav.html?raw';
import './mita-docs-nav.css';

export class MitaDocsNav extends MitaElement {
  async render() {
    this.innerHTML = htmlTemplate;
    this.iniciarLogica();
  }

  iniciarLogica() {
    const enlacesNav = Array.from(this.querySelectorAll('#docs-nav a.btn-doc'));
    const acordeones = /** @type {HTMLElement[]} */ (Array.from(this.querySelectorAll('details.docs-accordion')));
    const inputBuscar = /** @type {HTMLInputElement | null} */ (this.querySelector('#docs-nav-search'));
    const avisoVacio = /** @type {HTMLElement | null} */ (this.querySelector('#docs-nav-empty'));

    this.escucharEstado(rutaActual, (ruta) => {
      this.style.display = ruta.startsWith('/docs') ? 'block' : 'none';
    });

    this.escucharEstado(estadoDocActivo, (idDoc) => {
      enlacesNav.forEach(($enlace) => {
        const href = $enlace.getAttribute('href');
        const esActivo = href === `/docs/${idDoc}`;
        if (esActivo) {
          $enlace.classList.add('activo');
          $enlace.setAttribute('aria-current', 'page');
          const acordeonPadre = $enlace.closest('details.docs-accordion');
          if (acordeonPadre) acordeonPadre.setAttribute('open', '');
        } else {
          $enlace.classList.remove('activo');
          $enlace.removeAttribute('aria-current');
        }
      });
    });

    const detenerFiltro = conectarFiltroAcordeones({
      inputBuscador: inputBuscar,
      acordeones,
      avisoVacio,
      extraerTexto: (li) => {
        const link = li.querySelector('a.btn-doc');
        return `${link?.textContent || ''} ${link?.getAttribute('href') || ''}`;
      }
    });
    this.registrarLimpieza(detenerFiltro);
  }
}

if (!customElements.get('mita-docs-nav')) {
  customElements.define('mita-docs-nav', MitaDocsNav);
}
