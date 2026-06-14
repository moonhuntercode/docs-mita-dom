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
export const estadoProfiler = new Signal({
    renderizados: [],
    interacciones: []
}, {
    persistKey: 'mita_profiler_metrics_v2', // Nueva key para evitar conflictos con array viejo
    storageAdapter: dbAdapter,
    immutable: false // Mantenemos false para parchear rápido
});

/**
 * Registra una medición de tiempo de render.
 * @param {string} componente Nombre del componente
 * @param {number} ms Tiempo en milisegundos
 */
export function registrarMetrica(componente, ms) {
    estadoProfiler.update(estado => {
        const nuevoHistorial = [...estado.renderizados, { componente, ms, timestamp: Date.now() }];
        // Mantenemos solo las últimas 50 métricas
        if (nuevoHistorial.length > 50) nuevoHistorial.shift();
        return { ...estado, renderizados: nuevoHistorial };
    });
}

/**
 * Registra una medición de latencia de interacción (INP).
 * @param {string} componente Componente padre
 * @param {string} objetivo Descripción del elemento interactuado (ej. Botón ID)
 * @param {number} ms Tiempo de procesamiento
 */
export function registrarInteraccion(componente, objetivo, ms) {
    estadoProfiler.update(estado => {
        const nuevoHistorial = [...estado.interacciones, { componente, objetivo, ms, timestamp: Date.now() }];
        if (nuevoHistorial.length > 50) nuevoHistorial.shift();
        return { ...estado, interacciones: nuevoHistorial };
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
