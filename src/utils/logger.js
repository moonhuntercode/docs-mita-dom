// @ts-check

/**
 * 🛠️ Utilidad de Logger Inteligente y Telemetría
 * En Modo Desarrollo: Imprime en consola con colores para el desarrollador.
 * En Modo Producción: Silencia la consola, pero envía los errores y métricas
 * "por debajo de la mesa" al servidor de telemetría para auditoría.
 */

import { registrarTelemetria } from '../store/telemetryStore.js';

const isDev = import.meta.env.DEV;

// Función asíncrona no bloqueante para delegar el guardado a la capa de abstracción
function persistirLog(nivel, mensaje, datosExtra) {
  // En producción podríamos ignorar los INFO si queremos ahorrar memoria
  if (nivel === 'INFO' && !isDev) return; 

  registrarTelemetria(nivel, mensaje, datosExtra && datosExtra.length ? datosExtra : null).catch(() => {});
}

export const Logger = {
  info: (mensaje, ...args) => {
    if (isDev) {
      console.log(`%c[INFO] ${mensaje}`, 'color: #00e676; font-weight: bold;', ...args);
    }
    persistirLog('INFO', mensaje, args);
  },
  
  warn: (mensaje, ...args) => {
    if (isDev) {
      console.warn(`%c[WARN] ${mensaje}`, 'color: #ffab00; font-weight: bold;', ...args);
    }
    persistirLog('WARN', mensaje, args);
  },
  
  error: (mensaje, ...args) => {
    // Los errores siempre se pintan y SIEMPRE se mandan a telemetría
    console.error(`%c[ERROR] ${mensaje}`, 'color: #ff5252; font-weight: bold;', ...args);
    persistirLog('ERROR', mensaje, args);
  },

  signalUpdate: (nombreSignal, valor) => {
    if (isDev) {
      console.groupCollapsed(`🔄 Signal Mutado: [${nombreSignal}]`);
      console.log('Nuevo valor:', valor);
      console.trace('Origen de la mutación');
      console.groupEnd();
    }
    // No enviamos mutaciones de estado a telemetría por privacidad y volumen,
  }
};

// ==========================================
// CAPTURA GLOBAL DE ERRORES EN EL NAVEGADOR
// ==========================================
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    Logger.error(`Fallo crítico no controlado: ${event.message}`, { stackTrace: event.error?.stack });
  });

  window.addEventListener('unhandledrejection', (event) => {
    Logger.error(`Promesa rechazada no controlada: ${event.reason}`, { stackTrace: event.reason?.stack || String(event.reason) });
  });
}
