import { describe, it, expect, vi } from 'vitest';
import { MitaElement } from '../src/utils/MitaElement.js';

describe('Rendimiento y Profiling de MitaElement', () => {
    it('Debe reportar el tiempo de renderizado a profilerStore al conectarse', async () => {
        // Arrange
        class ComponenteLento extends MitaElement {
            async render() {
                // Simulamos una demora artificial de 20ms
                return new Promise(resolve => setTimeout(resolve, 20));
            }
        }
        
        customElements.define('test-componente-lento', ComponenteLento);
        const el = document.createElement('test-componente-lento');
        
        // Espiamos el performance.now
        const perfSpy = vi.spyOn(performance, 'now');
        
        // Act
        document.body.appendChild(el);
        // Esperamos a que termine el ciclo asíncrono
        await new Promise(resolve => setTimeout(resolve, 25));

        // Assert
        // performance.now() debió llamarse 2 veces: al inicio y al final de render()
        expect(perfSpy).toHaveBeenCalledTimes(2);
        
        // Limpiar mock
        perfSpy.mockRestore();
    });
});
