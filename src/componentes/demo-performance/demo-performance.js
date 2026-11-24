// @ts-check
import { MitaElement } from '../../utils/MitaElement.js';
import { ejecutarConsejeroMitaDoc, calcularRecomendacionSemVer } from 'mita-dom';
import { estadoProfiler, configuracionProfiler } from '../../store/profilerStore.js';

export class DemoPerformance extends MitaElement {
  async render() {
    const consejo = ejecutarConsejeroMitaDoc({ raizDom: document.body, latenciaUltimoRenderMs: 4.1 });
    const semver = calcularRecomendacionSemVer({
      versionActual: '2.7.0',
      hayCambiosEnCodigo: true,
      agregaNuevaFuncionalidadOExport: true
    });

    this.innerHTML = `
      <section class="tarjetas-grid" style="display:grid; gap:1.25rem; padding:1rem;">
        <!-- 1. Mita Doc Advisor (Consejero Inteligente de Arquitectura) -->
        <article class="tarjeta-optimizada" style="background: var(--bg-secondary); border-radius: 12px; border: 1px solid var(--border-color); padding: 1.25rem;">
          <header style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:0.5rem; margin-bottom:0.75rem;">
            <h2 style="margin:0; font-size:1.2rem;">🩺 1. Mita Doc Advisor — Consejero Inteligente en Vivo</h2>
            <button type="button" id="btn-reaudit-mitadoc" class="btn-primario" style="padding:0.4rem 0.8rem; border-radius:8px; cursor:pointer;">
              🔄 Re-Auditar Aplicación Ahora
            </button>
          </header>
          <p id="mitadoc-headline" style="font-weight:700;">Puntaje: ${consejo.puntajeSalud}/100 — ${consejo.estadoGeneral}</p>
          <ul id="mitadoc-aciertos-list" style="margin:0.5rem 0;">
            ${consejo.aciertos.map((a) => `<li>${a}</li>`).join('')}
            ${consejo.consejosMejora.map((c) => `<li>${c}</li>`).join('')}
          </ul>
        </article>

        <!-- 2. SemVer Release Advisor (Conectado con CONTRIBUTING.md) -->
        <article class="tarjeta-optimizada" style="background: var(--bg-secondary); border-radius: 12px; border: 1px solid var(--border-color); padding: 1.25rem;">
          <header style="margin-bottom:0.75rem;">
            <h2 style="margin:0; font-size:1.2rem;">📦 2. SemVer Release Advisor (CONTRIBUTING.md)</h2>
            <p style="margin:0.25rem 0 0 0; opacity:0.85;">¿Debo dejar la versión actual o a qué número subir en <code>package.json</code>?</p>
          </header>
          <nav style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.75rem;">
            <button type="button" class="btn-secundario" data-semver-case="none">Sin cambios para NPM (Mantener 2.7.0)</button>
            <button type="button" class="btn-secundario" data-semver-case="patch">Bug fix / Docs (Subir PATCH 2.7.1)</button>
            <button type="button" class="btn-primario" data-semver-case="minor">Nuevos Módulos / Exports (Subir MINOR 2.8.0)</button>
            <button type="button" class="btn-secundario" data-semver-case="major">Breaking Change (Subir MAJOR 3.0.0)</button>
          </nav>
          <output id="semver-advisor-out" style="display:block; padding:0.75rem; border-radius:8px; background:rgba(0,0,0,0.3); font-family:monospace;">
            Recomendación actual: ${semver.versionActual} ➔ ${semver.versionRecomendada} [${semver.tipoSubida}] — ${semver.motivo}
          </output>
        </article>

        <!-- 3. Mita Profiler (60FPS / 16.6ms) -->
        <article class="tarjeta-optimizada" style="background: var(--bg-secondary); border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden;">
          <header class="tarjeta-header" style="background: linear-gradient(135deg, #f43f5e 0%, #be123c 100%); padding: 1rem; color: white;">
            <h2 style="margin: 0; font-size: 1.2rem;">⏱️ 3. Mita Profiler: Rendimiento e Interacciones (60FPS / 16.6ms)</h2>
            <p style="margin: 0; font-size: 0.88rem; opacity: 0.9;">Umbral Rojo: <span id="umbral-txt"></span>ms</p>
          </header>
          <section style="padding: 1.25rem; display:grid; gap:1rem;">
            <h3>Últimas Interacciones (Clicks a Botones)</h3>
            <section id="lista-interacciones" style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 220px; overflow-y: auto; background: var(--bg-tertiary); padding: 1rem; border-radius: 8px;"></section>
            <h3>Tiempos de Renderizado</h3>
            <section id="lista-renderizados" style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 220px; overflow-y: auto; background: var(--bg-tertiary); padding: 1rem; border-radius: 8px;"></section>
          </section>
        </article>
      </section>
    `;

    this._iniciarSuscripciones();
  }

