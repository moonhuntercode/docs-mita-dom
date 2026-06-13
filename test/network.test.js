import { describe, it, expect, vi } from 'vitest';
import { networkService } from '../src/services/networkService.js';

describe('Network Service', () => {
    it('Debe inicializar con los valores del navegador', () => {
        const estado = networkService.estadoRed.get();
        expect(estado).toHaveProperty('online');
        expect(estado).toHaveProperty('tipoConexion');
    });

    it('esConexionLenta devuelve true si es 2g o slow-2g', () => {
        // Simular conexión lenta
        networkService.estadoRed.patch({ tipoConexion: '2g' });
        expect(networkService.esConexionLenta()).toBe(true);

        networkService.estadoRed.patch({ tipoConexion: 'slow-2g' });
        expect(networkService.esConexionLenta()).toBe(true);

        networkService.estadoRed.patch({ tipoConexion: '4g' });
        expect(networkService.esConexionLenta()).toBe(false);
    });
});
