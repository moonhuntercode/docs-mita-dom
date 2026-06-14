import { describe, it, expect, beforeEach, vi } from 'vitest';
import '../src/componentes/demo-estados/demo-estados.js';
import { demoGlobalState } from '../src/componentes/demo-estados/demo-estados.js';

describe('DemoEstados Component', () => {
    let $component;

    beforeEach(async () => {
        document.body.innerHTML = '';
        $component = document.createElement('demo-estados');
        document.body.appendChild($component);
        // Esperamos a que renderice (microtask)
        await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('Debe renderizar correctamente la UI inicial', () => {
        expect($component.querySelector('h2').textContent).toContain('Arquitectura de Estado Global');
        expect($component.querySelector('#btn-mutar-global')).toBeTruthy();
        expect($component.querySelector('#btn-fetch-exito')).toBeTruthy();
    });

    it('Debe mutar el estado global al hacer clic en el botón', () => {
        const estadoInicial = demoGlobalState.get().accesos;
        const $btn = $component.querySelector('#btn-mutar-global');
        
        $btn.click();
        
        const estadoNuevo = demoGlobalState.get().accesos;
        expect(estadoNuevo).toBe(estadoInicial + 1);
    });

    it('Debe mostrar el Spinner y luego éxito al hacer clic en Cargar Datos (Éxito)', async () => {
        const $btnExito = $component.querySelector('#btn-fetch-exito');
        const $feedback = $component.querySelector('#ui-feedback');
        const $contenido = $component.querySelector('#ui-contenido');

        $btnExito.click();

        // 1. Verificar estado "Cargando" sincrónicamente después del click
        expect($component.estadoRed.get().cargando).toBe(true);
        expect($feedback.innerHTML).toContain('⏳ Cargando');
        expect($contenido.style.display).toBe('none');

        // 2. Esperar al timeout simulado (1500ms)
        await new Promise(resolve => setTimeout(resolve, 1600));

        // 3. Verificar estado "Éxito"
        expect($component.estadoRed.get().cargando).toBe(false);
        expect($component.estadoRed.get().datos.id).toBe(1);
        expect($contenido.style.display).toBe('block');
        expect($contenido.innerHTML).toContain('Datos recibidos con éxito');
    });

    it('Debe limpiar suscripciones globales al desconectarse para evitar Memory Leaks', () => {
        const desuscribirSpy = vi.spyOn(demoGlobalState, 'desuscribir');
        
        $component.disconnectedCallback();
        
        expect(desuscribirSpy).toHaveBeenCalledWith($component.subGlobal);
    });
});
