// @ts-check
import { MitaElement } from '../../utils/MitaElement.js';
import { rutaActual } from 'mita-dom';
import { estadoDocActivo } from '../../store/docsStore.js';

import htmlTemplate from './mita-docs-nav.html?raw';
import './mita-docs-nav.css';

export class MitaDocsNav extends MitaElement {
  constructor() {
    super();
  }

  async render() {
    this.innerHTML = htmlTemplate;
    this.iniciarLogica();
  }

  iniciarLogica() {
    const enlacesNav = Array.from(this.querySelectorAll('#docs-nav a.btn-doc'));

    // 1. Mostrar/Ocultar dependiendo de la ruta global (Renderizado Condicional Mágico)
    rutaActual.suscribir(ruta => {
      // Nos mostramos si la ruta empieza con /docs
      this.style.display = (ruta.startsWith('/docs')) ? 'block' : 'none';
    });

    // 2. Suscribirse al Estado Global para reflejar el enlace Activo
    estadoDocActivo.suscribir((idDoc) => {
      enlacesNav.forEach($enlace => {
        // @ts-ignore
        const href = $enlace.getAttribute('href');
        if (href === `/docs/${idDoc}`) {
          $enlace.classList.add('activo');
        } else {
          $enlace.classList.remove('activo');
        }
      });
    });
  }
}

if (!customElements.get('mita-docs-nav')) {
  customElements.define('mita-docs-nav', MitaDocsNav);
}
