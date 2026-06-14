import { MitaElement } from '../../utils/MitaElement.js';
import { Logger } from '../../utils/logger.js';
import { crearEstadoGlobal, crearEstadoLocal } from 'mita-dom';

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
        this.innerHTML = `
            <section class="tarjetas-grid">
                <!-- DEMO 1: ESTADO GLOBAL -->
                <div class="tarjeta-optimizada" style="background: var(--bg-secondary); border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden;">
                    <div class="tarjeta-optimizada">
                        <div class="tarjeta-header" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 1rem; color: white;">
                            <h2 style="margin: 0; font-size: 1.25rem;">🌍 Arquitectura de Estado Global</h2>
                        </div>
                        <div class="tarjeta-body" style="padding: 1rem;">
                            <p>Este componente reacciona a un <code>crearEstadoGlobal</code>. La persistencia mantiene los datos aunque recargues la página.</p>
                            <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                                <strong>Lectura Reactiva (Snapshot):</strong>
                                <pre style="margin: 0.5rem 0 0 0; overflow-x: auto;"><code id="codebase-global">...</code></pre>
                            </div>
                        </div>
                        <div class="tarjeta-actions" style="padding: 1rem; border-top: 1px solid var(--border-color); background: rgba(0,0,0,0.02);">
                            <button id="btn-mutar-global" class="btn-primario" style="width: 100%;">Simular Mutación Global (+1 Acceso)</button>
                        </div>
                    </div>
                </div>

                <!-- DEMO 2: RENDERIZADO CONDICIONAL Y FEEDBACK UI -->
                <div class="tarjeta-optimizada" style="background: var(--bg-secondary); border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden;">
                    <div class="tarjeta-optimizada">
                        <div class="tarjeta-header" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 1rem; color: white;">
                            <h2 style="margin: 0; font-size: 1.25rem;">🔀 Renderizado Condicional Avanzado</h2>
                        </div>
                        <div class="tarjeta-body" style="padding: 1rem;">
                            <p>Este componente simula un <code>fetch()</code> con Feedback visual (UX) y telemetría en Consola.</p>
                            
                            <!-- Contenedores de Feedback UI -->
                            <div id="ui-feedback" style="margin-top: 1rem; min-height: 50px;">
                                <div style="color: var(--text-secondary); text-align: center;">Esperando acción...</div>
                            </div>
                            
                            <div id="ui-contenido" style="display: none; background: var(--bg-tertiary); padding: 1rem; border-radius: 8px; margin-top: 1rem; overflow-x: auto;">
                            </div>
                        </div>
                        <div class="tarjeta-actions" style="display: flex; gap: 0.5rem; flex-wrap: wrap; padding: 1rem; border-top: 1px solid var(--border-color); background: rgba(0,0,0,0.02);">
                            <button id="btn-fetch-exito" class="btn-primario" style="flex: 1;">Cargar Datos (Éxito)</button>
                            <button id="btn-fetch-error" class="btn-peligro" style="flex: 1;">Cargar Datos (Fallo)</button>
                        </div>
                    </div>
                </div>
            </section>
        `;
        
        this.iniciarLogicaGlobal();
        this.iniciarLogicaCondicional();
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

    disconnectedCallback() {
        super.disconnectedCallback?.();
        // Prevención de Memory Leaks
        if (this.subGlobal) {
            demoGlobalState.desuscribir(this.subGlobal);
        }
        this.estadoRed.destroy();
    }
}

if (!customElements.get('demo-estados')) {
    customElements.define('demo-estados', DemoEstados);
}
