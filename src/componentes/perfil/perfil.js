// @ts-check
import { crearRecurso, rutaActual } from 'mita-dom';
import { estadoAppGlobal } from '../../store/appStore.js';
import { Logger } from '../../utils/logger.js';
import templateHTMLOriginal from './perfil.html?raw';
let templateHTML = templateHTMLOriginal;
import './perfil.css'; // HMR nativo
import { MitaElement } from '../../utils/MitaElement.js';

export class MitaPerfil extends MitaElement {
    constructor() {
        super();
        this._callbackRuta = null;
        this._callbackGlobal = null;
    }

    /**
     * 🧬 CICLO DE VIDA: render
     */
    async render() {
        Logger.info('Montando <demo-perfil>...');
        // 1. Inyección de contenido (sin <style> porque Vite lo maneja)
        this.innerHTML = templateHTML;

        this.$estado = this.querySelector('#perfil-estado');
        this.$contenido = this.querySelector('#perfil-contenido');
        this.$error = this.querySelector('#perfil-error');
        this.$nombre = this.querySelector('#perfil-nombre');
        this.$email = this.querySelector('#perfil-email');

        // El router se encarga de mostrar/ocultar el componente,
        // ya no necesitamos suscribirnos a rutaActual aquí.

        // 2. Suscripción al Signal Global (El equivalente de "Props" en React)
        // MitaDOM es "Cero Prop Drilling". El componente escucha y muta granularmente solo lo que le importa.
        this._callbackGlobal = (estado) => {
            // Actualizar contador
            if (this.$estado) {
                const visitas = estado && typeof estado === 'object' && estado.visitas ? estado.visitas : 0;
                this.$estado.textContent = `Global (Visitas): ${visitas}`;
            }

            // Actualizar nombre dinámicamente ("Props" reactivas)
            if (this.$nombre && estado && typeof estado === 'object' && estado.usuario) {
                this.$nombre.textContent = estado.usuario;
            }
        };
        estadoAppGlobal.suscribir(this._callbackGlobal);

        // 3. Fetch Granular Reactivo (simulamos un retardo de red inicial)
        const fetchFakeUser = () => new Promise((resolve) => {
            setTimeout(() => {
                // Solo cargamos la data simulada si no hay ya un usuario global
                const currentGlobal = estadoAppGlobal.value || {};
                resolve({ 
                    nombre: currentGlobal.usuario || 'Jane Doe', 
                    email: 'jane.doe@example.com' 
                });
            }, 1000); 
        });

        const recurso = crearRecurso(fetchFakeUser);

        // Conectamos los Signals del recurso al DOM de forma atómica
        recurso.loading.suscribir((cargando) => {
            if (this.$estado && this.$contenido && this.$error) {
                this.$estado.style.display = cargando ? 'block' : 'none';
                if (!cargando && !recurso.error.value) {
                    this.$contenido.style.display = 'block';
                }
            }
        });

        recurso.data.suscribir((data) => {
            if (data && this.$nombre && this.$email && !estadoAppGlobal.value?.usuario) {
                // Solo establecemos el nombre inicial si no hay uno global
                this.$nombre.textContent = data.nombre;
                this.$email.textContent = data.email;
            }
        });
    }

    /**
     * 🧬 CICLO DE VIDA: disconnectedCallback
     */
    disconnectedCallback() {
        Logger.warn('Desmontando <demo-perfil>...');
        // Prevenir Memory Leaks
        if (this._callbackRuta) rutaActual.desuscribir(this._callbackRuta);
        if (this._callbackGlobal) estadoAppGlobal.desuscribir(this._callbackGlobal);
    }
}

if (!customElements.get('demo-perfil')) {
    customElements.define('demo-perfil', MitaPerfil);
}

// 🔥 Magia: Granular DOM HMR para el archivo HTML
if (import.meta.hot) {
    import.meta.hot.accept('./perfil.html?raw', (nuevoModuloHTML) => {
        templateHTML = nuevoModuloHTML.default;
        
        const instancias = document.querySelectorAll('demo-perfil');
        instancias.forEach((/** @type {any} */ instancia) => {
            if (instancia._callbackGlobal) {
                estadoAppGlobal.desuscribir(instancia._callbackGlobal);
            }
            instancia.render();
            console.log(`[HMR] <demo-perfil> re-renderizado granularmente.`);
        });
    });
}
