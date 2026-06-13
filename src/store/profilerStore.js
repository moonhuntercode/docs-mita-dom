// @ts-check
import { Signal } from 'mita-dom';

/**
 * 💾 Adaptador de DB Dinámico para el Profiler.
 * Permite cambiar la DB en el futuro (LocalStorage, IndexedDB, Firebase, etc).
 */
export const dbAdapter = {
    driver: localStorage, // Por defecto
    setDriver(newDriver) {
        this.driver = newDriver;
    },
    getItem(key) { return this.driver.getItem(key); },
    setItem(key, val) { return this.driver.setItem(key, val); },
    removeItem(key) { return this.driver.removeItem(key); }
};

/**
 * ⏱️ Estado del Mita Profiler (Métricas de Rendimiento)
 * Guarda las mediciones de performance en tiempo real y las persiste en la DB elegida.
 */
export const estadoProfiler = new Signal([], {
    persistKey: 'mita_profiler_metrics',
    storageAdapter: dbAdapter,
    immutable: false // Mantenemos false para parchear rápido el array
});

/**
 * Registra una medición de tiempo de render.
 * @param {string} componente Nombre del componente
 * @param {number} ms Tiempo en milisegundos
 */
export function registrarMetrica(componente, ms) {
    estadoProfiler.update(historial => {
        const nuevoHistorial = [...historial, { componente, ms, timestamp: Date.now() }];
        // Mantenemos solo las últimas 50 métricas para no llenar la DB
        if (nuevoHistorial.length > 50) nuevoHistorial.shift();
        return nuevoHistorial;
    });
}

/**
 * Cambia el límite de MS considerado como "Rojo" (lento).
 * 16.6ms = 60 FPS
 * 8.3ms = 120 FPS
 */
export const configuracionProfiler = new Signal({
    umbralRojo: 10.0, 
    umbralAmarillo: 5.0 
}, { persistKey: 'mita_profiler_config', storageAdapter: dbAdapter });
