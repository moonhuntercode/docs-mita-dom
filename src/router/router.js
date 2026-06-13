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

  const $inicio = document.getElementById('vista-inicio');
  const $perfil = document.querySelector('demo-perfil');
  const $adminLogs = document.querySelector('demo-admin-logs');
  const $mitaDocs = document.querySelector('mita-docs');
  const $mitaBlog = document.querySelector('mita-blog');
  const $acerca = document.querySelector('demo-acerca');
  const $config = document.querySelector('demo-config');
  const $error404 = document.querySelector('demo-404');

    // Catálogo de rutas permitidas
    const rutasRegistradas = ['/', '/perfil', '/admin/logs', '/blog', '/acerca', '/configuracion'];
  
    // Configuración para URLPattern
    const patternDocs = new URLPattern({ pathname: '/docs/:id' });
  
    rutaActual.suscribir(ruta => {
      Logger.info(`Navegando a ruta: ${ruta}`);
      
      const matchDocs = patternDocs.exec({ pathname: ruta });
      const esSeccionDocs = !!matchDocs || ruta === '/docs' || ruta === '/docs/';
  
      if ($inicio) $inicio.style.display = (ruta === '/') ? 'block' : 'none';
      // @ts-ignore
      if ($perfil) $perfil.style.display = (ruta === '/perfil') ? 'block' : 'none';
      // @ts-ignore
      if ($adminLogs) $adminLogs.style.display = (ruta === '/admin/logs') ? 'block' : 'none';
      // @ts-ignore
      if ($mitaDocs) {
        $mitaDocs.style.display = esSeccionDocs ? 'block' : 'none';
        
        // Si entra a una subruta, actualizamos el estadoDocActivo para que <mita-docs> lo renderice
        if (matchDocs && matchDocs.pathname.groups.id) {
            estadoDocActivo.set(matchDocs.pathname.groups.id);
        } else if (ruta === '/docs' || ruta === '/docs/') {
            estadoDocActivo.set('readme'); // Fallback por defecto
        }
      }
      
      // @ts-ignore
      if ($mitaBlog) $mitaBlog.style.display = (ruta === '/blog') ? 'block' : 'none';
      // @ts-ignore
      if ($acerca) $acerca.style.display = (ruta === '/acerca') ? 'block' : 'none';
      // @ts-ignore
      if ($config) $config.style.display = (ruta === '/configuracion') ? 'block' : 'none';
  
      // B. Catch-All: Detectar rutas no registradas (404)
      if ($error404) {
        if (!rutasRegistradas.includes(ruta) && !esSeccionDocs) {
          Logger.warn(`Ruta 404 interceptada: ${ruta}`);
          $error404.style.display = 'block';
        } else {
          $error404.style.display = 'none';
        }
      }
    });
}
