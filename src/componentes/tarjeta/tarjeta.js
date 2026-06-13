// @ts-check
import { Signal } from 'mita-dom';
import { Logger } from '../../utils/logger.js';
import { estadoAppGlobal, aumentarVisitas, disminuirVisitas, reiniciarVisitasGlobal } from '../../store/appStore.js';

// Importamos la plantilla. Usamos let para poder sobreescribirla en HMR
import templateHTMLOriginal from './tarjeta.html?raw';
let templateHTML = templateHTMLOriginal;
import './tarjeta.css';

import { MitaElement } from '../../utils/MitaElement.js';

export class MitaTarjeta extends MitaElement {
    constructor() {
        super();
        // Estado Local: Nace y muere con esta instancia del componente
        this.estadoLocal = new Signal(0);
    }

    /**
     * 🧬 CICLO DE VIDA: render (Reemplaza connectedCallback gracias a MitaElement)
     * Se dispara automáticamente cuando la etiqueta <demo-tarjeta> entra al DOM.
     * Aquí hacemos el render inicial y nos suscribimos a los eventos (Local y Global).
     */
    async render() {
        Logger.info('Montando <demo-tarjeta>...');
        // 1. Inyección de vistas en Light DOM (Usa la variable let mutable)
        this.innerHTML = templateHTML;

        this.iniciarLogica();
    }

    /**
     * Extraemos la lógica de interactividad a un método separado
     * para poder re-ejecutarlo si el HTML cambia por HMR.
     */
    iniciarLogica() {
        // 2. Control granular: capturamos referencias una sola vez
        this.$valorGlobal = this.querySelector('#valor-global');
        this.$valorLocal = this.querySelector('#valor-local');
        this.$btnLocalAdd = this.querySelector('#btn-local-add');
        this.$btnLocalRem = this.querySelector('#btn-local-rem');
        this.$btnGlobalAdd = this.querySelector('#btn-global-add');
        this.$btnGlobalRem = this.querySelector('#btn-global-rem');
        this.$btnResetAll = this.querySelector('#btn-reset-all');
        this.$btnResetGlobal = this.querySelector('#btn-reset-global');
        this.$btnResetLocal = this.querySelector('#btn-reset-local');

        // Guardamos la referencia de la función para poder desuscribirnos luego
        this._callbackGlobal = (/** @type {any} */ estado) => {
            if (this.$valorGlobal) {
                const visitas = estado && typeof estado === 'object' && estado.visitas !== undefined ? estado.visitas : 0;
                this.$valorGlobal.textContent = visitas.toString();
            }
        };

        // 3. Suscripciones a los Signals
        estadoAppGlobal.suscribir(this._callbackGlobal);

        this.estadoLocal.suscribir((/** @type {any} */ valor) => {
            if (this.$valorLocal) this.$valorLocal.textContent = valor.toString();
        });

        // 4. Interacciones (Usando CRUD Avanzado)
        // Local Updates
        this.$btnLocalAdd?.addEventListener('click', () => {
            this.estadoLocal.update((v) => v + 1);
        });
        
        this.$btnLocalRem?.addEventListener('click', () => {
            this.estadoLocal.update((v) => Math.max(0, v - 1));
        });

        // Global Updates (Importados estáticamente desde el Store)
        this.$btnGlobalAdd?.addEventListener('click', () => {
            aumentarVisitas();
        });

        this.$btnGlobalRem?.addEventListener('click', () => {
            disminuirVisitas();
        });

        // Resets
        this.$btnResetLocal?.addEventListener('click', () => {
            this.estadoLocal.reset();
        });

        this.$btnResetGlobal?.addEventListener('click', () => {
            reiniciarVisitasGlobal();
        });

        this.$btnResetAll?.addEventListener('click', () => {
            this.estadoLocal.reset();
            reiniciarVisitasGlobal();
        });
    }

    /**
     * 🧬 CICLO DE VIDA: disconnectedCallback
     * Se dispara cuando la etiqueta desaparece del DOM (por ej. si cambiamos de vista).
     * CRÍTICO: Desuscribirse de Signals Globales aquí evita Memory Leaks.
     */
    disconnectedCallback() {
        Logger.warn('Desmontando <demo-tarjeta> y limpiando suscripciones.');
        if (this._callbackGlobal) {
            estadoAppGlobal.desuscribir(this._callbackGlobal);
        }
        // Nota: No es estrictamente necesario desuscribir estadoLocal porque el 
        // estadoLocal es una propiedad de 'this' y será destruido por el Garbage Collector
        // junto con todo el componente cuando no queden referencias.
    }
}

// Protección para HMR de Vite del JavaScript
if (!customElements.get('demo-tarjeta')) {
    customElements.define('demo-tarjeta', MitaTarjeta);
}

// 🔥 Magia: Granular DOM HMR para el archivo HTML
if (import.meta.hot) {
    import.meta.hot.accept('./tarjeta.html?raw', (nuevoModuloHTML) => {
        // 1. Actualizamos la plantilla en memoria
        templateHTML = nuevoModuloHTML.default;
        
        // 2. Buscamos todas las instancias vivas en el DOM y las re-renderizamos
        const instancias = document.querySelectorAll('demo-tarjeta');
        instancias.forEach((/** @type {any} */ instancia) => {
            // Limpiamos suscripciones viejas antes de re-renderizar para evitar memory leaks
            if (instancia._callbackGlobal) {
                estadoAppGlobal.desuscribir(instancia._callbackGlobal);
            }
            
            // Re-renderizamos con el nuevo HTML en tiempo real sin recargar la página
            instancia.render();
            console.log(`[HMR] <demo-tarjeta> re-renderizado granularmente.`);
        });
    });
}
