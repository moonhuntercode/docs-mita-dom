import { MitaElement } from '../../utils/MitaElement.js';
import { crearGestorTemaYAnimacionNavegacion } from 'mita-dom';
import htmlTemplate from './demo-config.html?raw';
import './demo-config.css';
import { estadoConfiguracion } from '../../store/configStore.js';

export const gestorTemaGlobal = crearGestorTemaYAnimacionNavegacion({
  nombreEstado: 'ui:tema_y_animacion_global'
});

export class DemoConfig extends MitaElement {
  async render() {
    this.innerHTML = htmlTemplate;
    this.iniciarLogica();
  }

  iniciarLogica() {
    const $radios = this.querySelectorAll('input[name="menu-pos"]');
    const $btnGuardar = this.querySelector('#btn-guardar-config');
    const $palettesList = this.querySelector('#config-palettes-list');
    const $paletteStatus = this.querySelector('#config-palette-status');
    const $animSelect = this.querySelector('#config-nav-anim-select');

    const estadoActual = estadoConfiguracion.get();
    const radioCheck = this.querySelector(`#pos-${estadoActual.posicionMenu}`);
    if (radioCheck) radioCheck.checked = true;

    $radios.forEach(($radio) => {
      $radio.addEventListener('change', (e) => {
        estadoConfiguracion.patch({ posicionMenu: e.target.value });
      });
    });

    if ($palettesList) {
      $palettesList.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-palette-id]');
        if (!btn) return;
        const paleta = gestorTemaGlobal.cambiarPaletaDeColores(btn.getAttribute('data-palette-id'));
        if ($paletteStatus) {
          $paletteStatus.textContent = `🎨 Paleta aplicada: ${paleta.nombre} (Primario: ${paleta.primario}, Acento: ${paleta.acento})`;
        }
      });
    }

    if ($animSelect) {
      $animSelect.value = gestorTemaGlobal.estado.get().animacionNavegacion;
      $animSelect.addEventListener('change', (e) => {
        gestorTemaGlobal.cambiarAnimacionDeNavegacion(e.target.value);
        if ($paletteStatus) {
          $paletteStatus.textContent = `🧭 Animación de navegación actualizada a: ${e.target.value}`;
        }
      });
    }

    if ($btnGuardar) {
      $btnGuardar.addEventListener('click', () => {
        if ($paletteStatus) {
          $paletteStatus.textContent = '✅ Preferencias de paleta, animación y menú guardadas en DB Local.';
        }
      });
    }
  }
}

if (!customElements.get('demo-config')) {
  customElements.define('demo-config', DemoConfig);
}
