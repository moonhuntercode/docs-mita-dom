# 🚀 Guía Oficial de Git Flow, Backup en GitHub, NPM Publish, Pull Requests, GitHub CLI (`gh`) y Roadmap del Ecosistema (2026-11-23)

Esta guía documenta el flujo completo de versionado, respaldo en GitHub, publicación en NPM, colaboración mediante **Pull Requests** con **GitHub CLI (`gh`)** y el **Roadmap planificado** para los 3 repositorios del ecosistema **MitaDOM**.

---

## 1. 🧭 Mapa de los 3 Repositorios del Ecosistema

| Proyecto Local | Repositorio GitHub (`origin`) | Rama Principal | Último Tag | Nueva Versión | Destino de Publicación |
| --- | --- | --- | --- | --- | --- |
| `E:\investigations\webs\mita-dom` | `moonhuntercode/mita-dom` | `main` | `v2.5.3` | **`v2.7.0`** | **GitHub + Tag + Release (`gh`) + NPM** |
| `E:\investigations\webs\example-mita-spa-01-js` | `moonhuntercode/docs-mita-dom` | `main` | *(nuevo)* | **`v2.7.0`** | **GitHub + Tag + Release (`gh`) + Vercel** |
| `E:\investigations\webs\restaurant-systems\food-show-1` | `moonhuntercode/full-stack-framework-v1` | `main` | *(nuevo)* | **`v2.2.0`** | **GitHub + Tag + Release (`gh`) + Docker Swarm** |

---

## 2. 🛡️ Estrategia Git Flow + Backup Seguro en GitHub

Para evitar pérdida de trabajo y mantener un historial limpio y auditable:

1. **Rama de Release / Backup previo (`release/vX.Y.Z` o `backup/YYYY-MM-DD-vX.Y.Z`):** antes de tocar `main`, crea una rama con tus cambios, haz commit y súbela a GitHub (`git push -u origin release/vX.Y.Z`). Esto crea un respaldo remoto inmediato en la nube.
2. **Merge trazable a `main` (`--no-ff`) + Tag Anotado (`vX.Y.Z`):** los tags en GitHub generan snapshots descargables permanentes (`.zip` / `.tar.gz`).
3. **Rama `develop` y ramas `feat/<nombre>` / `fix/<nombre>`:** para todo trabajo posterior a una versión, nace desde `develop` (o `main` actualizado) y entra mediante **Pull Request** con QA en verde.

```text
feat/nueva-api ──► Pull Request (gh pr create) ──► develop ──► release/v2.8.0 (backup) ──► main + tag v2.8.0 ──► gh release + npm publish
```

---

## 3. 📦 Release Proyecto 1 — `mita-dom@2.7.0` (Git Flow + GitHub Release + NPM)

```powershell
cd E:\investigations\webs\mita-dom

# 1. Verificación integral (auto-docs + build + eslint + stylelint + tests + npm pack --dry-run)
npm run release:check

# 2. Git Flow: rama release como backup remoto
git checkout -b release/v2.7.0
git add .

# 3. Commit redactado (Conventional Commits)
git commit -m "feat(release): v2.7.0 - Signals v2.7, RustGuard, SSR/Islands, CLI y Props/@defer" -m "- Core reactivo: crearEfecto(), crearEstadoCompartido(), obtenerEstadoCompartido(), listarEstadosCompartidos(), Signal.prototype.derivar(), vincularTexto() y renderCondicional() declarativo con auto-limpieza en MitaElement.
- Seguridad de memoria estilo Rust: rustGuard.js (Borrow Checker &T/&mut T inmutable, RAII Drop y presupuesto 60FPS).
- Render universal y ecosistema: ssr.js (CSR/SSR/SSG/Hybrid + Islas + MitaMeta), formBuilder.js, consentimiento.js, uiModeracionYComunidad.js (paginación, chat gate 3s, filtro DC), propsYDefer.js (Props React + @defer + Signal Forms) y fullstackYDevtools.js (Express+ORM Server Actions, Mita Doc Advisor, SemVer Advisor, Bitácora por hora).
- Empaquetado NPM optimizado (-85.8%): incluidos bin/mita.js y types/index.d.ts; excluidos SVG 4.6 MB y tests internos.
- Docs y QA: CONTRIBUTING.md completo, guía Git Flow/PR/gh CLI, changelogs/2026-11-22-v2.7.0.md, AUTO_API_REFERENCIA.md y 61/61 tests en verde."

# 4. Subir backup a GitHub
git push -u origin release/v2.7.0

# 5. Mergear a main + Tag anotado v2.7.0
git checkout main
git merge --no-ff release/v2.7.0 -m "chore(release): merge release/v2.7.0 into main"
git tag -a v2.7.0 -m "Release MitaDOM v2.7.0"
git push origin main --follow-tags

# 6. Crear Release oficial en GitHub con el changelog
gh release create v2.7.0 --title "🚀 MitaDOM v2.7.0 — Claridad, RustGuard, SSR/Islands y Ecosistema Completo" --notes-file changelogs/2026-11-22-v2.7.0.md

# 7. Publicar en NPM (si solicita 2FA OTP, autoriza en el enlace de tu navegador)
npm login
npm whoami
npm publish --access public
npm view mita-dom version
```

