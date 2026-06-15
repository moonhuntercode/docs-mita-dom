// @ts-check
import { Logger } from './logger.js';

export function iniciarViteErrorCatcher() {
    if (import.meta.env.DEV && import.meta.hot) {
        // Intercepta los errores de compilación y parseo que ocurren en Node (Vite Dev Server)
        import.meta.hot.on('vite:error', (payload) => {
            const err = payload.err;
            const message = `[Vite HMR Error] ${err.message}`;
            const stackTrace = `Fallo en: ${err.id || err.plugin || 'Desconocido'}\nLínea: ${err.loc?.line || 'N/A'}\nColumna: ${err.loc?.column || 'N/A'}\n\nDetalles:\n${err.frame || err.stack || JSON.stringify(err, null, 2)}`;
            
            Logger.error(message, { stackTrace });
        });
        
        Logger.info('🔌 Vite HMR Error Catcher inicializado. Listo para capturar errores de build en tiempo real.');
    }
}
