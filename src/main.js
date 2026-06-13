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

// 5. Inicialización de la Interfaz Estática (Botón Tema y Menú Mobile)
import { estadoTemaGlobal } from './store/temaStore.js';
import { estadoConfiguracion } from './store/configStore.js';

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
  const $sidebar = document.getElementById('sidebar');
  const $backdrop = document.getElementById('vt-backdrop');
  
  if ($btnMenu && $sidebar && $backdrop) {
    const aplicarTransform = (cerrado) => {
      const config = estadoConfiguracion.get();
      if (config.posicionMenu === 'right') {
        $sidebar.style.transform = cerrado ? 'translate(100%)' : 'translate(0)';
      } else {
        $sidebar.style.transform = cerrado ? 'translate(-100%)' : 'translate(0)';
      }
    };

    const cerrarMenu = () => {
      $sidebar.classList.add('sidebar-cerrado');
      $backdrop.classList.remove('open');
      aplicarTransform(true);
    };

    const abrirMenu = () => {
      $sidebar.classList.remove('sidebar-cerrado');
      $backdrop.classList.add('open');
      aplicarTransform(false);
    };

    $btnMenu.addEventListener('click', () => {
      const estaCerrado = $sidebar.classList.contains('sidebar-cerrado');
      if (estaCerrado) abrirMenu();
      else cerrarMenu();
    });

    // Cierre con Backdrop
    $backdrop.addEventListener('click', cerrarMenu);

    // Cierre con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !$sidebar.classList.contains('sidebar-cerrado')) {
        cerrarMenu();
      }
    });

    // Autocerrar el menú si hacemos click en cualquier link de la navegación (Solo en mobile)
    // Usamos event delegation en el sidebar para pillar también botones dinámicos (mita-docs-nav)
    $sidebar.addEventListener('click', (e) => {
      // Si el click fue en un ancla o botón
      if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('a') || e.target.closest('button')) {
        if (window.innerWidth < 768) {
          cerrarMenu();
        }
      }
    });

    // Lógica dinámica de posición del Menú Móvil (Izquierda / Derecha)
    estadoConfiguracion.suscribir(config => {
      if (config.posicionMenu === 'right') {
        $sidebar.style.left = 'auto';
        $sidebar.style.right = '0';
        // Ajustar la dirección de transformación
        $sidebar.style.transform = $sidebar.classList.contains('sidebar-cerrado') ? 'translate(100%)' : 'translate(0)';
      } else {
        $sidebar.style.left = '0';
        $sidebar.style.right = 'auto';
        $sidebar.style.transform = $sidebar.classList.contains('sidebar-cerrado') ? 'translate(-100%)' : 'translate(0)';
      }
    });
  }
}

inicializarUIEstatica();