---

## 4. 📚 Release Proyecto 2 — `docs-mita-dom@2.7.0` (GitHub + Vercel Auto-Deploy)

> ⚠️ Ejecutar **después** de que `npm view mita-dom version` devuelva `2.7.0`, para que Vercel instale la versión publicada desde NPM.

```powershell
cd E:\investigations\webs\example-mita-spa-01-js

# 1. Apuntar package.json a mita-dom@^2.7.0 y actualizar lockfile
npm pkg set dependencies.mita-dom="^2.7.0"
npm install

# 2. Validar QA completo (sync-docs + eslint + 0 CSS muerto + Vitest + Vite build)
npm run qa

# 3. Git Flow: rama release como backup
git checkout -b release/v2.7.0
git add .

# 4. Commit redactado
git commit -m "feat(release): v2.7.0 - Portal Docs DB Local + FS Sync, 15 Labs Interactivos y Blog por Hora" -m "- Documentación (/docs): DB local híbrida (localStorage + IndexedDB + sync File System /__mita_fs_sync), buscador vivo, acordeones en <aside>, controles de lectura (A-/A+), gamificación XP, subrayado, banner Cookies y Mita Doc Advisor.
- Laboratorio (/laboratorio): 15 lecciones interactivas Split Editor + Demo Viva (Signals v2.7, RustGuard, Props React, @defer + Signal Forms Angular, Paginación/Chat Gate/Moderación DC, CRUD Multi-Categoría y Express+ORM Server Actions).
- Blog y Config: /blog/novedades-v2 con bitácora por hora en vivo; /configuracion con 5 paletas CSS3 y 4 animaciones de navegación; /performance con Mita Doc + SemVer Advisor + Profiler.
- Dependencia actualizada a mita-dom@^2.7.0 para build limpio en Vercel (docs-mita-dom.vercel.app)."

# 5. Backup + Merge a main + Tag v2.7.0 (dispara deploy automático en Vercel)
git push -u origin release/v2.7.0
git checkout main
git merge --no-ff release/v2.7.0 -m "chore(release): merge release/v2.7.0 into main"
git tag -a v2.7.0 -m "Docs MitaDOM v2.7.0"
git push origin main --follow-tags

# 6. Crear Release oficial en GitHub
gh release create v2.7.0 --title "📚 Docs MitaDOM v2.7.0 — 15 Laboratorios, DB Local y Ecosistema v2.7" --notes "Sincronizado con mita-dom@2.7.0. Desplegado en https://docs-mita-dom.vercel.app/ con 15 laboratorios interactivos, documentación auto-administrable con DB local + FS sync, blog con bitácora por hora, 5 paletas CSS3 y cobertura 100% de rutas verificada por Vitest."
```

---

## 5. 🍽️ Release Proyecto 3 — `food-show-1@2.2.0` (`full-stack-framework-v1`)

