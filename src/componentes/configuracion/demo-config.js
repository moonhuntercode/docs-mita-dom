import { MitaElement } from '../../utils/MitaElement.js';
import htmlTemplate from './demo-config.html?raw';
import './demo-config.css';
import { estadoConfiguracion } from '../../store/configStore.js';

export class DemoConfig extends MitaElement {
  constructor() {
    super();
  }

  async render() {
    this.innerHTML = htmlTemplate;
  }

  iniciarLogica() {
    const $radios = this.querySelectorAll('input[name="menu-pos"]');
    const $btnGuardar = this.querySelector('#btn-guardar-config');

    // Sincronizar UI Inicial con el Estado
    const estadoActual = estadoConfiguracion.get();
    const radioCheck = this.querySelector(`#pos-${estadoActual.posicionMenu}`);
    if (radioCheck) radioCheck.checked = true;

    // Escuchar cambios en los Radios
    $radios.forEach($radio => {
      $radio.addEventListener('change', (e) => {
        estadoConfiguracion.patch({ posicionMenu: e.target.value });
      });
    });

    $btnGuardar.addEventListener('click', () => {
      alert("¡Configuración guardada en IndexedDB/LocalStorage con MitaDOM!");
    });
  }
}

if (!customElements.get('demo-config')) {
  customElements.define('demo-config', DemoConfig);
}
