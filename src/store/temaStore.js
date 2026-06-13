// @ts-check
import { Signal } from 'mita-dom';
import { Logger } from '../utils/logger.js';

/**
 * 🎨 Estado Global del Tema (Tema Store)
 * Responsabilidad Única: Manejar el Tema Oscuro/Claro.
 */
const temaInicial = localStorage.getItem('mita-tema') || 'oscuro';
export const estadoTemaGlobal = new Signal(temaInicial);

if (import.meta.env.DEV) {
  estadoTemaGlobal.suscribir((val) => Logger.signalUpdate('estadoTemaGlobal', val));
}
