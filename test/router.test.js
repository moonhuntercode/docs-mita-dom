import { describe, it, expect, vi, beforeEach } from 'vitest';
import { iniciarRouter } from '../src/router/router.js';
import { rutaActual } from 'mita-dom';
import { Logger } from '../src/utils/logger.js';

describe('Router Error Boundary', () => {
    beforeEach(() => {
        // Limpiar mocks para que no se filtre history del test anterior
        vi.clearAllMocks();
        
        // Limpiar DOM mock
        document.body.innerHTML = '';
        
        // Limpiar suscriptores del Signal global de rutas para evitar test pollution
        rutaActual.suscriptores.clear();

        // Mockear Logger.error
        vi.spyOn(Logger, 'error').mockImplementation(() => {});
    });

    it('debe registrar un error si el componente de la ruta no existe en el DOM', () => {
        // Solo inyectamos <demo-tarjeta> pero NO <demo-perfil>
        document.body.innerHTML = `
            <div id="vista-inicio"></div>
        `;
        
        // Iniciamos el router
        iniciarRouter();

        // Simulamos navegación a /perfil
        rutaActual.set('/perfil');

        // Verificamos que Logger.error haya sido llamado porque <demo-perfil> falta
        expect(Logger.error).toHaveBeenCalledWith(
            expect.stringContaining('[Error Boundary] Componente no encontrado en el Light DOM para la ruta: /perfil')
        );

        // Verificamos que se haya inyectado el Toast en el body
        const $toast = document.querySelector('.mita-error-toast');
        expect($toast).not.toBeNull();
        expect($toast.innerHTML).toContain('/perfil');
    });

    it('no debe registrar error si el componente sí existe', () => {
        // Inyectamos el componente
        document.body.innerHTML = `
            <div id="vista-inicio"></div>
            <demo-perfil></demo-perfil>
        `;
        
        iniciarRouter();
        rutaActual.set('/perfil');

        // Logger no debería reportar error para /perfil
        expect(Logger.error).not.toHaveBeenCalled();
        const $toast = document.querySelector('.mita-error-toast');
        expect($toast).toBeNull();
    });
});
