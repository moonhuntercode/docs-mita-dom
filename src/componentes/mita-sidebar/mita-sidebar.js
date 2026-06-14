// @ts-check
import { MitaElement } from '../../utils/MitaElement.js';
import html from './mita-sidebar.html?raw';
import { estadoSidebar } from '../../store/layoutStore.js';
import { estadoConfiguracion } from '../../store/configStore.js';

export class MitaSidebar extends MitaElement {
    constructor() {
        super();
        this.backdrop = null;
    }

    async render() {
        this.innerHTML = html;
        
        const $sidebar = this.querySelector('#sidebar');
        const $btnCerrar = this.querySelector('#btn-cerrar-sidebar');

        // 1. Patrón Teleport: Crear el Backdrop pero inyectarlo en el Body,
        // fuera del contexto de este componente.
        this.backdrop = document.createElement('div');
        this.backdrop.id = 'vt-backdrop';
        this.backdrop.className = 'vt-backdrop';
        document.body.appendChild(this.backdrop); // Teleport!

        // Eventos de cierre
        this.backdrop.addEventListener('click', () => {
            estadoSidebar.patch({ abierto: false });
        });

        if ($btnCerrar) {
            $btnCerrar.addEventListener('click', () => {
                estadoSidebar.patch({ abierto: false });
            });
        }

        // Delegación de eventos para auto-cerrar en mobile
        $sidebar.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('a') || e.target.closest('button')) {
                if (window.innerWidth < 715) {
                    estadoSidebar.patch({ abierto: false });
                }
            }
        });

        // 2. Reactividad al Layout Store
        this.suscripcionSidebar = (estado) => {
            const { abierto } = estado;
            
            // Renderizado Condicional del botón cerrar (sólo en móviles y si está abierto)
            if ($btnCerrar) {
                const esMobile = window.innerWidth < 715;
                $btnCerrar.style.display = (abierto && esMobile) ? 'block' : 'none';
            }

            if (abierto) {
                $sidebar.classList.remove('sidebar-cerrado');
                this.backdrop.classList.add('open');
            } else {
                $sidebar.classList.add('sidebar-cerrado');
                this.backdrop.classList.remove('open');
            }
            this.aplicarTransform($sidebar, abierto);
        };
        estadoSidebar.suscribir(this.suscripcionSidebar);

        // 3. Reactividad a la Configuración (Derecha/Izquierda)
        this.suscripcionConfig = (config) => {
            const abierto = estadoSidebar.get().abierto;
            if (config.posicionMenu === 'right') {
                $sidebar.style.left = 'auto';
                $sidebar.style.right = '0';
            } else {
                $sidebar.style.left = '0';
                $sidebar.style.right = 'auto';
            }
            this.aplicarTransform($sidebar, abierto);
        };
        estadoConfiguracion.suscribir(this.suscripcionConfig);
    }

    aplicarTransform($sidebar, abierto) {
        const config = estadoConfiguracion.get();
        if (config.posicionMenu === 'right') {
            $sidebar.style.transform = !abierto ? 'translate(100%)' : 'translate(0)';
        } else {
            $sidebar.style.transform = !abierto ? 'translate(-100%)' : 'translate(0)';
        }
    }

    disconnectedCallback() {
        // Limpieza para evitar memory leaks (Componente Unmount)
        if (this.suscripcionSidebar) estadoSidebar.desuscribir(this.suscripcionSidebar);
        if (this.suscripcionConfig) estadoConfiguracion.desuscribir(this.suscripcionConfig);
        
        // Limpiar el teleport
        if (this.backdrop && this.backdrop.parentNode) {
            this.backdrop.parentNode.removeChild(this.backdrop);
        }
    }
}

customElements.define('mita-sidebar', MitaSidebar);
