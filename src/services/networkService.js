// @ts-check
import { Signal } from 'mita-dom';

/**
 * 📡 Smart Network Service
 * Detecta si el navegador es moderno o antiguo,
 * evalúa si hay conexión, y audita la velocidad (4G, 3G, lenta).
 */
class NetworkService {
    constructor() {
        this.estadoRed = new Signal({
            online: navigator.onLine,
            tipoConexion: 'desconocido', // 4g, 3g, 2g, slow-2g
            esNavegadorAntiguo: !window.customElements // Heurística simple
        });

        this._iniciarListeners();
    }

    _iniciarListeners() {
        window.addEventListener('online', () => this._actualizarEstado());
        window.addEventListener('offline', () => this._actualizarEstado());
        
        // La API de conexión de red (Information API) no está en todos los navegadores
        if (navigator.connection) {
            navigator.connection.addEventListener('change', () => this._actualizarEstado());
        }
    }

    _actualizarEstado() {
        const conn = navigator.connection;
        this.estadoRed.patch({
            online: navigator.onLine,
            tipoConexion: conn ? conn.effectiveType : 'desconocido'
        });

        if (!navigator.onLine) {
            console.warn('[SmartNetwork] Estás desconectado. Entrando en Modo Offline.');
        } else if (conn && (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g')) {
            console.warn(`[SmartNetwork] Conexión Lenta detectada (${conn.effectiveType}). Desactivando animaciones pesadas.`);
        }
    }

    /**
     * @returns {boolean}
     */
    esConexionLenta() {
        const { tipoConexion } = this.estadoRed.get();
        return tipoConexion === '2g' || tipoConexion === 'slow-2g';
    }
}

export const networkService = new NetworkService();
