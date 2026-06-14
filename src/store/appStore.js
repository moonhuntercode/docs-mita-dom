// @ts-check
import { Signal } from 'mita-dom';
import { Logger } from '../utils/logger.js';
import { IndexedDBAdapter } from '../utils/db.js';

/**
 * 🌐 Estado Global de la Aplicación (App Store)
 * Maneja estado de negocio (ej. usuario, visitas) aislado del tema.
 */
export const estadoAppGlobal = new Signal({ visitas: 0 }, {
    immutable: true, 
    persistKey: 'mita_estado_global', 
    storageAdapter: IndexedDBAdapter, // Persistencia asíncrona avanzada con IndexedDB
    onMutate: (newVal, oldVal) => {
        Logger.info(`[Telemetría] AppStore mutado de ${JSON.stringify(oldVal)} a ${JSON.stringify(newVal)}`);
    },
    guard: (newVal) => newVal.visitas >= 0 // Autorización: No permite visitas negativas
});

export function aumentarVisitas() {
    estadoAppGlobal.update((estado) => ({ ...estado, visitas: estado.visitas + 1 }));
}

export function disminuirVisitas() {
    estadoAppGlobal.update((estado) => ({ ...estado, visitas: estado.visitas - 1 }));
}

export function reiniciarVisitasGlobal() {
    estadoAppGlobal.reset();
}

if (import.meta.env.DEV) {
  estadoAppGlobal.suscribir((val) => Logger.signalUpdate('estadoAppGlobal', val));
}
