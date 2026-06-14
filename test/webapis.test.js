import { describe, it, expect, beforeEach, vi } from 'vitest';
import { crearEstadoLocal } from 'mita-dom';
import { MitaElement } from '../src/utils/MitaElement.js';

// Componente simulado para pruebas de Web APIs y CRUD de estado local
class DemoWebApis extends MitaElement {
    static observedAttributes = ['data-test'];

    constructor() {
        super();
        this.estadoLocal = crearEstadoLocal({ valor: 0 });
        this.renderCount = 0;
    }

    async render() {
        this.innerHTML = `<span id="test-display">${this.estadoLocal.get().valor}</span>`;
        this.renderCount++;
    }

    connectedCallback() {
        super.connectedCallback();
        
        // Suscripción al estado local
        this.estadoLocal.suscribir(({ valor }) => {
            const display = this.querySelector('#test-display');
            if (display) display.textContent = valor;
        });
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data-test' && newValue !== null) {
            // Sincronizar atributo nativo de Web Component con el Estado Local de MitaDOM
            this.estadoLocal.patch({ valor: parseInt(newValue) });
        }
    }

    disconnectedCallback() {
        if (super.disconnectedCallback) super.disconnectedCallback();
        
        // CRUD: Destrucción de estado local al remover del DOM (Web API Lifecycle)
        this.estadoLocal.destroy();
    }
}

if (!customElements.get('demo-webapis')) {
    customElements.define('demo-webapis', DemoWebApis);
}

describe('Integración de MitaDOM con Web APIs Nativas', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('El estado local posee CRUD completo (Create, Read, Update, Delete)', () => {
        const estado = crearEstadoLocal({ num: 0 });
        
        // CREATE: Inicializado en constructor

        // READ: .get()
        expect(estado.get().num).toBe(0);

        // UPDATE (Directo): .set()
        estado.set({ num: 10 });
        expect(estado.get().num).toBe(10);

        // UPDATE (Patch): .patch()
        estado.patch({ num: 20 });
        expect(estado.get().num).toBe(20);

        // UPDATE (Funcional): .update()
        estado.update(val => ({ num: val.num + 5 }));
        expect(estado.get().num).toBe(25);

        // RESET
        estado.reset();
        expect(estado.get().num).toBe(0);

        // DELETE: .destroy()
        const spy = vi.fn();
        estado.suscribir(spy);
        expect(estado.suscriptores.size).toBe(1);
        
        estado.destroy();
        expect(estado.suscriptores.size).toBe(0); // El CRUD está completo
    });

    it('attributeChangedCallback sincroniza atributos nativos HTML con el estado local', async () => {
        const elemento = document.createElement('demo-webapis');
        document.body.appendChild(elemento);
        
        await new Promise(r => setTimeout(r, 10)); // Esperar microtask de MitaElement

        // Mutar vía HTML Atributo nativo (Web API)
        elemento.setAttribute('data-test', '99');

        // Leer el DOM Granular renderizado por la suscripción
        const display = elemento.querySelector('#test-display');
        expect(display.textContent).toBe('99');
        
        // El estado interno también debe reflejarlo
        expect(elemento.estadoLocal.get().valor).toBe(99);
    });

    it('disconnectedCallback debe limpiar la memoria del estado local', async () => {
        const elemento = document.createElement('demo-webapis');
        document.body.appendChild(elemento);
        await new Promise(r => setTimeout(r, 10));
        
        expect(elemento.estadoLocal.suscriptores.size).toBeGreaterThan(0); // Está suscrito

        // Remover del DOM (Web API)
        document.body.removeChild(elemento);

        // Verificar si la suscripción interna del estado local se eliminó (Memory Leak prevenido)
        expect(elemento.estadoLocal.suscriptores.size).toBe(0);
    });
});
