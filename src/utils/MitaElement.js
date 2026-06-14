// @ts-check
import { Logger } from './logger.js';
import { registrarMetrica } from '../store/profilerStore.js';

/**
 * 🛡️ MitaElement (Patrón Error Boundary Local)
 * Al extender de esta clase en lugar de HTMLElement directo,
 * protegemos el ciclo de vida de los componentes con un try/catch nativo.
 */
export class MitaElement extends HTMLElement {
  /**
   * Método que las clases hijas deben implementar
   * en lugar de connectedCallback directo.
   */
  async render() {}

  /**
   * Se ejecuta si ocurre un error en el render.
   * Las clases hijas pueden sobreescribirlo para proveer una UI personalizada.
   */
  fallbackUI(error) {
    this.innerHTML = `
      <div style="padding: 1rem; border: 2px dashed #ff5252; background: rgba(255,82,82,0.1); border-radius: 8px;">
        <h4 style="color: #ff5252; margin:0 0 0.5rem 0;">⚠️ Fallo en componente &lt;${this.tagName.toLowerCase()}&gt;</h4>
        <p style="margin:0; font-size: 0.9em; color: #ccc;">${error.message}</p>
      </div>
    `;
  }

  async connectedCallback() {
    try {
      // 🚀 INICIO DEL PROFILER
      const t0 = performance.now();
      
      await this.render();
      
      // 🛑 FIN DEL PROFILER
      const t1 = performance.now();
      const duracion = t1 - t0;
      
      // Registrar la métrica globalmente
      registrarMetrica(this.tagName.toLowerCase(), duracion);

    } catch (error) {
      Logger.error(`Error en componente local [${this.tagName}]`, error);
      this.fallbackUI(error);
    }
  }
}
