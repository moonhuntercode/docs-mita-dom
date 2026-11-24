# 🤖 Informe Técnico: Cómo Mejoramos Antigravity IDE y Qué Falta Mejorar (Roadmap IA 2026-11-22)

> **Autor:** Victor Code (Bolivia)  
> **Propósito:** Documentar la ingeniería de personalización aplicada sobre **Google Antigravity IDE** para automatizar el flujo de desarrollo web con `mita-dom`, ahorrar tokens, evitar errores repetitivos y definir la hoja de ruta de las próximas mejoras del IDE.

---

## 1. 🛠️ Cómo Mejoramos Antigravity IDE hasta Hoy (Arquitectura de Reglas y Autopilot)

Para que el desarrollador no tenga que repetir instrucciones en cada prompt, configuramos un sistema de **6 Reglas Globales + Regla de Workspace (`GEMINI.md`) + Ciclo de Artifacts**:

### 1.1 Sistema de Reglas Personalizadas (`~/.gemini/config/rules/`)
1. **`01-token-efficiency.md` (Ahorro Extremo de Tokens):**
   - Elimina saludos y relleno conversacional (*Caveman Mode*), exige respuestas en español de Bolivia con doble espaciado y prioriza diffs quirúrgicos sobre reescrituras completas.
2. **`02-strict-qa-frontend.md` (QA y Linter Estricto):**
   - Obliga a diseñar **Mobile-First (`320px` → Desktop)** con Pure CSS3 Grid (`:root` + `@scope`), prohibiendo deshabilitar reglas de ESLint o Stylelint.
3. **`03-mita-workflow.md` (Protocolo Específico Mita-DOM):**
   - Estandariza Light DOM, Signals granulares, Rust Memory Guard (`crearAmbitoConLimpiezaAutomatica`) y la sincronización entre `mita-dom`, `example-mita-spa-01-js` y `food-show-1`.
4. **`04-codebase-memory-architecture.md` (Memoria Persistente):**
   - Prioriza consultar la documentación de arquitectura y el servidor MCP `memory` antes de explorar carpetas a ciegas.
5. **`05-ponytail-lazy-architect.md` (Principio YAGNI):**
   - Exige reutilizar utilidades existentes e incluir al final de cada entrega un **Resumen de Omisiones Conscientes (YAGNI)**.
6. **`06-web-antigravity-autopilot.md` (`trigger: always_on` — El Motor Autopilot):**
   - Automatiza sin que el usuario lo pida:
     - **Ciclo de Artifacts:** `implementation_plan.md` → `task.md` → `walkthrough.md`.
     - **Auto-Documentación Viva:** ejecución automática de `npm run docs:auto` en `mita-dom` y `node scripts/sync-docs.js` en la SPA.
     - **Sincronización con File System:** persistencia en `src/assets/mita-docs-db.json` para que cada `git pull` conserve las guías y políticas editadas.
     - **Pipeline QA Completo:** `docs:auto` → `build` → `lint` → `lint:css` / `test:css` → `test`, reportando `✅ Éxitos` y `❌ Errores`.

---

## 2. 🧠 Cómo el IDE y la Librería Aprendieron de Errores Reales

Cada fricción detectada durante el uso del IDE se convirtió en una automatización permanente:

| Problema Detectado en Sesiones Previas | Solución Automatizada en Antigravity IDE + `mita-dom` |
| --- | --- |
| El navegador en `localhost:5173` cacheaba `dist/mita-dom.js` viejo al agregar nuevos exports. | `vite.config.js` ahora enlaza `'mita-dom'` directamente al código fuente vivo `../mita-dom/src/index.js` con `optimizeDeps: { exclude: ['mita-dom'] }`. |
| Se olvidaba actualizar `CHANGELOG.md` o sincronizar `.md` hacia la SPA de documentación. | `scripts/auto-docs.js` corre automáticamente en `prebuild` y `npm run qa`, y `scripts/sync-docs.js` valida que cada enlace de `<mita-docs-nav>` exista en `test/integridad-rutas.test.js`. |
| Vistas que se veían bien en Desktop se desbordaban en Mobile (`320px`) por bloques `<code>` largos o `header` globales. | Regla obligatoria en `06-web-antigravity-autopilot.md`: selectores de shell acotados por ID (`header#main-header`) y `min-width: 0` + `overflow-wrap: anywhere` en grillas y bloques de código. |

---

## 3. 🔭 Qué Falta Mejorar en Antigravity IDE (Hoja de Ruta / Próximos Pasos)

Inspirándonos en el **Angular AI Tutor via MCP Server** (`https://angular.dev/ai/ai-tutor`) y en herramientas modernas de DX, estas son las **5 mejoras que nos falta incorporar al IDE Antigravity**:

- [ ] **1. Servidor MCP Propio `mita-ai-tutor-mcp`:**
  - Crear un servidor MCP local que exponga herramientas dedicadas (`mita_verificar_componente`, `mita_sugerir_signal`, `mita_auditar_memoria_rust`) para que cualquier agente en Antigravity consulte la API exacta de `mita-dom` en `< 5ms` sin leer archivos.
- [ ] **2. Hook Automático `PostToolUse` para Linter y Tests Instantáneos:**
  - Configurar un hook en Antigravity que dispare `npx eslint <archivo-editado>` automáticamente cada vez que el agente edite un archivo `.js`, corrigiendo errores de variables no usadas antes siquiera de correr `npm run qa`.
- [ ] **3. Verificador Visual Automatizado Mobile (`375px`) vs Desktop (`1280px`):**
  - Integrar un script de captura automática con Chrome DevTools MCP que verifique tras cada cambio de CSS que `document.documentElement.scrollWidth <= window.innerWidth` en `375px` y `1280px` (0 scroll horizontal garantizado).
- [ ] **4. Sincronización Bidireccional Automática entre Repositorios Hermanos:**
  - Un comando unificado (`npx mita sync-workspace`) que propague automáticamente mejoras del núcleo `mita-dom` hacia `example-mita-spa-01-js`, `food-show-1` y `optica-01` corriendo sus suites de tests en paralelo.
- [ ] **5. Modo Tutor Socrático Gamificado dentro del IDE:**
  - Un comando slash o skill `mita-tutor` que guíe a nuevos desarrolladores del equipo mediante retos paso a paso en `/laboratorio`, registrando su progreso y XP en `src/assets/mita-docs-db.json`.
