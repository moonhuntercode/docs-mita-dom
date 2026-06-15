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
import { inicializarTelemetria } from './store/telemetryStore.js';
import { Logger } from './utils/logger.js';
import { checkMitaDomVersion } from './utils/versionChecker.js';
import { runHealthCheck } from './utils/healthCheck.js';
import { iniciarViteErrorCatcher } from './utils/viteErrorCatcher.js';

inicializarTelemetria();
checkMitaDomVersion();
iniciarViteErrorCatcher();
Logger.info('Arrancando SPA MitaDOM...');

// Ejecutar Auditoría Silenciosa después del arranque
setTimeout(() => runHealthCheck(), 3000);


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
import './componentes/ui/mita-code-editor.js';
import './componentes/layout/mita-header/mita-header.js';

