// @ts-check
import { MitaElement } from '../../utils/MitaElement.js';

/**
 * 🚀 <mita-teleport>
 * Mueve dinámicamente su contenido (los nodos hijos) a otro lugar del DOM
 * (por ejemplo, al final del `<body>`), escapando de contenedores restrictivos
 * como `overflow: hidden` o problemas de `z-index`.
 */
export class MitaTeleport extends MitaElement {
  constructor() {
    super();
    this._targetNode = null;
    this._placeholder = null;
  }

  async render() {
    const toSelector = this.getAttribute('to');
    if (!toSelector) {
      console.warn('<mita-teleport> requiere un atributo "to".');
      return;
    }

    this._targetNode = document.querySelector(toSelector);
    if (!this._targetNode) {
      console.warn(`<mita-teleport> no pudo encontrar el objetivo: "${toSelector}"`);
      return;
    }

    // Crear un marcador para saber de dónde sacamos los elementos
    this._placeholder = document.createComment('mita-teleport-placeholder');
    this.parentNode?.insertBefore(this._placeholder, this);

    // Mover todos los hijos al destino
    while (this.childNodes.length > 0) {
      this._targetNode.appendChild(this.childNodes[0]);
    }

    // Ocultar este componente original
    this.style.display = 'none';
  }

  disconnectedCallback() {
    super.disconnectedCallback?.();
    
    // Al destruirse, limpiar el contenido que teletransportamos (idealmente)
    // Para simplificar, podríamos requerir que el hijo sea un único contenedor
    // o simplemente no hacer nada si es un modal persistente.
  }
}

if (!customElements.get('mita-teleport')) {
  customElements.define('mita-teleport', MitaTeleport);
}
