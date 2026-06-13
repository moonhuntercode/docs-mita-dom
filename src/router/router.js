// @ts-check
import { rutaActual } from 'mita-dom';
import { Logger } from '../utils/logger.js';
import { estadoDocActivo } from '../store/docsStore.js';

/**
 * 🧭 Router Inteligente SPA
 * Escucha los cambios de ruta del framework oficial y gestiona la visibilidad
 * de las "Páginas" principales del Light DOM.
 */

export function iniciarRouter() {
  Logger.info('Iniciando enrutador visual de MitaDOM...');

  // Catálogo de rutas permitidas mapeadas a sus componentes
  const componentesPorRuta = {
    '/': document.getElementById('vista-inicio'),
    '/perfil': document.querySelector('demo-perfil'),
    '/admin/logs': document.querySelector('demo-admin-logs'),
    '/blog': document.querySelector('mita-blog'),
    '/acerca': document.querySelector('demo-acerca'),
    '/configuracion': document.querySelector('demo-config')
  };

  const $mitaDocs = document.querySelector('mita-docs');
  const $error404 = document.querySelector('demo-404');
  
  // Configuración para URLPattern
  const patternDocs = new URLPattern({ pathname: '/docs/:id' });

  // 🛡️ Error Boundary: Verifica que el componente exista en el Light DOM
  function verificarComponente(ruta, $elemento) {
      if (!$elemento) {
          const errMsg = `[Error Boundary] Componente no encontrado en el Light DOM para la ruta: ${ruta}`;
          Logger.error(errMsg);
          
          // Mostrar Toast de Error UI para ayudar al DX (Developer Experience)
          const $toast = document.createElement('div');
          $toast.className = 'mita-error-toast';
          $toast.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#f44336;color:white;padding:1rem 1.5rem;border-radius:8px;z-index:9999;font-weight:bold;box-shadow:0 10px 30px rgba(0,0,0,0.3);animation:fade-in 0.3s;transition:opacity 0.3s;';
          $toast.innerHTML = `🚨 <b>Error Boundary (Router):</b><br>La ruta <code>${ruta}</code> no tiene un componente válido renderizado en <code>index.html</code>.`;
          document.body.appendChild($toast);
          
          setTimeout(() => {
              $toast.style.opacity = '0';
              setTimeout(() => $toast.remove(), 300);
          }, 6000);
      }
  }

  rutaActual.suscribir(ruta => {
    Logger.info(`Navegando a ruta: ${ruta}`);
    
    const matchDocs = patternDocs.exec({ pathname: ruta });
    const esSeccionDocs = !!matchDocs || ruta === '/docs' || ruta === '/docs/';

    // 1. Ocultar todos los componentes del Light DOM primero
    Object.values(componentesPorRuta).forEach($el => {
        if ($el) $el.style.display = 'none';
    });
    if ($mitaDocs) $mitaDocs.style.display = 'none';
    if ($error404) $error404.style.display = 'none';

    // 2. Mostrar el componente que corresponde a la ruta actual
    let rutaReconocida = false;

    if (esSeccionDocs) {
        rutaReconocida = true;
        verificarComponente('/docs', $mitaDocs);
        if ($mitaDocs) {
            $mitaDocs.style.display = 'block';
            if (matchDocs && matchDocs.pathname.groups.id) {
                estadoDocActivo.set(matchDocs.pathname.groups.id);
            } else {
                estadoDocActivo.set('readme');
            }
        }
    } else if (componentesPorRuta[ruta] !== undefined) {
        rutaReconocida = true;
        const $el = componentesPorRuta[ruta];
        verificarComponente(ruta, $el);
        if ($el) $el.style.display = 'block';
    }

    // 3. Catch-All: Detectar rutas no registradas (404)
    if (!rutaReconocida) {
        Logger.warn(`Ruta 404 interceptada: ${ruta}`);
        if ($error404) {
            $error404.style.display = 'block';
        } else {
            verificarComponente('404', $error404);
        }
    }
  });
}
