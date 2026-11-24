import { describe, it, expect, beforeEach } from 'vitest';
import { rutaActual } from 'mita-dom';
import { estadoLeccionActiva } from '../src/store/labStore.js';
import '../src/componentes/mita-lab-nav/mita-lab-nav.js';
import '../src/componentes/mita-sidebar/mita-sidebar.js';
import {
  labConfigEmpleos,
  labListaEmpleos
} from '../src/componentes/laboratorio-signals/demo-laboratorio-signals.js';

describe('Laboratorio Signals v2.7 (<mita-lab-nav> en aside + <demo-laboratorio-signals>)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
    labConfigEmpleos.reset();
    labListaEmpleos.reset();
    estadoLeccionActiva.reset();
    rutaActual.set('/laboratorio');
  });

  it('muestra buscador + acordeones en el aside y sincroniza el sandbox split en vivo', async () => {
    const sidebar = document.createElement('mita-sidebar');
    const vista = document.createElement('demo-laboratorio-signals');
    document.body.appendChild(sidebar);
    document.body.appendChild(vista);
    await new Promise((r) => setTimeout(r, 30));

    // 1. <mita-lab-nav> vive adentro del <aside id="sidebar"> con 3 acordeones + buscador
    const labNav = sidebar.querySelector('#sidebar mita-lab-nav');
    expect(labNav).not.toBeNull();
    expect(labNav.style.display).toBe('block');
    expect(labNav.querySelectorAll('details.lab-accordion').length).toBe(3);

    // 1.1 Verificar Diagrama Gráfico Interactivo en Lección 1
    expect(vista.querySelector('#flow-diagram-live')).not.toBeNull();
    expect(vista.querySelector('#flow-signal-state').textContent).toContain('habilitado: true');

    // 2. Probar buscador en el aside
    const searchInput = labNav.querySelector('#lab-nav-search');
    searchInput.value = 'renderCondicional';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    const visibles = Array.from(labNav.querySelectorAll('.lab-accordion-list li')).filter((li) => !li.hidden);
    expect(visibles.length).toBe(1);
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));

    // 3. Verificar editor y sincronización entre los 3 Web Components
    expect(vista.querySelector('mita-code-editor')).not.toBeNull();
    expect(vista.querySelectorAll('.sandbox-tab-btn').length).toBe(3);

    const kpiActivos = vista.querySelector('#kpi-activos');
    expect(kpiActivos.textContent).toBe('1 ofertas');

    vista.querySelector('#lab-titulo').value = 'Ayudante de Cocina';
    vista.querySelector('#lab-puesto').value = 'Ayudante';
    vista.querySelector('#lab-contacto').value = '+591 71112233';
    vista.querySelector('#lab-terminos').checked = true;
    vista.querySelector('#lab-form-empleo').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(kpiActivos.textContent).toBe('2 ofertas');

    // Desactivar desde Componente 2 (<lab-panel-admin>)
    const chkAdmin = vista.querySelector('#lab-chk-habilitado');
    chkAdmin.checked = false;
    chkAdmin.dispatchEvent(new Event('change', { bubbles: true }));
    expect(vista.querySelector('#lab-form-empleo')).toBeNull();

    // 4. Cambiar de lección haciendo clic en el acordeón dentro del <aside>
    const btnCond = labNav.querySelector('button[data-leccion="condicional"]');
    btnCond.click();
    expect(estadoLeccionActiva.get()).toBe('condicional');
    expect(vista.querySelector('#panel-secreto-admin')).toBeNull();
    vista.querySelector('button[data-rol="admin"]').click();
    expect(vista.querySelector('#panel-secreto-admin')).not.toBeNull();

    // 5. Botón expandir del sandbox
    vista.querySelector('#btn-sb-expand').click();
    expect(vista.querySelector('#sandbox-workspace').classList.contains('sandbox-expanded')).toBe(true);

    // 6. Probar tarjetas responsive de Referencia Rápida (botón ▶ Probar -> efectos)
    const btnProbarEfectos = vista.querySelector('#lab-cheatsheet-grid button[data-ir-leccion="efectos"]');
    expect(btnProbarEfectos).not.toBeNull();
    btnProbarEfectos.click();
    expect(estadoLeccionActiva.get()).toBe('efectos');
    expect(vista.querySelector('#ef-total-out').textContent).toContain('Subtotal');

    // 7. Probar Lección 5: Componentes 100% Re-usables (<lab-tarjeta-reusable>)
    labNav.querySelector('button[data-leccion="reusables"]').click();
    await new Promise((r) => setTimeout(r, 20));
    const instancias = vista.querySelectorAll('lab-tarjeta-reusable');
    expect(instancias.length).toBe(3);
    instancias[0].querySelector('.reusable-btn').click();
    expect(instancias[0].querySelector('.reusable-usos').textContent).toBe('1 clics');
    expect(instancias[1].querySelector('.reusable-usos').textContent).toBe('0 clics');
    expect(vista.querySelector('#reusable-event-log').textContent).toContain('Anuncios de Empleo');

    // 8. Probar Lección 6: Antes vs Después v2.7
    labNav.querySelector('button[data-leccion="comparativa"]').click();
    vista.querySelector('button[data-test-v27="efecto"]').click();
    expect(vista.querySelector('#v27-compare-out').textContent).toContain('count=2');
    expect(vista.querySelector('#v27-compare-out').textContent).toContain('doble=4');

    // 9. Probar Lección 7: Chat Anti-Spam + Filtración + Modal <mita-dialog> de Novedades
    labNav.querySelector('button[data-leccion="chat"]').click();
    await new Promise((r) => setTimeout(r, 20));
    vista.querySelector('#btn-test-spam').click();
    expect(vista.querySelector('#chat-guard-status').textContent).toContain('Bloqueado');

    // Publicar novedad desde el modal Light DOM <mita-dialog>
    vista.querySelector('#btn-open-novedad').click();
    vista.querySelector('#novedad-titulo').value = 'Release v2.7';
    vista.querySelector('#novedad-detalle').value = 'Chat Anti-Spam listo';
    vista.querySelector('#form-modal-novedad').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(vista.querySelector('#chat-messages-list').textContent).toContain('Release v2.7');

    // 10. Probar Lección 8: Estrategias SSR, SSG, Hybrid y SPA
    labNav.querySelector('button[data-leccion="estrategias"]').click();
    await new Promise((r) => setTimeout(r, 25));
    expect(vista.querySelector('#ssr-badge-mode').textContent).toBe('HYBRID');
    expect(vista.querySelector('#ssr-html-out').textContent).toContain('<mita-carrito-interactivo mita-client="only"></mita-carrito-interactivo>');
    vista.querySelector('button[data-ssr-mode="csr"]').click();
    await new Promise((r) => setTimeout(r, 25));
    expect(vista.querySelector('#ssr-badge-mode').textContent).toBe('CSR');

    // 11. Probar Lección 9: Auth FormBuilder + Cookies y Analíticas Condicionales
    labNav.querySelector('button[data-leccion="authcookies"]').click();
    await new Promise((r) => setTimeout(r, 25));
    // Analítica bloqueada inicialmente sin consentimiento
    vista.querySelector('#btn-fire-analytics').click();
    expect(vista.querySelector('#cookies-analytics-log').textContent).toContain('Analítica bloqueada');
    // Aceptar todo y volver a disparar analítica
    vista.querySelector('#btn-cookies-all').click();
    vista.querySelector('#btn-fire-analytics').click();
    expect(vista.querySelector('#cookies-analytics-log').textContent).toContain('click_demo_laboratorio');

    // Iniciar sesión en el formulario generado por crearControladorAuth
    const authMount = vista.querySelector('#lab-auth-mount');
    authMount.querySelector('input[name="email"]').value = 'victor@mitadom.bo';
    authMount.querySelector('input[name="password"]').value = 'clave1234';
    authMount.querySelector('#mita-auth-login-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await new Promise((r) => setTimeout(r, 25));
    expect(authMount.querySelector('[data-auth-estado="autenticado"]')).not.toBeNull();

    // 12. Probar Lección 10: Rust Memory Guard + CLI Simulator + Suite de Auto-Verificación
    labNav.querySelector('button[data-leccion="rustguard"]').click();
    await new Promise((r) => setTimeout(r, 25));
    vista.querySelector('#btn-rust-violate').click();
    expect(vista.querySelector('#rust-guard-log').textContent).toContain('Borrow Checker bloqueó mutación directa');
    vista.querySelector('#btn-rust-mutate').click();
    expect(vista.querySelector('#rust-state-view').textContent).toContain('Bs. 1250');
    expect(vista.querySelector('#autotests-results-list').textContent).toContain('RAII Ownership Drop');

    // 13. Probar Lección 11: CRUD Multi-Categoría con FormBuilder + Control Granular de Modos por Vista
    labNav.querySelector('button[data-leccion="crudvistas"]').click();
    await new Promise((r) => setTimeout(r, 25));
    const formCrud = vista.querySelector('#lab-crud-reusable-form');
    formCrud.querySelector('input[name="titulo"]').value = 'Servicio Auditoría RustGuard';
    formCrud.querySelector('select[name="categoria"]').value = 'servicios';
    formCrud.querySelector('input[name="valorNumerico"]').value = '1500';
    formCrud.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await new Promise((r) => setTimeout(r, 25));
    expect(vista.querySelector('#crud-items-list').textContent).toContain('Servicio Auditoría RustGuard');

    // Cambiar modo de /empleos a hybrid y desactivar /admin
    vista.querySelector('button[data-vista-ruta="/empleos"][data-vista-modo="hybrid"]').click();
    expect(vista.querySelector('#vistas-control-log').textContent).toContain('HYBRID');
    vista.querySelector('button[data-vista-toggle="/admin"]').click();
    await new Promise((r) => setTimeout(r, 25));
    expect(vista.querySelector('#vistas-control-log').textContent).toContain('disabled');

    // 14. Probar Lección 12: Paginación UI + Chat Gatekeeper (3s) + Moderación Anuncios ("DC") + Perfiles sin Cuenta (15 días)
    labNav.querySelector('button[data-leccion="comunidad"]').click();
    await new Promise((r) => setTimeout(r, 25));

    // Intentar entrar a grupo de chat abre la ventana de aceptación obligatoria
    vista.querySelector('button[data-enter-room="grupo-empleos"]').click();
    expect(vista.querySelector('#chat-gate-window').hidden).toBe(false);
    vista.querySelector('#btn-accept-chat-gate').click();
    expect(vista.querySelector('#chat-gate-window').hidden).toBe(true);
    expect(vista.querySelector('#chat-gate-badge').textContent).toContain('grupo-empleos');

    // Probar bloqueo de palabra prohibida "dc" / "DC"
    vista.querySelector('#btn-test-dc-word').click();
    expect(vista.querySelector('#mod-admin-log').textContent).toContain('DC');

    // Probar reporte con pruebas y borrado por empresa
    vista.querySelector('#btn-report-first-ad').click();
    expect(vista.querySelector('#mod-notifications-badge').textContent).toContain('1 Reportes');
    vista.querySelector('#btn-admin-purge-company').click();
    expect(vista.querySelector('#mod-admin-log').textContent).toContain('Grupo El Sol SRL');

    // 15. Probar Lección 13: Pasar Props a un Componente (React.dev Avatar & Científicos)
    labNav.querySelector('button[data-leccion="props"]').click();
    await new Promise((r) => setTimeout(r, 25));
    const avatares = vista.querySelectorAll('lab-cientifico-avatar');
    expect(avatares.length).toBe(3);
    expect(vista.querySelector('#avatar-katsuko img').getAttribute('alt')).toBe('Katsuko Saruhashi');
    expect(vista.querySelector('#avatar-katsuko img').getAttribute('width')).toBe('100');
    vista.querySelector('button[data-katsuko-size="120"]').click();
    expect(vista.querySelector('#avatar-katsuko img').getAttribute('width')).toBe('120');

    // 16. Probar Lección 14: Angular.dev Tutorials (@defer Deferrable Views + Signal Forms) y Reto Gamificado
    labNav.querySelector('button[data-leccion="angular"]').click();
    await new Promise((r) => setTimeout(r, 25));
    expect(vista.querySelector('#defer-placeholder-box')).not.toBeNull();
    vista.querySelector('#btn-trigger-defer').click();
    await new Promise((r) => setTimeout(r, 25));
    expect(vista.querySelector('#defer-loaded-content')).not.toBeNull();

    const inputSfNombre = vista.querySelector('#sf-nombre');
    inputSfNombre.value = 'A';
    inputSfNombre.dispatchEvent(new Event('input', { bubbles: true }));
    expect(vista.querySelector('#sigform-valid-badge').textContent).toContain('Inválido');
    inputSfNombre.value = 'Aklilu Lemma';
    inputSfNombre.dispatchEvent(new Event('input', { bubbles: true }));
    expect(vista.querySelector('#sigform-valid-badge').textContent).toContain('Válido');

    // Completar reto gamificado en el laboratorio
    vista.querySelector('#btn-complete-lab-challenge').click();
    expect(vista.querySelector('#lab-gamif-pill').textContent).toContain('XP');

    // 17. Probar Lección 15: Estrategias Visuales + Fetch (Click vs Auto) + Server Action (Express+ORM) + Mita Doc Advisor
    labNav.querySelector('button[data-leccion="fullstack"]').click();
    await new Promise((r) => setTimeout(r, 25));
    expect(vista.querySelector('#visual-strat-badge').textContent).toBe('HYBRID');
    vista.querySelector('button[data-vis-strat="ssg"]').click();
    expect(vista.querySelector('#visual-strat-badge').textContent).toBe('SSG');

    // Probar Fetch al hacer clic y Server Action ORM
    vista.querySelector('#btn-fire-fetch-click').click();
    await new Promise((r) => setTimeout(r, 25));
    expect(vista.querySelector('#fetch-mode-log').textContent).toContain('Red=1');

    vista.querySelector('#form-server-action-orm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await new Promise((r) => setTimeout(r, 25));
    expect(vista.querySelector('#sa-orm-log').textContent).toContain('INSERTADO_EN_ORM');
    expect(vista.querySelector('#lab-mitadoc-out').textContent).toContain('2.8.0');

    // 18. Probar Lección 16: Ciclo de Vida + Solid 2.0 Async Graph + Live SSE + Optimistic Rollback + Estrategia 1-Línea
    labNav.querySelector('button[data-leccion="solid2"]').click();
    await new Promise((r) => setTimeout(r, 70));
    const depSel = vista.querySelector('#solid2-dep-select');
    depSel.value = 'Cochabamba';
    depSel.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 70));
    expect(vista.querySelector('#solid2-cascade-out').textContent).toContain('Cochabamba');

    vista.querySelector('#btn-solid2-live').click();
    await new Promise((r) => setTimeout(r, 120));
    expect(vista.querySelector('#solid2-live-out').textContent).toContain('Listo para entregar');

    vista.querySelector('#btn-solid2-opt-fail').click();
    await new Promise((r) => setTimeout(r, 20));
    expect(vista.querySelector('#solid2-opt-out').textContent).toContain('Rollback automático');
    expect(vista.querySelector('#solid2-likes-badge').textContent).toContain('25 likes');

    vista.querySelector('button[data-solid2-strat="RESUMABLE"]').click();
    expect(vista.querySelector('#solid2-strat-badge').textContent).toBe('RESUMABLE');

    vista.querySelector('#btn-solid2-diag').click();
    expect(vista.querySelector('#solid2-agent-out').textContent).toContain('MITA_LECTURA_SIN_RASTREO');

    // 19. Probar Lección 17: Sintaxis v2.8.0 (sinRastrear + 8 Subpath Exports + obtenerCicloDeVida + debug silencioso)
    labNav.querySelector('button[data-leccion="v28syntax"]').click();
    await new Promise((r) => setTimeout(r, 25));

    // Efecto se ejecutó 1 vez al montar; mutar el Signal no rastreado NO debe volver a dispararlo
    expect(vista.querySelector('#v28-effect-badge').textContent).toContain('Efecto: 1');
    vista.querySelector('#btn-v28-untracked').click();
    expect(vista.querySelector('#v28-effect-badge').textContent).toContain('Efecto: 1');
    expect(vista.querySelector('#v28-untrack-out').textContent).toContain('auditoria=1');

    // Mutar el Signal rastreado SÍ dispara el efecto (pasa a 2)
    vista.querySelector('#btn-v28-tracked').click();
    expect(vista.querySelector('#v28-effect-badge').textContent).toContain('Efecto: 2');

    // Selector interactivo de Subpath Exports
    vista.querySelector('button[data-v28-subpath="mita-dom/async"]').click();
    expect(vista.querySelector('#v28-subpath-code').textContent).toContain("from 'mita-dom/async'");
    expect(vista.querySelector('#v28-subpath-code').textContent).toContain('crearMemoAsincrono');

    // Inspector de ciclo de vida + modo debug silencioso
    vista.querySelector('#btn-v28-lifecycle').click();
    expect(vista.querySelector('#v28-lifecycle-out').textContent).toContain('montado=true');
  });
});
