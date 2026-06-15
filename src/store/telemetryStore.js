// @ts-check
import { crearEstadoGlobal } from 'mita-dom';
import { logService } from '../services/logService.js';

/**
 * 📡 Estado Global de Telemetría
 * Mantiene la lista de logs cargados en memoria y expone métodos para añadir.
 */
export const telemetryStore = crearEstadoGlobal({
    logs: []
});

/**
 * Carga inicial de todos los logs desde IndexedDB hacia la memoria.
 */
export async function inicializarTelemetria() {
    const logs = await logService.getAll();
    telemetryStore.set({ logs: logs.reverse() }); // Más recientes primero
}

/**
 * Agrega un log, lo guarda en IndexedDB, y muta el store.
 */
export async function registrarTelemetria(nivel, mensaje, datosExtra = null) {
    let stackTrace = null;
    
    // Si datosExtra es un arreglo de args y contiene un objeto con stackTrace, lo extraemos
    if (Array.isArray(datosExtra)) {
        const objConStack = datosExtra.find(d => d && typeof d === 'object' && d.stackTrace);
        if (objConStack) {
            stackTrace = objConStack.stackTrace;
            // Limpiamos el stackTrace de los datos extra para no duplicar info
            datosExtra = datosExtra.filter(d => d !== objConStack);
            if (datosExtra.length === 0) datosExtra = null;
        }
    }

    const logEntry = {
        // En IndexedDB, la ID se genera automáticamente. 
        // Agregamos un hash o ID único por si necesitamos borrarlo después.
        idLocal: Date.now() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        nivel,
        mensaje,
        stackTrace,
        datosExtra,
        url: window.location.href,
        userAgent: navigator.userAgent
    };

    // Guardar en persistencia
    await logService.save(logEntry);

    // Actualizar estado en memoria reactivamente con un límite (Ej: max 1000)
    telemetryStore.update(estado => {
        estado.logs = [logEntry, ...estado.logs];
        if (estado.logs.length > 1000) {
            estado.logs.pop(); // Removemos el más viejo de memoria
        }
        return estado;
    });
}

/**
 * Elimina un log individual
 */
export async function eliminarLog(idLocal) {
    await logService.deleteByLocalId(idLocal);
    telemetryStore.update(estado => {
        estado.logs = estado.logs.filter(l => l.idLocal !== idLocal);
        return estado;
    });
}

/**
 * Limpia la telemetría (memoria y persistencia).
 */
export async function limpiarTelemetria() {
    await logService.clearAll();
    telemetryStore.set({ logs: [] });
}
