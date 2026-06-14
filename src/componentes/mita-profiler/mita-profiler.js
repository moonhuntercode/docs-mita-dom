// @ts-check
import { estadoProfiler, configuracionProfiler } from '../../store/profilerStore.js';
import { Signal, SignalDerivado } from 'mita-dom';

import html from './mita-profiler.html?raw';
import css from './mita-profiler.css?raw';

/**
 * ⚡ Mita Profiler
 * Un clon de Vercel Speed Insights. Muestra el rendimiento de renderizado
 * de los componentes en tiempo real.
 */
class MitaProfiler extends HTMLElement {
  constructor() {
    super();
    // Shadow DOM para aislar los estilos del Profiler del resto de la web
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `<style>${css}</style>` + html;
    
    this.$btnToggle = this.shadowRoot.getElementById('btn-toggle-profiler');
    this.$container = this.shadowRoot.getElementById('profiler-widget');
    this.$lista = this.shadowRoot.getElementById('profiler-list');
    this.$inputRojo = this.shadowRoot.getElementById('input-rojo');

    // Estado local para Conditional Rendering
    this.estadoMinimizado = new Signal(false);

    // Evento que muta el estado local
    this.$btnToggle.addEventListener('click', () => {
      this.estadoMinimizado.set(!this.estadoMinimizado.get());
    });

    // Suscriptor de Conditional Rendering (Actualización Quirúrgica)
    this.estadoMinimizado.suscribir((isMin) => {
      if (isMin) {
        this.$container.classList.add('minimized');
        this.$btnToggle.textContent = '👁️ Mostrar';
        this.$btnToggle.setAttribute('aria-label', 'Mostrar Profiler');
      } else {
        this.$container.classList.remove('minimized');
        this.$btnToggle.textContent = '🙈 Ocultar';
        this.$btnToggle.setAttribute('aria-label', 'Ocultar Profiler');
      }
    });

    // Binding Configuración
    this.$inputRojo.value = configuracionProfiler.get().umbralRojo;
    this.$inputRojo.addEventListener('change', (e) => {
      configuracionProfiler.patch({ umbralRojo: parseFloat(e.target.value) });
    });

    // Suscribirse a las métricas (Derivamos un SignalDerivado para ordernar por las últimas)
    const metricasInvertidas = new SignalDerivado(estadoProfiler, (estado) => {
      return [...(estado.renderizados || [])].reverse();
    });

    metricasInvertidas.suscribir((metricas) => {
      this._renderLista(metricas);
    });
    
    // Y suscribirse a los cambios de config para repintar
    configuracionProfiler.suscribir(() => {
      this._renderLista(metricasInvertidas.get());
    });
  }

  _renderLista(metricas) {
    if (!this.$lista) return;
    const config = configuracionProfiler.get();
    
    this.$lista.innerHTML = metricas.map(m => {
      let claseColor = 'status-green';
      if (m.ms >= config.umbralRojo) {
        claseColor = 'status-red';
      } else if (m.ms >= config.umbralAmarillo) {
        claseColor = 'status-yellow';
      }
      
      return `
        <li class="profiler-item ${claseColor}">
          <span>&lt;${m.componente}&gt;</span>
          <span>${m.ms.toFixed(2)} ms</span>
        </li>
      `;
    }).join('');
  }
}

customElements.define('mita-profiler', MitaProfiler);
