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
import './componentes/perfil/perfil.js';
import './componentes/formulario/formulario.js';
import './componentes/404/404.js';
import './componentes/admin-logs/admin-logs.js';
import './componentes/mita-profiler/mita-profiler.js';
import './componentes/demo-shopping-list/demo-shopping-list.js';
import './componentes/mita-docs/mita-docs.js';
import './componentes/mita-docs-nav/mita-docs-nav.js';
import './componentes/mita-blog/mita-blog.js';
import './componentes/acerca/demo-acerca.js';
import './componentes/configuracion/demo-config.js';
import './componentes/demo-estados/demo-estados.js';
import './componentes/mita-sidebar/mita-sidebar.js';

// 5. Inicialización de la Interfaz Estática (Botón Tema y Menú Mobile)
import { estadoTemaGlobal } from './store/temaStore.js';
import { estadoSidebar } from './store/layoutStore.js';

function inicializarUIEstatica() {
  const $btnTema = document.getElementById('btn-tema');
  if ($btnTema) {
    $btnTema.addEventListener('click', () => {
      const nuevoTema = estadoTemaGlobal.value === 'oscuro' ? 'claro' : 'oscuro';
      estadoTemaGlobal.set(nuevoTema);
    });

    estadoTemaGlobal.suscribir(tema => {
      if (tema === 'claro') {
        document.body.classList.add('tema-claro');
        $btnTema.textContent = '🌙 Modo Oscuro';
      } else {
        document.body.classList.remove('tema-claro');
        $btnTema.textContent = '☀️ Modo Claro';
      }
    });
  }

  // --- Lógica del Menú Hamburguesa ---
  const $btnMenu = document.getElementById('btn-menu-mobile');
  
  if ($btnMenu) {
    $btnMenu.addEventListener('click', () => {
      // Toggle a través de Signal
      const abierto = estadoSidebar.get().abierto;
      estadoSidebar.patch({ abierto: !abierto });
    });

    // Cierre con Escape global
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && estadoSidebar.get().abierto) {
        estadoSidebar.patch({ abierto: false });
      }
    });
  }
}

inicializarUIEstatica();
