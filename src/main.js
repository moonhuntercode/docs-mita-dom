// @ts-check
/**
 * ----------------------------------------------------
 * 🚀 Punto de Entrada Principal (Entry Point)
 * ----------------------------------------------------
 * Siguiendo el principio de Separación de Responsabilidades (SoC),
 * este archivo ya no maneja lógica. Solo ensambla la aplicación.
 */

// 1. Estilos Globales
import './style.css';
import './markdown-styles.css';

// 2. Utilidades, Configuración y Error Boundary Global
import { Logger } from './utils/logger.js';
Logger.info('Arrancando SPA MitaDOM...');

window.addEventListener('error', (event) => {
  Logger.error(`Fallo crítico no controlado: ${event.message}`, event.error?.stack);
  // Aquí podríamos despachar una vista de caída global (Fallback UI)
});

window.addEventListener('unhandledrejection', (event) => {
  Logger.error(`Promesa rechazada no controlada: ${event.reason}`);
});

// 3. Inicialización del Router
import { iniciarRouter } from './router/router.js';
iniciarRouter();

// 4. Registro de Componentes UI (Light DOM)
// Al importarlos, los customElements se definen automáticamente
import './componentes/tarjeta/tarjeta.js';
import './componentes/formulario/formulario.js';
import './componentes/demo-shopping-list/demo-shopping-list.js';
import './componentes/mita-sidebar/mita-sidebar.js';
import './componentes/mita-profiler/mita-profiler.js';
import './componentes/mita-docs-nav/mita-docs-nav.js';
import './componentes/ui/mita-search.js';
import './componentes/layout/mita-header/mita-header.js';

