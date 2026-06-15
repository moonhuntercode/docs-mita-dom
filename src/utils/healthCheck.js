// @ts-check
import { Logger } from './logger.js';
import { registroRutas } from '../router/router.js';
import { DOCS_MAP } from '../componentes/mita-docs/docsRegistry.js';

/**
 * 🩺 Auditoría Silenciosa en Segundo Plano (Health Checker)
 * Recorre todas las rutas registradas y las valida sin afectar el DOM o la navegación actual.
 */
export async function runHealthCheck() {
    Logger.info('🩺 Iniciando Health Check en segundo plano...');
    
    let errores = 0;
    let exitos = 0;

    // 1. Auditar Componentes de Ruta
    for (const ruta of registroRutas) {
        if (ruta.lazy) {
            try {
                // Instanciamos el módulo (esto disparará descargas de red si es necesario)
                await ruta.lazy();
                Logger.info(`[Health Check] ✅ Ruta válida y accesible: ${ruta.path} (${ruta.tag})`);
                exitos++;
            } catch (error) {
                Logger.error(`[Health Check] ❌ Error crítico al cargar ruta: ${ruta.path}`, error.message);
                errores++;
            }
        } else {
            Logger.info(`[Health Check] ✅ Ruta Eager válida: ${ruta.path}`);
            exitos++;
        }
    }

    // 2. Auditar Documentos Markdown (basado en la petición del usuario de chequear /docs/filosofia)
    // Extraemos las rutas de navegación simulando la vista del usuario
    const docLinks = Array.from(document.querySelectorAll('a.btn-doc')).map(a => new URL(a.href).pathname);
    
    for (const pathname of docLinks) {
        if (pathname.startsWith('/docs/')) {
            const idDoc = pathname.split('/').pop()?.toLowerCase();
            if (idDoc && !DOCS_MAP[idDoc]) {
                Logger.error(`[Health Check] ❌ Documento 404 detectado en la navegación: ${pathname}`);
                errores++;
            } else {
                exitos++;
            }
        }
    }

    const total = exitos + errores;
    Logger.info(`🏁 Health Check Finalizado: ${exitos}/${total} rutas saludables. ${errores} errores detectados.`);
}
