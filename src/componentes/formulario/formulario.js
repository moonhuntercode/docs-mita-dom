// @ts-check
import { estadoAppGlobal } from '../../store/appStore.js';
import { Logger } from '../../utils/logger.js';
import { MitaElement } from '../../utils/MitaElement.js';
import html from './formulario.html?raw';
import './formulario.css'; // Vite lo inyectará en el <head> para HMR perfecto

/**
 * Componente `<mita-formulario>`
 * Demuestra cómo capturar datos del usuario y enviarlos a un Signal global.
 */
export class MitaFormulario extends MitaElement {
  constructor() {
    super();
  }

  /**
   * 🧬 CICLO DE VIDA: render (Reemplaza connectedCallback gracias a MitaElement)
   */
  async render() {
    Logger.info('Montando <demo-formulario>...');
      // Inyectamos solo el HTML. El CSS es manejado globalmente por Vite (inyectado en el <head>)
      this.innerHTML = html;
      
      // Activamos interactividad
      this.iniciarLogica();
  }

  /**
   * 🧬 CICLO DE VIDA: disconnectedCallback
   */
  disconnectedCallback() {
    Logger.warn('Desmontando <demo-formulario>...');
    // Aquí removeríamos listeners si hubiéramos usado .addEventListener global
  }

  iniciarLogica() {
    const form = this.querySelector('#form-datos');
    const input = /** @type {HTMLInputElement} */ (this.querySelector('#input-nombre'));
    const feedback = this.querySelector('#feedback');

    if (!form || !input || !feedback) return;

    form.addEventListener('submit', (e) => {
      // Prevenir recarga completa de SPA
      e.preventDefault();

      const nuevoNombre = input.value.trim();

      if (!nuevoNombre) {
        feedback.textContent = '⚠️ Por favor, ingresa un nombre válido.';
        feedback.className = '';
        feedback.style.color = '#ffab00'; // Color de advertencia
        return;
      }

      // Limpiar advertencias si las había
      feedback.style.color = '';

      // 🔄 MUTACIÓN GLOBAL (DX MEJORADA CON .patch()):
      // Actualizamos solo la propiedad 'usuario' usando el nuevo método patch.
      // Cualquier componente en cualquier parte de la app reaccionará al instante.
      estadoAppGlobal.patch({ usuario: nuevoNombre });

      // Damos Feedback Visual y Accesible (ARIA)
      feedback.textContent = '¡Nombre actualizado exitosamente!';
      feedback.className = 'exito';

      // Damos Feedback por consola (DX)
      console.info(`✅ [Formulario] Signal Mutado -> Nombre: ${nuevoNombre}`);

      input.value = ''; // Limpiamos

      // Ocultar feedback después de 3 segundos
      setTimeout(() => {
        feedback.textContent = '';
      }, 3000);
    });
  }
}


// Protegemos el define para evitar crasheos durante el HMR de Vite
if (!customElements.get('demo-formulario')) {
  customElements.define('demo-formulario', MitaFormulario);
}
