// @ts-check
import { MitaElement } from '../../utils/MitaElement.js';

/**
 * 🪟 <mita-dialog>
 * Un modal accesible nativo que envuelve el <dialog> de HTML5.
 * 
 * Atributos soportados:
 * - `abierto`: Abre el modal si está presente.
 * - `estricto`: Si está presente, el modal NO se puede cerrar con ESC ni clic afuera. Obliga a usar un botón explícito.
 */
export class MitaDialog extends MitaElement {
  static get observedAttributes() {
    return ['abierto', 'estricto'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async render() {
    this.shadowRoot.innerHTML = `
      <style>
        dialog {
          border: none;
          border-radius: 12px;
          padding: 0;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          background: var(--bg-primary, #ffffff);
          color: var(--text-color, #1a1a1a);
          max-width: 500px;
          width: 90%;
          opacity: 0;
          transform: translateY(20px) scale(0.95);
          transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        dialog[open] {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        dialog::backdrop {
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        dialog[open]::backdrop {
          opacity: 1;
        }

        .dialog-content {
          padding: 1.5rem;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .close-btn {
          background: transparent;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--text-color, #1a1a1a);
          line-height: 1;
          opacity: 0.6;
          transition: opacity 0.2s;
        }
        
        .close-btn:hover {
          opacity: 1;
        }

        /* Ocultar botón de cierre si es estricto */
        :host([estricto]) .close-btn {
          display: none;
        }
      </style>

      <dialog id="mita-modal">
        <div class="dialog-content">
          <div class="header">
            <strong><slot name="titulo">Título del Modal</slot></strong>
            <button class="close-btn" aria-label="Cerrar modal">&times;</button>
          </div>
          <div class="body">
            <slot></slot>
          </div>
          <div class="footer" style="margin-top: 1.5rem;">
            <slot name="footer"></slot>
          </div>
        </div>
      </dialog>
    `;

    this.$dialog = this.shadowRoot.getElementById('mita-modal');
    this.$btnCerrar = this.shadowRoot.querySelector('.close-btn');

    // Manejar cierre por botón interno
    this.$btnCerrar.addEventListener('click', () => this.cerrar());

    // Atrapar cierre por ESC para poder bloquearlo si es estricto
    this.$dialog.addEventListener('cancel', (e) => {
      if (this.hasAttribute('estricto')) {
        e.preventDefault(); // Bloquea el ESC
        this._animarRebote();
      } else {
        this.cerrar();
      }
    });

    // Cerrar al hacer clic en el backdrop (afuera del modal)
    this.$dialog.addEventListener('click', (e) => {
      if (e.target === this.$dialog) {
        if (this.hasAttribute('estricto')) {
          this._animarRebote();
        } else {
          this.cerrar();
        }
      }
    });

    // Sincronizar estado inicial
    this._sincronizarEstado();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'abierto' && oldValue !== newValue) {
      if (this.$dialog) this._sincronizarEstado();
    }
  }

  _sincronizarEstado() {
    const debeEstarAbierto = this.hasAttribute('abierto');
    const estaAbierto = this.$dialog.open;

    if (debeEstarAbierto && !estaAbierto) {
      this.$dialog.showModal(); // API nativa de accesibilidad
    } else if (!debeEstarAbierto && estaAbierto) {
      // Dejamos que CSS anime antes de cerrar realmente
      this.$dialog.style.opacity = '0';
      this.$dialog.style.transform = 'translateY(10px) scale(0.98)';
      setTimeout(() => {
        this.$dialog.close();
        this.$dialog.style = ''; // Limpiar inline styles
      }, 300); // 300ms debe coincidir con el transition CSS
    }
  }

  _animarRebote() {
    this.$dialog.style.transform = 'translateY(0) scale(1.02)';
    setTimeout(() => {
      this.$dialog.style.transform = 'translateY(0) scale(1)';
    }, 150);
  }

  // APIs Públicas
  abrir() {
    this.setAttribute('abierto', '');
    this.dispatchEvent(new CustomEvent('modal-abierto', { bubbles: true, composed: true }));
  }

  cerrar() {
    this.removeAttribute('abierto');
    this.dispatchEvent(new CustomEvent('modal-cerrado', { bubbles: true, composed: true }));
  }
}

if (!customElements.get('mita-dialog')) {
  customElements.define('mita-dialog', MitaDialog);
}
