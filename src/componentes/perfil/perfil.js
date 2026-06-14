// @ts-check
import { MitaElement } from '../../utils/MitaElement.js';
import { rutaActual } from 'mita-dom';
import templateHTML from './perfil.html?raw';
import './perfil.css';

export class MitaPerfil extends MitaElement {
    constructor() {
        super();
        this._subRouterCb = null;
    }

    async render() {
        this.innerHTML = templateHTML;

        this.$tabInfo = this.querySelector('#tab-info');
        this.$tabSeguridad = this.querySelector('#tab-seguridad');
        this.$tabIndex = this.querySelector('#tab-index');

        // Nested Routing: Suscripción Local al Router Global
        this._subRouterCb = (ruta) => {
            if (!ruta.startsWith('/perfil')) return;
            
            // Lógica de Outlet (Sub-Vistas)
            if (this.$tabInfo) this.$tabInfo.style.display = ruta === '/perfil/info' ? 'block' : 'none';
            if (this.$tabSeguridad) this.$tabSeguridad.style.display = ruta === '/perfil/seguridad' ? 'block' : 'none';
            if (this.$tabIndex) this.$tabIndex.style.display = (ruta === '/perfil' || ruta === '/perfil/') ? 'block' : 'none';
        };
        
        rutaActual.suscribir(this._subRouterCb);
        
        // Ejecutamos inmediatamente para sincronizar el estado inicial
        this._subRouterCb(rutaActual.value);
    }

    disconnectedCallback() {
        // Limpieza para evitar memory leaks
        if (this._subRouterCb) {
            rutaActual.desuscribir(this._subRouterCb);
        }
    }
}

if (!customElements.get('demo-perfil')) {
    customElements.define('demo-perfil', MitaPerfil);
}
