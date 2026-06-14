import { describe, it, expect, beforeEach } from 'vitest';
import { estadoSidebar } from '../src/store/layoutStore.js';
import '../src/componentes/mita-sidebar/mita-sidebar.js';

describe('Layout y Sidebar MitaDOM', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        estadoSidebar.reset();
    });

    it('debe renderizar el componente mita-sidebar y usar Teleport para el backdrop', async () => {
        const sidebar = document.createElement('mita-sidebar');
        document.body.appendChild(sidebar);
        
        // Esperar al siguiente tick del macro-task (ya que connectedCallback y render son async)
        await new Promise(r => setTimeout(r, 10));

        // El componente debería haber creado y adjuntado un backdrop directamente en el body
        const backdrop = document.getElementById('vt-backdrop');
        expect(backdrop).not.toBeNull();
        expect(backdrop.parentElement).toBe(document.body);
    });

    it('debe abrir y cerrar el sidebar reaccionando al estado global', async () => {
        const sidebar = document.createElement('mita-sidebar');
        document.body.appendChild(sidebar);
        await new Promise(r => setTimeout(r, 10));
        
        const $sidebarAside = sidebar.querySelector('#sidebar');
        const backdrop = document.getElementById('vt-backdrop');

        // Estado inicial
        expect($sidebarAside.classList.contains('sidebar-cerrado')).toBe(true);
        expect(backdrop.classList.contains('open')).toBe(false);

        // Mutar estado global
        estadoSidebar.patch({ abierto: true });

        // Verificar reactividad en el Granular DOM (sin re-render)
        expect($sidebarAside.classList.contains('sidebar-cerrado')).toBe(false);
        expect(backdrop.classList.contains('open')).toBe(true);

        // Cerrar
        estadoSidebar.patch({ abierto: false });
        expect($sidebarAside.classList.contains('sidebar-cerrado')).toBe(true);
        expect(backdrop.classList.contains('open')).toBe(false);
    });
});
