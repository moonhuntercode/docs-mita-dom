// @ts-check

/**
 * 🔌 Capa de Abstracción de Base de Datos (Adapter Pattern)
 * Esto garantiza Escalabilidad: Si el día de mañana el cliente quiere
 * cambiar IndexedDB por Firebase o un Backend propio, solo creamos un 
 * nuevo Adapter y lo inyectamos, sin modificar el resto de la aplicación.
 */

class IndexedDBAdapter {
  constructor() {
    this.dbName = 'MitaAuditoriaDB';
    this.dbVersion = 1;
    this.storeName = 'logs';
  }

  /**
   * Inicializa la conexión a la base de datos IndexedDB
   * @returns {Promise<IDBDatabase>}
   */
  async _getDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        // @ts-ignore
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          // Creamos la tabla 'logs' con llave autoincremental
          const store = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
          // Índices para búsquedas rápidas
          store.createIndex('nivel', 'nivel', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        // @ts-ignore
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        // @ts-ignore
        reject(event.target.error);
      };
    });
  }

  async save(logEntry) {
    try {
      const db = await this._getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.add(logEntry);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(false);
      });
    } catch (e) {
      console.warn('Fallo guardando en IndexedDB', e);
      return false;
    }
  }

  async getAll() {
    try {
      const db = await this._getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject([]);
      });
    } catch {
      return [];
    }
  }

  /**
   * Limpia todos los registros de la tabla (CRUD: Delete All)
   */
  async clearAll() {
    try {
      const db = await this._getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.clear();

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(false);
      });
    } catch (e) {
      console.error('Fallo al limpiar IndexedDB', e);
      return false;
    }
  }
}

// 🌐 Instancia Global del Servicio Activo
// Si el cliente pide Firebase, simplemente hacemos: export const logService = new FirebaseAdapter();
export const logService = new IndexedDBAdapter();
