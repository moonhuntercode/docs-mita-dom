// @ts-check
import { MitaElement } from '../../utils/MitaElement.js';

/**
 * ⏳ <mita-loader>
 * Componente UI genérico para indicar estados de carga (Spinner).
 * 
 * Atributos:
 * - `texto`: Texto a mostrar debajo del spinner (opcional)
 * - `tamano`: 'pequeno', 'mediano' (default), 'grande'
 */
export class MitaLoader extends MitaElement {
  static get observedAttributes() {
    return ['texto', 'tamano'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async render() {
    const texto = this.getAttribute('texto') || 'Cargando...';
    const tamano = this.getAttribute('tamano') || 'mediano';

    let tamanoPx = '40px';
    let bordePx = '4px';
    let fontPx = '1rem';

    if (tamano === 'pequeno') {
        tamanoPx = '20px';
        bordePx = '2px';
        fontPx = '0.8rem';
    } else if (tamano === 'grande') {
        tamanoPx = '60px';
        bordePx = '6px';
        fontPx = '1.2rem';
    }

    this.shadowRoot.innerHTML = `
      <style>
        .loader-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          color: var(--text-secondary, #666);
        }

        .spinner {
          width: ${tamanoPx};
          height: ${tamanoPx};
          border: ${bordePx} solid rgba(0, 0, 0, 0.1);
          border-left-color: var(--primary-color, #3b82f6); /* Color principal del ecosistema */
          border-radius: 50%;
          animation: girar 1s linear infinite;
        }

        .texto {
          margin-top: 0.75rem;
          font-size: ${fontPx};
          font-family: system-ui, sans-serif;
          animation: pulso 1.5s ease-in-out infinite;
        }

        @keyframes girar {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulso {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      </style>

      <div class="loader-container">
        <div class="spinner"></div>
        ${texto ? `<div class="texto">${texto}</div>` : ''}
      </div>
    `;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
        this.render();
    }
  }
}

if (!customElements.get('mita-loader')) {
  customElements.define('mita-loader', MitaLoader);
}
