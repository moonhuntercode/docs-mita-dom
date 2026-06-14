import { MitaElement } from '../../../utils/MitaElement.js';
import htmlTemplate from './mita-header.html?raw';
import './mita-header.css';

// Tiendas globales de estado
import { estadoTemaGlobal } from '../../../store/temaStore.js';
import { estadoSidebar } from '../../../store/layoutStore.js';

export class MitaHeader extends MitaElement {
  constructor() {
    super();
    // No usamos attachShadow aquí para que herede los estilos globales (botones, utilidades)
    // Sin embargo, si quisiéramos encapsulamiento total, usaríamos shadow DOM.
    // Para simplificar la refactorización (que usa clases globales como btn-primario), usaremos Light DOM.
  }

  async render() {
    this.innerHTML = htmlTemplate;
    this.iniciarLogica();
  }

  iniciarLogica() {
    // 1. Lógica del Modo Oscuro/Claro
    const $btnTema = this.querySelector('#btn-tema');
    if ($btnTema) {
      $btnTema.addEventListener('click', () => {
        const nuevoTema = estadoTemaGlobal.value === 'oscuro' ? 'claro' : 'oscuro';
        estadoTemaGlobal.set(nuevoTema);
      });

      // Suscribirse a cambios del estado global para actualizar UI
      estadoTemaGlobal.suscribir(tema => {
        if (tema === 'claro') {
          document.body.classList.add('tema-claro');
          $btnTema.textContent = '🌙 Modo Oscuro';
        } else {
          document.body.classList.remove('tema-claro');
          $btnTema.textContent = '☀️ Modo Claro';
        }
      });
    }

    // 2. (La lógica del Buscador Global fue movida a mita-search.js)

    // 3. Lógica del Menú Móvil (Sidebar)
    const $btnMenu = this.querySelector('#btn-menu-mobile');
    if ($btnMenu) {
      $btnMenu.addEventListener('click', () => {
        const estadoActual = estadoSidebar.get();
        estadoSidebar.patch({ abierto: !estadoActual.abierto });
      });
    }
  }
}

if (!customElements.get('mita-header')) {
  customElements.define('mita-header', MitaHeader);
}