  _iniciarSuscripciones() {
    const $listaInteracciones = this.querySelector('#lista-interacciones');
    const $listaRenderizados = this.querySelector('#lista-renderizados');
    const $umbralTxt = this.querySelector('#umbral-txt');
    const $btnReaudit = this.querySelector('#btn-reaudit-mitadoc');

    if ($btnReaudit) {
      $btnReaudit.addEventListener('click', () => {
        const diag = ejecutarConsejeroMitaDoc({ raizDom: document.body, latenciaUltimoRenderMs: 3.8 });
        const head = this.querySelector('#mitadoc-headline');
        const list = this.querySelector('#mitadoc-aciertos-list');
        if (head) head.textContent = `Puntaje: ${diag.puntajeSalud}/100 — ${diag.estadoGeneral}`;
        if (list) {
          list.innerHTML = [...diag.aciertos, ...diag.consejosMejora].map((i) => `<li>${i}</li>`).join('');
        }
      });
    }

    this.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-semver-case]');
      if (!btn) return;
      const caso = btn.getAttribute('data-semver-case');
      const res = calcularRecomendacionSemVer({
        versionActual: '2.7.0',
        hayCambiosEnCodigo: caso !== 'none',
        rompeCompatibilidadAnterior: caso === 'major',
        agregaNuevaFuncionalidadOExport: caso === 'minor',
        corrigeBugODocumentacion: caso === 'patch'
      });
      const out = this.querySelector('#semver-advisor-out');
      if (out) {
        out.textContent = `Recomendación: ${res.versionActual} ➔ ${res.versionRecomendada} [${res.tipoSubida}] — ${res.motivo}`;
      }
    });

    this.subConfig = (config) => {
      if ($umbralTxt) $umbralTxt.textContent = config.umbralRojo;
    };
    configuracionProfiler.suscribir(this.subConfig);

    this.subMetrics = (estado) => {
      const config = configuracionProfiler.get();
      const umbral = config.umbralRojo || 10;

      if ($listaInteracciones) {
        if (!estado.interacciones || estado.interacciones.length === 0) {
          $listaInteracciones.innerHTML =
            '<p style="color:#888; font-style:italic; margin:0;">No hay interacciones registradas. Haz clic en algún botón del sistema.</p>';
        } else {
          $listaInteracciones.innerHTML = [...estado.interacciones]
            .reverse()
            .map((i) => {
              const esLento = i.ms > umbral;
              const colorTxt = esLento ? '#be123c' : '#15803d';
              return `
                <article style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: var(--bg-secondary); border-radius: 6px; border-left: 4px solid ${colorTxt};">
                  <span><strong>${i.objetivo}</strong> en <code>&lt;${i.componente}&gt;</code></span>
                  <strong>${i.ms.toFixed(2)} ms</strong>
                </article>
              `;
            })
            .join('');
        }
      }

      if ($listaRenderizados) {
        if (!estado.renderizados || estado.renderizados.length === 0) {
          $listaRenderizados.innerHTML = '<p style="color:#888; font-style:italic; margin:0;">No hay renders registrados.</p>';
        } else {
          $listaRenderizados.innerHTML = [...estado.renderizados]
            .reverse()
            .map(
              (r) => `
              <article style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: var(--bg-secondary); border-radius: 6px;">
                <code>&lt;${r.componente}&gt;</code>
                <strong>${r.ms.toFixed(2)} ms</strong>
              </article>
            `
            )
            .join('');
        }
      }
    };
    estadoProfiler.suscribir(this.subMetrics);
  }

  disconnectedCallback() {
    super.disconnectedCallback?.();
    if (this.subMetrics) estadoProfiler.desuscribir(this.subMetrics);
    if (this.subConfig) configuracionProfiler.desuscribir(this.subConfig);
  }
}

if (!customElements.get('demo-performance')) {
  customElements.define('demo-performance', DemoPerformance);
}