```powershell
cd E:\investigations\webs\restaurant-systems\food-show-1

# 1. QA completo (verifica que .env NO esté en git status)
npm run lint
npm run lint:css
npm run test
npm run build

# 2. Git Flow: rama release como backup
git checkout -b release/v2.2.0
git add .
git status --short

# 3. Commit redactado
git commit -m "feat(release): v2.2.0 - Signals v2.7, Tablón Empleos Full-Stack MySQL y Gobernanza Admin" -m "- Core reactivo alineado con mita-dom v2.7: crearEstadoCompartido(), obtenerEstadoCompartido(), listarEstadosCompartidos(), crearEfecto() y renderCondicional().
- Módulo Empleos (/empleos): componente <mita-empleos-board> (Light DOM + Pure CSS Grid Mobile-First), modelos Sequelize JobAnnouncement y SystemSetting, endpoints REST /api/v2/jobs y /api/v2/settings con aceptación obligatoria de términos.
- Gobernanza Admin (/admin): panel AdminModules para encendido/apagado instantáneo de módulos, edición de términos/reglas y auditoría de estados locales.
- QA y Estabilidad: corregido EnvironmentTeardownError en entry-client.js bajo Vitest, corregido log de diagnóstico en bootstrap.js sin exponer DB_PASS y manejo resiliente en crud-orm.test.js (14/14 suites, 44/44 tests en verde)."

# 4. Backup + Merge a main + Tag v2.2.0 + GitHub Release
git push -u origin release/v2.2.0
git checkout main
git merge --no-ff release/v2.2.0 -m "chore(release): merge release/v2.2.0 into main"
git tag -a v2.2.0 -m "Release Food-Show-1 / MitaStart v2.2.0"
git push origin main --follow-tags

gh release create v2.2.0 --title "🍽️ MitaStart / Food-Show-1 v2.2.0 — Empleos Full-Stack MySQL + Signals v2.7" --notes "Unificación con mita-dom v2.7.0, módulo completo de Anuncios de Empleo (/empleos) con MySQL + Sequelize ORM, panel AdminModules de gobernanza en /admin y 14/14 suites Vitest (44/44 tests) en verde."
```

---

## 6. 🔀 Guía Completa de Pull Requests (PR) y Uso de GitHub CLI (`gh`)

### A. Cómo Colaborar y Enviar un Pull Request Paso a Paso

```powershell
# 1. Iniciar sesión una sola vez en GitHub CLI
gh auth login
gh auth status

# 2. Hacer Fork y clonar automáticamente (colaboradores externos)
gh repo fork moonhuntercode/mita-dom --clone=true
cd mita-dom
npm install

# 3. Crear una rama descriptiva desde main actualizado
git checkout main
git pull origin main
git checkout -b feat/mi-nueva-mejora

# 4. Hacer tus cambios, documentar y pasar QA obligatorio
npm run release:check

# 5. Commit siguiendo Conventional Commits y subir tu rama
git add .
git commit -m "feat(signals): agrega helper crearSelectorMemoizado con tests"
git push -u origin feat/mi-nueva-mejora

# 6. Crear el Pull Request directamente desde la terminal con gh CLI
gh pr create --base main --title "feat(signals): helper crearSelectorMemoizado" --body "## 🎯 Qué resuelve este PR
Agrega un selector memoizado para evitar recálculos en listas grandes.

## 🧪 Verificación QA
- [x] `npm run release:check` en verde (lint, stylelint, build, tests, npm pack)
- [x] HTML5 semántico + Light DOM + Pure CSS3 Grid Mobile-First
- [x] Documentación y ejemplos Antes vs Después actualizados

## 📸 Capturas / Evidencia
Tests: 62/62 aprobados."
```

### B. Chuleta Esencial de GitHub CLI (`gh`) para Mantenedores y Colaboradores

| Acción | Comando `gh` |
| --- | --- |
| Ver estado de tu sesión GitHub | `gh auth status` |
| Listar Pull Requests abiertos | `gh pr list` |
| Revisar un PR localmente en tu PC | `gh pr checkout <NUMERO_PR>` |
| Ver diff de un PR en consola | `gh pr diff <NUMERO_PR>` |
| Aprobar o comentar un PR | `gh pr review <NUMERO_PR> --approve --body "LGTM, QA en verde"` |
| Fusionar PR limpio (`squash` + borrar rama) | `gh pr merge <NUMERO_PR> --squash --delete-branch` |
| Crear un Issue abierto a la comunidad | `gh issue create --title "..." --label "good first issue,enhancement" --body "..."` |
| Listar Issues etiquetados para colaboradores | `gh issue list --label "help wanted"` |
| Crear Release con changelog `.md` | `gh release create vX.Y.Z --title "..." --notes-file changelogs/...md` |
| Ver todos los Releases publicados | `gh release list` |

---

## 7. 🤝 Plantilla de Invitación Pública para Pedir Colaboradores en Nuevas Versiones

Puedes copiar y publicar este anuncio en **GitHub Issues (`help wanted` / `good first issue`)**, **GitHub Discussions**, tu **README** o **redes de desarrolladores**:

