// @ts-check
import { Signal } from 'mita-dom';
import { IndexedDBAdapter } from '../utils/db.js';
import { Logger } from '../utils/logger.js';

export const estadoTemaGlobal = new Signal('oscuro', {
  persistKey: 'tema-mita',
  storageAdapter: IndexedDBAdapter
});

estadoTemaGlobal.suscribir((temaActual) => {
  if (import.meta.env.DEV) {
    Logger.signalUpdate('estadoTemaGlobal', temaActual);
  }
  
  if (temaActual === 'claro') {
    document.body.classList.add('tema-claro');
  } else {
    document.body.classList.remove('tema-claro');
  }
});
