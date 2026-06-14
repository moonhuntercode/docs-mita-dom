import { describe, it, expect, vi, beforeEach } from 'vitest';
import { iniciarRouter } from '../src/router/router.js';
import { rutaActual } from 'mita-dom';
import { Logger } from '../src/utils/logger.js';

describe('Advanced Router (Lazy Loading & Guards)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        
        // Mock DOM Structure
        document.body.innerHTML = `
            <div id="app-container">
              <div id="vista-inicio"></div>
            </div>
        `;
        
        rutaActual.suscriptores.clear();
        vi.spyOn(Logger, 'warn').mockImplementation(() => {});
        vi.spyOn(Logger, 'info').mockImplementation(() => {});
        localStorage.clear();
        
        // Mock window.scrollTo
        window.scrollTo = vi.fn();
    });

    it('Navigation Guard: Bloquea el acceso a /admin/logs si no hay token', async () => {
        // Redefinimos alert para que no trabe el test
        window.alert = vi.fn();
        
        iniciarRouter();

        // Simulamos navegación a una ruta protegida sin token en localStorage
        await rutaActual.set('/admin/logs');

        expect(Logger.warn).toHaveBeenCalledWith(
            expect.stringContaining('[Router Guard] Acceso denegado a /admin/logs')
        );
        expect(window.alert).toHaveBeenCalled();
        
        // No se debe haber inyectado la vista admin
        const $admin = document.querySelector('demo-admin-logs');
        expect($admin).toBeNull();
    });

    it('Navigation Guard: Permite el acceso a /admin/logs si HAY token', async () => {
        localStorage.setItem('mita_token', 'true');
        window.alert = vi.fn();
        
        iniciarRouter();

        rutaActual.set('/admin/logs');
        await new Promise(r => setTimeout(r, 50));

        // El Guard NO debe haberse disparado (no redirige a perfil)
        expect(Logger.warn).not.toHaveBeenCalledWith(
            expect.stringContaining('[Router Guard] Acceso denegado a /admin/logs')
        );
        
        // Se debe haber intentado cargar el chunk diferido
        expect(Logger.info).toHaveBeenCalledWith(
            expect.stringContaining('[Router] Lazy Loading Chunk: demo-admin-logs')
        );
    });
});
