// @ts-check
import { renderCondicional, vincularTexto } from 'mita-dom';
import { Logger } from './logger.js';
import { registrarMetrica, registrarInteraccion } from '../store/profilerStore.js';

/**
 * 🛡️ MitaElement (Ciclo de Vida Completo + Error Boundary + Auto-Limpieza + Telemetría SPA)
 * Orden garantizado:
 * 1. `alCrear()` -> 2. `alAntesDeRenderizar()` -> 3. `render()` -> 4. `alMontar()`
 * 5. `alCambiarAtributo()` / `alCambiarProp()` -> 6. `alActualizar()` -> 7. Auto-Limpieza + `alDesmontar()`
 */
export class MitaElement extends HTMLElement {
  constructor() {
    super();
    /** @type {Array<() => void>} */
    this._limpiezas = [];
    this._faseCiclo = 'creado';
    this._estaMontado = false;
    this._renderCount = 0;

    // @ts-ignore
    if (typeof this.alCrear === 'function') {
      try {
        // @ts-ignore
        this.alCrear();
      } catch (err) {
        this._reportarErrorFase('alCrear', err);
      }
    }
  }

  _reportarErrorFase(fase, error) {
    this._faseCiclo = 'error';
    Logger.error(`Error en ${fase} de [${this.tagName}]`, error);
    // @ts-ignore
    if (typeof this.alError === 'function') {
      try {
        // @ts-ignore
        this.alError(error, fase);
      } catch (innerErr) {
        Logger.error(`Error en alError de [${this.tagName}]`, innerErr);
      }
    }
  }

  /**
   * 🧹 Registra una función de limpieza ejecutada automáticamente en disconnectedCallback().
   * @param {() => void} limpiarFn
   */
  registrarLimpieza(limpiarFn) {
    if (typeof limpiarFn === 'function') {
      this._limpiezas.push(limpiarFn);
    }
  }

  /**
   * 👂 Suscribe a un Signal y auto-limpia al desmontar el componente.
   * @template T
   * @param {{ suscribir: (cb: (val: T) => void) => (() => void) | void, desuscribir?: (cb: (val: T) => void) => void }} signal
   * @param {(val: T) => void} callback
   * @returns {() => void}
   */
  escucharEstado(signal, callback) {
    const posibleLimpieza = signal.suscribir(callback);
    const detener =
      typeof posibleLimpieza === 'function'
        ? posibleLimpieza
        : () => {
            if (typeof signal.desuscribir === 'function') {
              signal.desuscribir(callback);
            }
          };
    this.registrarLimpieza(detener);
    return detener;
  }

  /**
   * 🔀 Atajo declarativo de `renderCondicional` con limpieza automática al desmontar.
   * @param {any} configuracion
   * @returns {() => void}
   */
  mostrarSi(configuracion) {
    const detener = renderCondicional(configuracion);
    this.registrarLimpieza(detener);
    return detener;
  }

  /**
   * 🎯 Vincula un Signal al `textContent` de un selector/nodo y auto-limpia al desmontar.
   * @template T
   * @param {any} signal
   * @param {string | HTMLElement | null} selectorONodo
   * @param {(valor: T) => string} [formateador]
   * @returns {() => void}
   */
  vincularTexto(signal, selectorONodo, formateador) {
    const nodo =
      typeof selectorONodo === 'string'
        ? /** @type {HTMLElement | null} */ (this.querySelector(selectorONodo))
        : selectorONodo;
    const detener = vincularTexto(signal, nodo, formateador);
    this.registrarLimpieza(detener);
    return detener;
  }

  /**
   * 🔄 Re-renderiza de forma segura y ejecuta `alActualizar(motivo)`.
   * @param {string} [motivo='manual']
   */
  async solicitarActualizacion(motivo = 'manual') {
    try {
      this._renderCount += 1;
      await this.render();
      this._faseCiclo = 'actualizado';
      // @ts-ignore
      if (typeof this.alActualizar === 'function') {
        // @ts-ignore
        await this.alActualizar(motivo);
      }
    } catch (error) {
      this._reportarErrorFase('solicitarActualizacion', error);
      this.fallbackUI(error);
    }
  }

  obtenerCicloDeVida() {
    return {
      componente: (this.tagName || 'mita-element').toLowerCase(),
      faseActual: this._faseCiclo,
      montado: this._estaMontado,
      renders: this._renderCount,
      limpiezasPendientes: this._limpiezas.length
    };
  }

  /**
   * Método principal que las clases hijas implementan para pintar el Light DOM base.
   */
  async render() {}

  /**
   * Se ejecuta si ocurre un error en el render.
   */
  fallbackUI(error) {
    this.innerHTML = `
      <section style="padding: 1rem; border: 2px dashed #ff5252; background: rgba(255,82,82,0.1); border-radius: 8px;">
        <h4 style="color: #ff5252; margin:0 0 0.5rem 0;">⚠️ Fallo en componente &lt;${this.tagName.toLowerCase()}&gt;</h4>
        <p style="margin:0; font-size: 0.9em; color: #ccc;">${error.message}</p>
      </section>
    `;
  }

  async connectedCallback() {
    try {
      const t0 = performance.now();

      // @ts-ignore
      if (typeof this.alAntesDeRenderizar === 'function') {
        // @ts-ignore
        await this.alAntesDeRenderizar();
      }

      this._faseCiclo = 'renderizando';
      this._renderCount += 1;
      await this.render();
      this._estaMontado = true;
      this._faseCiclo = 'montado';

      // @ts-ignore
      if (typeof this.alMontar === 'function') {
        // @ts-ignore
        await this.alMontar();
      }

      const duracion = performance.now() - t0;
      registrarMetrica(this.tagName.toLowerCase(), duracion);

      const onInteract = (e) => {
        const target = /** @type {HTMLElement | null} */ (e.target);
        if (target && (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button')) {
          const start = performance.now();
          requestAnimationFrame(() => {
            const latency = performance.now() - start;
            const objetivo = target.id ? `#${target.id}` : target.textContent?.trim().substring(0, 15) || 'Botón';
            registrarInteraccion(this.tagName.toLowerCase(), objetivo, latency);
          });
        }
      };

      this.addEventListener('click', onInteract);
      this.registrarLimpieza(() => this.removeEventListener('click', onInteract));
    } catch (error) {
      this._reportarErrorFase('connectedCallback', error);
      this.fallbackUI(error);
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    // @ts-ignore
    if (typeof this.alCambiarAtributo === 'function') {
      try {
        // @ts-ignore
        this.alCambiarAtributo(name, oldValue, newValue);
      } catch (err) {
        this._reportarErrorFase('alCambiarAtributo', err);
      }
    }
    const propCamel = String(name).replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
    // @ts-ignore
    if (typeof this.alCambiarProp === 'function') {
      try {
        // @ts-ignore
        this.alCambiarProp(propCamel, oldValue, newValue);
      } catch (err) {
        this._reportarErrorFase('alCambiarProp', err);
      }
    }
  }

  disconnectedCallback() {
    this._estaMontado = false;
    this._faseCiclo = 'desmontado';

    if (Array.isArray(this._limpiezas) && this._limpiezas.length > 0) {
      this._limpiezas.forEach((limpiar) => {
        try {
          limpiar();
        } catch (err) {
          Logger.error(`Error limpiando suscripción en [${this.tagName}]`, err);
        }
      });
      this._limpiezas = [];
    }

    // @ts-ignore
    if (typeof this.alDesmontar === 'function') {
      try {
        // @ts-ignore
        this.alDesmontar();
      } catch (err) {
        this._reportarErrorFase('alDesmontar', err);
      }
    }
  }
}
