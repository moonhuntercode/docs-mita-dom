// @ts-check
import { MitaElement } from '../../utils/MitaElement.js';

/**
 * 🪟 <mita-dialog> (Light DOM Nativo — Sin Shadow DOM)
 * Envuelve el elemento <dialog> de HTML5 respetando la arquitectura Light DOM de MitaDOM.
 * Re-utilizable para alertas, confirmaciones estrictas, publicación de novedades y edición en DB Local.
 */
export class MitaDialog extends MitaElement {
  static get observedAttributes() {
    return ['abierto', 'estricto'];
  }

  async render() {
    if (this._inicializado) return;
    this._inicializado = true;

    const nodoTitulo = this.querySelector('[slot="titulo"]');
    const nodoFooter = this.querySelector('[slot="footer"]');

    const tituloHtml = nodoTitulo ? nodoTitulo.innerHTML : (this.getAttribute('titulo') || 'Ventana Modal');
    if (nodoTitulo) nodoTitulo.remove();

    let footerHtml = '';
    if (nodoFooter) {
      footerHtml = nodoFooter.outerHTML;
      nodoFooter.remove();
    }

    const cuerpoHtml = this.innerHTML;
    const esEstricto = this.hasAttribute('estricto');

    this.innerHTML = `
      <dialog class="mita-native-dialog" style="border: 1px solid var(--color-borde, rgba(255,255,255,0.18)); border-radius: 12px; padding: 0; background: var(--color-superficie, #1e293b); color: var(--color-texto, #f8fafc); max-width: 560px; width: 92%; margin: auto; box-shadow: 0 18px 40px rgba(0,0,0,0.45);">
        <article class="mita-dialog-box" style="padding: 1.25rem; display: grid; gap: 0.9rem;">
          <header class="mita-dialog-head" style="display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; padding-bottom: 0.65rem; border-bottom: 1px solid var(--color-borde, rgba(255,255,255,0.12));">
            <strong class="mita-dialog-title" style="font-size: 1.05rem;">${tituloHtml}</strong>
            <button type="button" class="mita-dialog-close" aria-label="Cerrar modal" style="display: ${esEstricto ? 'none' : 'inline-flex'}; background: transparent; border: 1px solid var(--color-borde, rgba(255,255,255,0.2)); color: inherit; border-radius: 6px; padding: 0.15rem 0.55rem; font-size: 1.1rem; cursor: pointer;">&times;</button>
          </header>
          <section class="mita-dialog-body" style="display: grid; gap: 0.75rem;">
            ${cuerpoHtml}
          </section>
          ${footerHtml ? `<footer class="mita-dialog-foot" style="padding-top: 0.5rem; border-top: 1px solid var(--color-borde, rgba(255,255,255,0.12));">${footerHtml}</footer>` : ''}
        </article>
      </dialog>
    `;

    this.$dialog = /** @type {HTMLDialogElement | null} */ (this.querySelector('dialog.mita-native-dialog'));
    this.$btnCerrar = this.querySelector('.mita-dialog-close');

    if (this.$btnCerrar) {
      this.$btnCerrar.addEventListener('click', () => this.cerrar());
    }

    if (this.$dialog) {
      this.$dialog.addEventListener('cancel', (e) => {
        if (this.hasAttribute('estricto')) {
          e.preventDefault();
        } else {
          this.cerrar();
        }
      });

      this.$dialog.addEventListener('click', (e) => {
        if (e.target === this.$dialog && !this.hasAttribute('estricto')) {
          this.cerrar();
        }
      });
    }

    this._sincronizarEstado();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'abierto' && oldValue !== newValue && this.$dialog) {
      this._sincronizarEstado();
    }
  }

  _sincronizarEstado() {
    if (!this.$dialog) return;
    const debeAbrir = this.hasAttribute('abierto');
    const estaAbierto = Boolean(this.$dialog.open);

    if (debeAbrir && !estaAbierto) {
      if (typeof this.$dialog.showModal === 'function') {
        this.$dialog.showModal();
      } else {
        this.$dialog.setAttribute('open', '');
      }
    } else if (!debeAbrir && estaAbierto) {
      if (typeof this.$dialog.close === 'function') {
        this.$dialog.close();
      } else {
        this.$dialog.removeAttribute('open');
      }
    }
  }

  abrir() {
    this.setAttribute('abierto', '');
    this._sincronizarEstado();
    this.dispatchEvent(new CustomEvent('modal-abierto', { bubbles: true, composed: true }));
  }

  cerrar() {
    this.removeAttribute('abierto');
    this._sincronizarEstado();
    this.dispatchEvent(new CustomEvent('modal-cerrado', { bubbles: true, composed: true }));
  }
}

if (!customElements.get('mita-dialog')) {
  customElements.define('mita-dialog', MitaDialog);
}
