import { describe, it, expect, beforeEach } from 'vitest';
import { estadoAppGlobal, aumentarVisitas, disminuirVisitas, reiniciarVisitasGlobal } from '../src/store/appStore.js';
import { estadoTemaGlobal } from '../src/store/temaStore.js';

describe('App Stores', () => {
    beforeEach(() => {
        reiniciarVisitasGlobal();
    });

    it('estadoAppGlobal inicia con 0 visitas', () => {
        expect(estadoAppGlobal.get().visitas).toBe(0);
    });

    it('aumentarVisitas y disminuirVisitas funcionan correctamente', () => {
        aumentarVisitas();
        aumentarVisitas();
        expect(estadoAppGlobal.get().visitas).toBe(2);
        
        disminuirVisitas();
        expect(estadoAppGlobal.get().visitas).toBe(1);
    });

    it('El Guard bloquea visitas negativas', () => {
        reiniciarVisitasGlobal();
        disminuirVisitas();
        // Debería seguir en 0 porque el Guard no permite < 0
        expect(estadoAppGlobal.get().visitas).toBe(0);
    });

    it('estadoTemaGlobal debe iniciar en oscuro o claro', () => {
        const temaActual = estadoTemaGlobal.get();
        expect(['oscuro', 'claro']).toContain(temaActual);
    });
});
