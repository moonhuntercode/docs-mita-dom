// @ts-check
import { MitaElement } from '../../utils/MitaElement.js';
import { estadoProfiler, configuracionProfiler } from '../../store/profilerStore.js';

export class DemoPerformance extends MitaElement {
  async render() {
    this.innerHTML = `
      <div class="tarjetas-grid">
        <div class="tarjeta-optimizada" style="grid-column: 1 / -1; background: var(--bg-secondary); border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden;">
            <div class="tarjeta-header" style="background: linear-gradient(135deg, #f43f5e 0%, #be123c 100%); padding: 1rem; color: white;">
                <h2 style="margin: 0; font-size: 1.25rem;">⏱️ Profiler: Rendimiento e Interacciones</h2>
                <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;">Monitor de Renderizados y Latencia de Interacción (INP)</p>
            </div>
            
            <div style="padding: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3 style="margin:0;">Últimas Interacciones (Clicks a Botones)</h3>
                    <div style="font-size: 0.8rem; color: #888;">Umbral Rojo: <span id="umbral-txt"></span>ms</div>
                </div>

                <div id="lista-interacciones" style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 250px; overflow-y: auto; background: var(--bg-tertiary); padding: 1rem; border-radius: 8px;">
                    <!-- Items -->
                </div>

                <h3 style="margin:2rem 0 1rem 0;">Tiempos de Renderizado</h3>
                <div id="lista-renderizados" style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 250px; overflow-y: auto; background: var(--bg-tertiary); padding: 1rem; border-radius: 8px;">
                    <!-- Items -->
                </div>
            </div>
        </div>
      </div>
    `;

    this._iniciarSuscripciones();
  }

  _iniciarSuscripciones() {
    const $listaInteracciones = this.querySelector('#lista-interacciones');
    const $listaRenderizados = this.querySelector('#lista-renderizados');
    const $umbralTxt = this.querySelector('#umbral-txt');

    // Suscripción a la configuración del umbral
    this.subConfig = (config) => {
        if ($umbralTxt) $umbralTxt.textContent = config.umbralRojo;
    };
    configuracionProfiler.suscribir(this.subConfig);

    // Suscripción a las métricas
    this.subMetrics = (estado) => {
        const config = configuracionProfiler.get();
        const umbral = config.umbralRojo || 10;

        // Renderizar Interacciones
        if ($listaInteracciones) {
            if (!estado.interacciones || estado.interacciones.length === 0) {
                $listaInteracciones.innerHTML = '<div style="color:#666; font-style:italic;">No hay interacciones registradas. Haz clic en algún botón del sistema.</div>';
            } else {
                // Invertimos para mostrar las más nuevas primero
                const HTML = [...estado.interacciones].reverse().map(i => {
                    const esLento = i.ms > umbral;
                    const colorBadge = esLento ? '#fecdd3' : '#dcfce7';
                    const colorTxt = esLento ? '#be123c' : '#15803d';
                    
                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: var(--bg-secondary); border-radius: 6px; border-left: 4px solid ${colorTxt};">
                            <div>
                                <strong style="color:var(--text-color);">${i.objetivo}</strong> en <code>&lt;${i.componente}&gt;</code>
                            </div>
                            <span style="background: ${colorBadge}; color: ${colorTxt}; padding: 0.2rem 0.5rem; border-radius: 12px; font-weight: bold; font-size: 0.85rem;">
                                ${i.ms.toFixed(2)} ms
                            </span>
                        </div>
                    `;
                }).join('');
                $listaInteracciones.innerHTML = HTML;
            }
        }

        // Renderizar Tiempos de Renderizado
        if ($listaRenderizados) {
            if (!estado.renderizados || estado.renderizados.length === 0) {
                $listaRenderizados.innerHTML = '<div style="color:#666; font-style:italic;">No hay renders registrados.</div>';
            } else {
                const HTML = [...estado.renderizados].reverse().map(r => {
                    const esLento = r.ms > umbral;
                    const colorBadge = esLento ? '#fecdd3' : '#e0f2fe';
                    const colorTxt = esLento ? '#be123c' : '#0369a1';
                    
                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: var(--bg-secondary); border-radius: 6px;">
                            <code>&lt;${r.componente}&gt;</code>
                            <span style="background: ${colorBadge}; color: ${colorTxt}; padding: 0.2rem 0.5rem; border-radius: 12px; font-weight: bold; font-size: 0.85rem;">
                                ${r.ms.toFixed(2)} ms
                            </span>
                        </div>
                    `;
                }).join('');
                $listaRenderizados.innerHTML = HTML;
            }
        }
    };
    estadoProfiler.suscribir(this.subMetrics);
  }

  disconnectedCallback() {
      super.disconnectedCallback?.();
      if (this.subMetrics) estadoProfiler.desuscribir(this.subMetrics);
      if (this.subConfig) configuracionProfiler.desuscribir(this.subConfig);
  }
}

if (!customElements.get('demo-performance')) {
  customElements.define('demo-performance', DemoPerformance);
}