```markdown
🚀 ¡Buscamos colaboradores para las próximas versiones de MitaDOM (v2.8.0 y v3.0.0)!

MitaDOM es un framework/librería open-source creado en Bolivia (100% Vanilla JS, Web Components nativos Light DOM, Signals granulares, protección estilo Rust y cero dependencias de runtime).

✨ ¿En qué puedes colaborar hoy?
- 📦 Subpath exports (`mita-dom/signals`, `mita-dom/ssr`, `mita-dom/rust`) para tree-shaking extremo.
- 🧪 Tests E2E en navegadores reales con Playwright (View Transitions, `@defer`, `<dialog>`).
- 🌐 Nuevos laboratorios interactivos y traducciones en https://docs-mita-dom.vercel.app/.
- ⚙️ Adaptadores oficiales de Server Actions para Express, Fastify y Docker Swarm.
- 🎨 Mejoras de accesibilidad (WCAG AA) y paletas CSS3 Mobile-First.

🛠️ ¿Cómo empezar en 3 minutos?
1. Revisa los issues con etiqueta `good first issue` o `help wanted`.
2. Lee nuestra guía en `CONTRIBUTING.md`.
3. Haz fork con `gh repo fork moonhuntercode/mita-dom --clone=true`, crea tu rama `feat/...`, corre `npm run release:check` y abre tu PR con `gh pr create`.

¡Toda contribución (código, tests, documentación, ejemplos o reporte de bugs) es bienvenida y acreditada en cada release! 🙌
```

### Crear el Issue de Convocatoria Automáticamente con `gh` CLI

```powershell
gh issue create --repo moonhuntercode/mita-dom `
  --title "🤝 Convocatoria Abierta: Colabora en MitaDOM v2.8.0 y v3.0.0" `
  --label "help wanted,good first issue,enhancement" `
  --body "¡Hola comunidad! MitaDOM v2.7.0 ya está listo y abrimos convocatoria para colaborar en v2.8.0 y v3.0.0 (Subpath exports, Playwright E2E, Express Server Actions, nuevos laboratorios en docs-mita-dom y Docker Swarm). Revisa CONTRIBUTING.md y abre tu PR con gh pr create."
```

---

## 8. 🗺️ Planificación de lo que Falta (Roadmap Post-v2.7.0)

### 📦 `mita-dom` (`v2.8.0` / `v3.0.0`)
1. **GitHub Actions CI/CD (`.github/workflows/ci.yml` y `release.yml`):** ejecutar `npm run release:check` en cada PR y automatizar `npm publish` + GitHub Release al etiquetar `v*.*.*`.
2. **Subpath Exports granulares (`package.json`):** `mita-dom/signals`, `mita-dom/ssr`, `mita-dom/rust`, `mita-dom/ui` para reducir bundles simples de `37 kB` gzip a `< 6 kB` gzip.
3. **Adapter oficial Express/Fastify (`mita-dom/server`):** middleware listo para producción con CSRF y rate-limit para `crearAccionServidorIsomorfica()`.
4. **Tests E2E reales (Playwright):** validar View Transitions, `window.navigation`, `@defer` por `IntersectionObserver` y `<dialog>` en Chromium/Firefox/WebKit.

### 📚 `docs-mita-dom` (`example-mita-spa-01-js`, `v2.8.0`)
1. **Auditoría post-deploy en Vercel (`https://docs-mita-dom.vercel.app/`):** validar móvil `360px` y desktop `1440px` + Lighthouse (`Performance / Accessibility / SEO >= 95`).
2. **Persistencia remota opcional (Supabase / Express API):** conectar `Exportar/Importar Snapshot Nube` de `/docs` a backend autenticado.
3. **Limpieza de ramas históricas:** verificar si la rama `features` ya está integrada en `main` y eliminarla si no se usa (`git push origin --delete features`).

### 🍽️ `food-show-1` (`full-stack-framework-v1`, `v2.3.0`)
1. **Consumir `mita-dom@^2.7.0` desde NPM** reemplazando copias locales (`src/core/signal.js` y `src/core/render.js`).
2. **Entorno Docker + Docker Swarm (Debian 13):** alinear `.env` local con MySQL, crear `Dockerfile` multi-stage (Node 24 Alpine) y `docker-stack.yml` con healthcheck (`/api/v2/health`), volumen MySQL persistente y red overlay.
3. **Autenticación JWT / Cookies `HttpOnly`:** sustituir el header de pruebas `X-Admin-Role: ADMIN` en `/api/v2/settings` y `/api/v2/jobs` por middleware real verificado por firma.
4. **Moderación `"DC"` + Chat Gate 3s en MySQL:** conectar `crearGestorComunidadYModeracion()` al tablero `/empleos` y `/admin`.
