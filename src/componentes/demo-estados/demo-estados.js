import { MitaElement } from '../../utils/MitaElement.js';
import { Logger } from '../../utils/logger.js';
import { crearEstadoGlobal, crearEstadoLocal } from 'mita-dom';
import '../ui/mita-dialog.js';
import htmlTemplate from './demo-estados.html?raw';

// 1. Estado Global Dedicado (Simulando un Store de Sesión)
export const demoGlobalState = crearEstadoGlobal({
    accesos: 0,
    ultimaAccion: 'Ninguna'
}, { persistKey: 'demo_global_state' });

// 2. Componente de Demostración
export class DemoEstados extends MitaElement {
    constructor() {
        super();
        // Estado Local para Renderizado Condicional de Red simulada
        this.estadoRed = crearEstadoLocal({
            cargando: false,
            error: null,
            datos: null
        });
    }

    async render() {
        this.innerHTML = htmlTemplate;
        
        this.iniciarLogicaGlobal();
        this.iniciarLogicaCondicional();
        this.iniciarSincronizacionMultiComponente();
        this.iniciarLogicaModal();
    }

    iniciarLogicaGlobal() {
        const $codebase = this.querySelector('#codebase-global');
        const $btnMutar = this.querySelector('#btn-mutar-global');

        // Suscripción al Estado Global
        this.subGlobal = (estado) => {
            $codebase.textContent = JSON.stringify(estado, null, 2);
            Logger.info('Estado global actualizado:', estado);
        };
        demoGlobalState.suscribir(this.subGlobal);

        // Mutación del Estado Global
        $btnMutar.addEventListener('click', () => {
            const actual = demoGlobalState.get();
            demoGlobalState.patch({
                accesos: actual.accesos + 1,
                ultimaAccion: `Click a las ${new Date().toLocaleTimeString()}`
            });
        });
    }

    iniciarLogicaCondicional() {
        const $feedback = this.querySelector('#ui-feedback');
        const $contenido = this.querySelector('#ui-contenido');
        const $btnExito = this.querySelector('#btn-fetch-exito');
        const $btnError = this.querySelector('#btn-fetch-error');

        // Renderizado Reactivo basado en el estado
        this.estadoRed.suscribir(estado => {
            if (estado.cargando) {
                Logger.info('Iniciando fetch simulado... Mostrando Spinner UI.');
                $feedback.innerHTML = '<div style="text-align:center; padding: 1rem;">⏳ Cargando datos desde el servidor...</div>';
                $contenido.style.display = 'none';
            } else if (estado.error) {
                Logger.error('Fetch simulado falló.', estado.error);
                $feedback.innerHTML = `<div style="color: #ef4444; background: #fee2e2; padding: 1rem; border-radius: 8px; text-align:center;">❌ Error: ${estado.error}</div>`;
                $contenido.style.display = 'none';
            } else if (estado.datos) {
                Logger.info('Fetch simulado exitoso. Renderizando DOM.');
                $feedback.innerHTML = '';
                $contenido.style.display = 'block';
                $contenido.innerHTML = `<strong>Respuesta del Servidor:</strong><pre>${JSON.stringify(estado.datos, null, 2)}</pre>`;
            } else {
                $feedback.innerHTML = '<div style="color: var(--text-secondary); text-align: center;">Esperando acción...</div>';
                $contenido.style.display = 'none';
            }
        });

        // Simular éxito
        $btnExito.addEventListener('click', () => {
            this.estadoRed.patch({ cargando: true, error: null, datos: null });
            setTimeout(() => {
                this.estadoRed.patch({ cargando: false, datos: { id: 1, mensaje: '¡Datos recibidos con éxito!' } });
            }, 1500);
        });

        // Simular error
        $btnError.addEventListener('click', () => {
            this.estadoRed.patch({ cargando: true, error: null, datos: null });
            setTimeout(() => {
                this.estadoRed.patch({ cargando: false, error: 'Timeout 504 Gateway' });
            }, 1500);
        });
    }

    iniciarSincronizacionMultiComponente() {
        const $codeA = this.querySelector('#caja-a-code');
        const $codeB = this.querySelector('#caja-b-code');

        // Suscripción de Caja A
        this.subA = (estado) => {
            $codeA.textContent = JSON.stringify(estado, null, 2);
        };
        // Suscripción de Caja B
        this.subB = (estado) => {
            $codeB.textContent = JSON.stringify(estado, null, 2);
        };
        
        demoGlobalState.suscribir(this.subA);
        demoGlobalState.suscribir(this.subB);

        // CRUD CAJA A
        this.querySelector('#btn-crear-a').addEventListener('click', () => {
            demoGlobalState.set({ accesos: 0, ultimaAccion: 'Reset desde A' });
        });
        this.querySelector('#btn-update-a').addEventListener('click', () => {
            const actual = demoGlobalState.get();
            if (actual.accesos !== undefined) {
                demoGlobalState.patch({ accesos: actual.accesos + 1, ultimaAccion: 'Update desde A' });
            }
        });
        this.querySelector('#btn-borrar-a').addEventListener('click', () => {
            const actual = demoGlobalState.get();
            const nuevo = { ...actual };
            delete nuevo.accesos;
            nuevo.ultimaAccion = 'Borrado desde A';
            demoGlobalState.set(nuevo);
        });

        // CRUD CAJA B
        this.querySelector('#btn-crear-b').addEventListener('click', () => {
            demoGlobalState.set({ accesos: 0, ultimaAccion: 'Reset desde B' });
        });
        this.querySelector('#btn-update-b').addEventListener('click', () => {
            demoGlobalState.patch({ ultimaAccion: 'HOLA MUNDO desde B' });
        });
        this.querySelector('#btn-borrar-b').addEventListener('click', () => {
            const actual = demoGlobalState.get();
            const nuevo = { ...actual };
            delete nuevo.ultimaAccion;
            demoGlobalState.set(nuevo);
        });
    }
    iniciarLogicaModal() {
        // Modal Básico
        const $btnAbrirBasico = this.querySelector('#btn-abrir-modal-basico');
        const $modalBasico = this.querySelector('#modal-basico');
        const $btnEntendido = this.querySelector('#btn-entendido');

        $btnAbrirBasico.addEventListener('click', () => $modalBasico.abrir());
        $btnEntendido.addEventListener('click', () => $modalBasico.cerrar());

        // Modal Estricto
        const $btnAbrirEstricto = this.querySelector('#btn-abrir-modal-estricto');
        const $modalEstricto = this.querySelector('#modal-estricto');
        const $btnAceptar = this.querySelector('#btn-aceptar');
        const $btnRechazar = this.querySelector('#btn-rechazar');

        $btnAbrirEstricto.addEventListener('click', () => $modalEstricto.abrir());
        
        $btnAceptar.addEventListener('click', () => {
            alert("Has aceptado los términos.");
            $modalEstricto.cerrar();
        });
        
        $btnRechazar.addEventListener('click', () => {
            alert("No puedes continuar sin aceptar.");
            $modalEstricto.cerrar(); // En un caso real podrías redirigir
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback?.();
        // Prevención de Memory Leaks
        if (this.subGlobal) {
            demoGlobalState.desuscribir(this.subGlobal);
            demoGlobalState.desuscribir(this.subA);
            demoGlobalState.desuscribir(this.subB);
        }
        this.estadoRed.destroy();
    }
}

if (!customElements.get('demo-estados')) {
    customElements.define('demo-estados', DemoEstados);
}
