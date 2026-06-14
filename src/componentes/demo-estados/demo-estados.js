import { MitaElement } from '../../utils/MitaElement.js';
import { Logger } from '../../utils/logger.js';
import { crearEstadoGlobal, crearEstadoLocal } from 'mita-dom';
import '../ui/mita-dialog.js';

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
                
                <!-- DEMO 3: SINCRONIZACIÓN MULTI-COMPONENTE Y CRUD -->
                <div class="tarjeta-optimizada" style="grid-column: 1 / -1; background: var(--bg-secondary); border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden;">
                    <div class="tarjeta-header" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 1rem; color: white;">
                        <h2 style="margin: 0; font-size: 1.25rem;">🔄 Demo 3: Sincronización Multi-Componente (CRUD)</h2>
                        <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;">Dos Cajas independientes leyendo y mutando el mismo Estado Global simultáneamente, sin props ni Virtual DOM.</p>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; padding: 1rem;">
                        <!-- CAJA A -->
                        <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: 8px; border: 1px solid rgba(59, 130, 246, 0.3);">
                            <h3 style="margin-top: 0; color: #3b82f6;">📦 Componente A</h3>
                            <pre style="background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 4px; overflow-x: auto; min-height: 120px;"><code id="caja-a-code">...</code></pre>
                            
                            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;">
                                <button id="btn-crear-a" class="btn-primario" style="flex: 1; font-size: 0.8rem;">Crear/Reset</button>
                                <button id="btn-update-a" class="btn-secundario" style="flex: 1; font-size: 0.8rem;">+1 Accesos</button>
                                <button id="btn-borrar-a" class="btn-peligro" style="flex: 1; font-size: 0.8rem;">Borrar Acc.</button>
                            </div>
                        </div>

                        <!-- CAJA B -->
                        <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: 8px; border: 1px solid rgba(168, 85, 247, 0.3);">
                            <h3 style="margin-top: 0; color: #a855f7;">📦 Componente B</h3>
                            <pre style="background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 4px; overflow-x: auto; min-height: 120px;"><code id="caja-b-code">...</code></pre>
                            
                            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;">
                                <button id="btn-crear-b" class="btn-primario" style="flex: 1; font-size: 0.8rem; background: #a855f7;">Crear/Reset</button>
                                <button id="btn-update-b" class="btn-secundario" style="flex: 1; font-size: 0.8rem;">Modificar Msg</button>
                                <button id="btn-borrar-b" class="btn-peligro" style="flex: 1; font-size: 0.8rem;">Vaciar Msg</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- DEMO 4: COMPONENTES UI NATIVOS (Dialog) -->
                <div class="tarjeta-optimizada" style="grid-column: 1 / -1; background: var(--bg-secondary); border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden; margin-top: 2rem;">
                    <div class="tarjeta-header" style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); padding: 1rem; color: white;">
                        <h2 style="margin: 0; font-size: 1.25rem;">🪟 Demo 4: UI Nativa con &lt;mita-dialog&gt;</h2>
                        <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;">Demostración del elemento HTML5 &lt;dialog&gt; controlado reactivamente por Signals de MitaDOM.</p>
                    </div>
                    
                    <div style="padding: 1.5rem; display: flex; gap: 1rem; flex-wrap: wrap;">
                        <button id="btn-abrir-modal-basico" class="btn-primario">Abrir Modal Básico</button>
                        <button id="btn-abrir-modal-estricto" class="btn-secundario" style="background: #ef4444; border-color: #dc2626;">Abrir Modal Estricto</button>
                    </div>

                    <!-- Modal Básico (Cierra con click afuera o ESC) -->
                    <mita-dialog id="modal-basico">
                        <span slot="titulo">💡 Modal Accesible Nativo</span>
                        <p>Este modal usa la API <code>&lt;dialog&gt;</code> de HTML5. Intenta presionar la tecla <strong>ESC</strong> o hacer clic en el fondo oscuro para cerrarlo sin usar JavaScript explícito.</p>
                        <div slot="footer" style="text-align: right;">
                            <button id="btn-entendido" class="btn-primario">¡Entendido!</button>
                        </div>
                    </mita-dialog>

                    <!-- Modal Estricto (Bloquea ESC y click afuera) -->
                    <mita-dialog id="modal-estricto" estricto>
                        <span slot="titulo">⚠️ Modal Estricto</span>
                        <p>Al pasarle el atributo <code>estricto</code>, el componente bloquea el cierre por ESC o clic afuera usando eventos nativos (<code>e.preventDefault()</code>). Debes responder obligatoriamente a la pregunta para continuar.</p>
                        <p><strong>¿Aceptas los Términos y Condiciones?</strong></p>
                        <div slot="footer" style="display: flex; gap: 1rem; justify-content: flex-end;">
                            <button id="btn-rechazar" class="btn-peligro">Rechazar</button>
                            <button id="btn-aceptar" class="btn-primario">Aceptar</button>
                        </div>
                    </mita-dialog>
                </div>
            </section>
        `;
        
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
