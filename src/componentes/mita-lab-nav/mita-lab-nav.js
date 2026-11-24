// @ts-check
import { MitaElement } from '../../utils/MitaElement.js';
import { conectarFiltroAcordeones } from '../../utils/navFilter.js';
import { rutaActual } from 'mita-dom';
import { estadoLeccionActiva } from '../../store/labStore.js';
import htmlTemplate from './mita-lab-nav.html?raw';
import './mita-lab-nav.css';

/**
 * 🧪 <mita-lab-nav>
 * Portal lateral dentro del <aside id="sidebar"> con buscador y acordeones (<details>)
 * para navegar las 6 lecciones interactivas de /laboratorio.
 */
export class MitaLabNav extends MitaElement {
  async render() {
    this.innerHTML = htmlTemplate;
    this.iniciarLogica();
  }

  iniciarLogica() {
    const botones = Array.from(this.querySelectorAll('button.lab-nav-btn'));
    const acordeones = /** @type {HTMLElement[]} */ (Array.from(this.querySelectorAll('details.lab-accordion')));
    const inputBuscar = /** @type {HTMLInputElement | null} */ (this.querySelector('#lab-nav-search'));
    const avisoVacio = /** @type {HTMLElement | null} */ (this.querySelector('#lab-nav-empty'));

    this.escucharEstado(rutaActual, (ruta) => {
      this.style.display = ruta.startsWith('/laboratorio') ? 'block' : 'none';
    });

    this.escucharEstado(estadoLeccionActiva, (leccion) => {
      botones.forEach((btn) => {
        const esActiva = btn.getAttribute('data-leccion') === leccion;
        if (esActiva) {
          btn.setAttribute('aria-current', 'page');
          const acordeonPadre = btn.closest('details.lab-accordion');
          if (acordeonPadre) acordeonPadre.setAttribute('open', '');
        } else {
          btn.removeAttribute('aria-current');
        }
      });
    });

    const onClick = (event) => {
      const target = /** @type {HTMLElement} */ (event.target);
      const btn = target.closest('button.lab-nav-btn');
      if (!btn) return;
      const clave = btn.getAttribute('data-leccion');
      if (clave) estadoLeccionActiva.set(clave);
    };

    this.addEventListener('click', onClick);
    this.registrarLimpieza(() => this.removeEventListener('click', onClick));

    const detenerFiltro = conectarFiltroAcordeones({
      inputBuscador: inputBuscar,
      acordeones,
      avisoVacio,
      extraerTexto: (li) => {
        const btn = li.querySelector('button.lab-nav-btn');
        return `${btn?.textContent || ''} ${btn?.getAttribute('data-keywords') || ''}`;
      }
    });
    this.registrarLimpieza(detenerFiltro);
  }
}

if (!customElements.get('mita-lab-nav')) {
  customElements.define('mita-lab-nav', MitaLabNav);
}
