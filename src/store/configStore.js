import { Signal } from 'mita-dom';

// Estado global con Persistencia Nativa
export const estadoConfiguracion = new Signal({
  posicionMenu: 'left' // 'left' o 'right'
}, {
  persistKey: 'mita_spa_config' // Se guarda en localStorage/IndexedDB automáticamente
});
