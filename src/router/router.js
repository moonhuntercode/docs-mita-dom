// @ts-check
import { rutaActual } from 'mita-dom';
import { Logger } from '../utils/logger.js';
import { estadoDocActivo } from '../store/docsStore.js';

/**
 * 🧭 Advanced Router SPA (Lazy Loading, Guards, Scroll Behavior)
 * Controla la inyección dinámica de componentes para soportar Code Splitting.
 */

export function iniciarRouter() {
  Logger.info('Iniciando enrutador avanzado MitaDOM (Lazy Loading Activado)...');

  const $appContainer = document.getElementById('app-container');

  // Registro de Rutas (inspirado en Vue Router)
  const registroRutas = [
    { path: '/', tag: 'vista-inicio', isEager: true }, // Ya está en index.html
    { path: '/perfil', tag: 'demo-perfil', lazy: () => import('../componentes/perfil/perfil.js'), layout: 'mita-layout-dashboard' },
    { path: '/admin/logs', tag: 'demo-admin-logs', lazy: () => import('../componentes/admin-logs/admin-logs.js'), meta: { requiresAuth: true }, layout: 'mita-layout-dashboard' },
    { path: '/blog', tag: 'mita-blog', lazy: () => import('../componentes/mita-blog/mita-blog.js') },
    { path: '/acerca', tag: 'demo-acerca', lazy: () => import('../componentes/acerca/demo-acerca.js') },
    { path: '/configuracion', tag: 'demo-config', lazy: () => import('../componentes/configuracion/demo-config.js') },
    { path: '/estados', tag: 'demo-estados', lazy: () => import('../componentes/demo-estados/demo-estados.js') },
    { path: '/docs', tag: 'mita-docs', lazy: () => import('../componentes/mita-docs/mita-docs.js') },
    { path: '/performance', tag: 'demo-performance', lazy: () => import('../componentes/demo-performance/demo-performance.js') }
  ];

  // Caché de elementos instanciados para no recrearlos
  const vistasInstanciadas = {
    '/': document.getElementById('vista-inicio')
  };

  // Configuración para rutas dinámicas (Ej: /docs/:id)
  const patternDocs = new URLPattern({ pathname: '/docs/:id' });

  // Función para obtener/inyectar vista
  async function montarVista(rutaBase, config) {
    if (vistasInstanciadas[rutaBase]) {
      return vistasInstanciadas[rutaBase];
    }
    
    // Lazy Loading: Resolvemos la promesa de importación (Code Splitting)
    if (config.lazy) {
      Logger.info(`[Router] Lazy Loading Chunk: ${config.tag}`);
      try {
        await config.lazy(); 
      } catch (err) {
        Logger.error(`[Router] Fallo de red al cargar el chunk ${config.tag}:`, err);
        return null; // El componente no pudo ser descargado
      }
    }

    // El import ejecuta customElements.define, ahora podemos crear el Tag
    const $el = document.createElement(config.tag);
    
    // Si la ruta define un Layout, lo inyectamos dentro del Layout (Slot)
    if (config.layout) {
      let $layout = document.querySelector(config.layout);
      if (!$layout) {
        // Importamos el layout dinámicamente si no existe (Code Splitting para Layouts)
        await import(`../componentes/layout/${config.layout}.js`);
        $layout = document.createElement(config.layout);
        $layout.style.display = 'none'; // Se mostrará más abajo
        $appContainer.appendChild($layout);
      }
      $layout.appendChild($el);
    } else {
      $appContainer.appendChild($el);
    }

    vistasInstanciadas[rutaBase] = $el;
    
    return $el;
  }

  rutaActual.suscribir(async (ruta) => {
    Logger.info(`Navegando a ruta: ${ruta}`);
    
    // --- 0. TELEMETRÍA INICIAL ---
    const inicioRenderizado = performance.now();
    Logger.info(`[Router] Intentando renderizar ruta solicitada: ${ruta}...`);

    // --- 1. MATCH DE RUTAS Y PARÁMETROS ---
    let matchDocs = patternDocs.exec({ pathname: ruta });
    let rutaFisica = matchDocs ? '/docs' : ruta; // Normalizar
    if (ruta === '/docs/') rutaFisica = '/docs'; // Normalización estricta
    
    // Normalización de Nested Routes (Outlets)
    if (ruta.startsWith('/perfil')) rutaFisica = '/perfil';
    
    const configRuta = registroRutas.find(r => r.path === rutaFisica);

    // --- 2. NAVIGATION GUARDS ---
    if (configRuta && configRuta.meta && configRuta.meta.requiresAuth) {
      // Simulación de token/guard
      const isAuthenticated = localStorage.getItem('mita_token') === 'true'; // false por defecto
      if (!isAuthenticated) {
        Logger.warn(`[Router Guard] Acceso denegado a ${ruta}. Redirigiendo a /perfil`);
        alert("🛡️ MitaDOM Guard: Necesitas estar autenticado para ver Logs. Visita perfil.");
        import('mita-dom').then(m => m.navegarA('/perfil'));
        return; // Interceptamos y cortamos la carga
      }
    }

    // --- RENDERIZADO CONDICIONAL Y CATCH-ALL ---
    if (!configRuta) {
      const tiempoTomado = (performance.now() - inicioRenderizado).toFixed(1);
      Logger.warn(`[Router] ❌ Ruta 404 (No existe en el catálogo): ${ruta}. Mostrando Fallback. (Tomó ${tiempoTomado}ms)`);
      const fallbackConfig = { tag: 'demo-404', lazy: () => import('../componentes/404/404.js') };
      const $error404 = await montarVista('/404', fallbackConfig);
      
      const mostrar404 = () => {
        Object.values(vistasInstanciadas).forEach($el => {
          if ($el) {
            $el.style.display = 'none';
            if ($el.parentElement && $el.parentElement.id !== 'app-container') {
              $el.parentElement.style.display = 'none';
            }
          }
        });
        if ($error404) $error404.style.display = 'block';
      };

      if (document.startViewTransition) document.startViewTransition(() => mostrar404());
      else mostrar404();
      
      return;
    }

    // Montamos la vista solicitada (Eager o Lazy)
    const $vistaActiva = await montarVista(rutaFisica, configRuta);
    
    // Si hubo un error de red cargando el chunk, abortamos
    if (!$vistaActiva) {
      Logger.error(`[Router] ❌ Error Crítico: No se pudo instanciar la vista '${configRuta.tag}'. Verifique la red o el código del componente.`);
      alert("Error de conexión: No se pudo cargar esta sección. Verifica tu internet.");
      return;
    }
    
    // --- 3. ACTUALIZACIÓN DEL DOM (Con View Transitions API) ---
    const actualizarDOM = () => {
      // 3.1 Limpiar vistas y layouts activos
      Object.values(vistasInstanciadas).forEach($el => {
        if ($el) {
          $el.style.display = 'none';
          if ($el.parentElement && $el.parentElement.id !== 'app-container') {
            $el.parentElement.style.display = 'none';
          }
        }
      });

      // 3.2 Mostrar la nueva vista
      $vistaActiva.style.display = 'block';
      
      // Si la vista está dentro de un Layout, mostramos también el Layout
      if ($vistaActiva.parentElement && $vistaActiva.parentElement.id !== 'app-container') {
        $vistaActiva.parentElement.style.display = 'grid'; // Grid para el layout dashboard
      }
    };

    // Usar la API nativa de transiciones si está disponible (Navegación Fluida 60fps)
    if (document.startViewTransition) {
      document.startViewTransition(() => actualizarDOM());
    } else {
      actualizarDOM();
    }

    // Data Fetching / Loaders: Si es Docs, inyectamos el estado
    if (rutaFisica === '/docs') {
      if (matchDocs && matchDocs.pathname.groups.id) {
          estadoDocActivo.set(matchDocs.pathname.groups.id);
      } else {
          estadoDocActivo.set('readme');
      }
    }

    // --- 5. SCROLL BEHAVIOR ---
    // Emula el scroll nativo al inicio de página al cambiar de vista
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // --- 6. TELEMETRÍA DE ÉXITO ---
    const tiempoFinal = (performance.now() - inicioRenderizado).toFixed(1);
    console.log(`%c[Router] ✅ Vista '${configRuta.tag}' renderizada exitosamente en ${tiempoFinal}ms`, 'color: #10b981; font-weight: bold;');
  });
}
