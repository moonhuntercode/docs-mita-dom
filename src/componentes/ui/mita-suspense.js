// @ts-check
import { MitaElement } from '../../utils/MitaElement.js';

/**
 * ⏳ <mita-suspense>
 * Inspirado en React Suspense. Permite mostrar un "fallback" (estado de carga)
 * mientras una promesa o tarea asíncrona se resuelve, o un "error" si falla.
 */
export class MitaSuspense extends MitaElement {
  constructor() {
    super();
    this.estado = 'cargando'; // 'cargando', 'exito', 'error'
    this.errorMsg = '';
  }

  async render() {
    this.style.display = 'block';
    this.actualizarUI();
  }

  /**
   * Las clases o componentes padres pueden invocar este método pasándole una Promesa
   * para que Suspense la resuelva y gestione la UI automáticamente.
   */
  async resolver(promesa) {
    this.estado = 'cargando';
    this.actualizarUI();
    try {
      const resultado = await promesa;
      this.estado = 'exito';
      this.actualizarUI();
      return resultado;
    } catch (error) {
      this.estado = 'error';
      this.errorMsg = error.message || 'Error desconocido';
      this.actualizarUI();
      throw error;
    }
  }

  actualizarUI() {
    // 1. Obtener todos los slots/templates
    const slotFallback = this.querySelector('template[slot="fallback"]');
    const slotError = this.querySelector('template[slot="error"]');
    
    // Todo lo que no sea un template, lo consideramos el "contenido principal"
    const nodosPrincipales = Array.from(this.children).filter(child => child.tagName !== 'TEMPLATE' && !child.hasAttribute('data-suspense-ui'));

    // 2. Limpiar UI inyectada previamente
    this.querySelectorAll('[data-suspense-ui]').forEach(el => el.remove());

    if (this.estado === 'cargando') {
      nodosPrincipales.forEach(n => n.style.display = 'none');
      if (slotFallback) {
        const clone = slotFallback.content.cloneNode(true);
        // @ts-ignore
        clone.childNodes.forEach(child => {
            if (child.nodeType === 1) { // Element Node
                // @ts-ignore
                child.setAttribute('data-suspense-ui', 'true');
            }
        });
        this.appendChild(clone);
      }
    } else if (this.estado === 'error') {
      nodosPrincipales.forEach(n => n.style.display = 'none');
      if (slotError) {
        const clone = slotError.content.cloneNode(true);
        // @ts-ignore
        clone.childNodes.forEach(child => {
            if (child.nodeType === 1) {
                // @ts-ignore
                child.setAttribute('data-suspense-ui', 'true');
                // Reemplazar mensaje de error si el slot contiene la marca
                // @ts-ignore
                child.innerHTML = child.innerHTML.replace('{{error}}', this.errorMsg);
            }
        });
        this.appendChild(clone);
      } else {
          // Fallback de error por defecto
          const errorDiv = document.createElement('div');
          errorDiv.setAttribute('data-suspense-ui', 'true');
          errorDiv.style.color = 'red';
          errorDiv.textContent = '❌ Error: ' + this.errorMsg;
          this.appendChild(errorDiv);
      }
    } else if (this.estado === 'exito') {
      // @ts-ignore
      nodosPrincipales.forEach(n => n.style.display = ''); // Restaurar display original
    }
  }
}

if (!customElements.get('mita-suspense')) {
  customElements.define('mita-suspense', MitaSuspense);
}
