# 🚀 ¡MitaDOM v2.8.0 (2026-11-24) + Bitácora Combinada por Hora, Versiones y Checklist!
*Actualizado el 24 de Noviembre de 2026 (Incluye historial consolidado desde v2.2.0 hasta v2.8.0)*

Nos enorgullece presentar **MitaDOM `v2.8.0`**, combinando todos los hitos históricos (`v2.2.0` → `v2.6.0` → `v2.7.0` → **`v2.8.0`**) junto con las **copias de estado por hora (*Hourly Snapshots*)**, la **guía de sintaxis completa**, el **Informe Técnico `2026-11-24`** y los **17 Laboratorios Interactivos**.

---

## 🚀 Lanzamiento Oficial `v2.8.0` (`2026-11-24`)

### ⏱️ Copia `00:15 hrs` (`2026-11-24`) — `v2.8.0` (Changelog + Informe Técnico + Lab 17 `v28syntax` + Stack Vite 8 Oxc)
- **Documentación & Changelog Oficial `v2.8.0` (`2026-11-24`)**: ejemplos **Antes vs Después** copiables en `/docs/2026-11-24-v2.8.0` e Informe Técnico completo con guía de sintaxis y mapa de los **17 Laboratorios** en `/docs/informe_tecnico_v2.8.0_2026-11-24`.
- **Laboratorio 17 (`v28syntax`) en `/laboratorio`**: prueba interactiva en vivo de `sinRastrear()` (`untrack`, `0` bucles infinitos), selector de los **8 Subpath Exports** (`mita-dom/signals`, `mita-dom/async`, `mita-dom/element`, `mita-dom/rust`, `mita-dom/ssr`, `mita-dom/props`, `mita-dom/ui`, `mita-dom/devtools`), inspector real `obtenerCicloDeVida()` y consola silenciosa `{ debug: true }`.
- **Ciclo de Vida Completo `MitaElement` + Solid 2.0 Async Graph**: `alCrear()` → `alAntesDeRenderizar()` → `render()` (Error Boundary) → `alMontar()` → `alCambiarProp()` → `alActualizar()` → `alDesmontar()`, más `crearMemoAsincrono()`, `crearEstadoVinculado()` (`linkedSignal`), `crearEstadoOptimistaConRollback()`, `crearFuncionServidorEnVivo()` (`live()` SSE), `cambiarEstrategiaRender()` en 1 línea y `emitirDiagnosticoAgente()` (`skills/reactivity-diagnostics/SKILL.md`).
- **Infraestructura Ultra-Rápida (`0` Warnings)**: Vite 8 con minificador Rust **Oxc** (`~448 ms`), Rolldown `codeSplitting` (`index.js < 75 kB`), Vitest 5 `vmThreads`, eliminación de `139` dependencias legacy (`terser`/`@vitejs/plugin-legacy`/`core-js`) y validación de paridad NPM `npm run test:vercel`.

---

## 🕒 Bitácora de Hitos y Copias por Hora (`2026-11-22`)

### ⏱️ Copia `22:00 hrs` — `v2.7.0-final` (Full-Stack Server Actions, Mita Doc Advisor, SemVer y Paletas CSS3)
- **Data Fetching Granular (`crearControladorFetchingPorModo`)**: permite elegir entre pedir datos **solo al hacer clic en un botón** (`'al-hacer-click'`) o **automáticamente al entrar a la vista** (`'automatico-al-entrar'` con caché TTL).
- **Mita Server Actions (`crearAccionServidorIsomorfica`)**: integración limpia con **Node.js + Express + Sequelize/MySQL ORM**.
- **`Mita Doc Advisor` + `SemVer Release Advisor`**: consejero en tiempo real que detecta buenos y malos usos de la arquitectura y calcula a qué versión subir en `package.json` (`CONTRIBUTING.md`).
- **Configuración de 5 Paletas de Colores CSS3 y 4 Animaciones de Navegación**.

### ⏱️ Copia `21:15 hrs` — `v2.7.0-rc.3` (Passing Props React.dev, Angular `@defer` + `Signal Forms` y Moderación `"DC"`)
- **Motor Opinionado de Props (`pasarPropsAElemento`, `leerPropsDeElemento`)**: ejemplo oficial de Científicos (`Katsuko Saruhashi`, `Aklilu Lemma`, `Lin Lanying`) en Light DOM semántico sin `<div>`.
- **Vistas Diferidas (`renderizarVistaDiferida` — `@defer`) y `Signal Forms` (`crearFormularioReactivoConSignals`)**.
- **Moderación Comunitaria Integral**: perfiles rápidos sin registrar cuenta (regla de 15 días en el mismo dispositivo), ventana obligatoria para entrar a chats/grupos (cooldown 3s), bloqueo de palabra `"DC"` (mayúsculas/minúsculas/ambos), reportes con pruebas y descargo legal con sello `"⚠️ No Verificado"`.

### ⏱️ Copia `19:30 hrs` — `v2.7.0-beta.2` (Rust Memory Guard, CLI `npx mita` y Render Universal `SSR/SSG/Hybrid`)
- **Protección Estilo Rust (`rustGuard.js`)**: Borrow Checker inmutable (`&T` con `Object.freeze`), préstamos mutables con historial (`&mut T`) y ámbitos RAII (`crearAmbitoConLimpiezaAutomatica().liberarMemoriaCompleta()`).
- **Renderizador Universal (`renderizarVistaUniversal` + `MitaMeta`)**: soporte para `SSR`, `SSG`, `Hybrid` (Islas `mita-client="only"` y `mita-server="only"`) y `CSR/SPA`.
- **Docs con Controles de Lectura (`A-`, `16px`, `A+`), Gamificación (`XP`), Resaltador `<mark>` y Sincronización con File System (`src/assets/mita-docs-db.json`)**.

### ⏱️ Copia `18:00 hrs` — `v2.7.0-alpha.1` (Signals Reactivos v2.7 y Fix de Ciclo Infinito)
- **Nuevas Primitivas**: `crearEfecto(fn)`, `signal.derivar(fn)`, `crearEstadoCompartido()`, `obtenerEstadoCompartido()`, `listarEstadosCompartidos()`, `renderCondicional()` declarativo y `vincularTexto()`.

---

## 📜 Historial Previo Consolidado (`v2.2.0` → `v2.6.0`)

### 🚀 ¡MitaDOM v2.2.0 ha llegado! (*Publicado el 12 de Junio de 2026*)
1. **Signals Inmutables**: Ahora puedes instanciar un Signal asegurando que nadie mutará sus datos sin pasar por tu interceptor.
2. **Mita Profiler Integrado**: Nuestro Profiler flota en tu SPA y te avisa con luces rojas cuando tu código rompe la barrera de los 60FPS (`16.6ms`).
3. **Portal de Docs Interactivo**: El SPA de MitaDOM renderiza su propio contenido Markdown sin Virtual DOMs destructivos.
4. **Bug Fix Router SPA**: El Router nativo utiliza `rutaActual.set()`, respetando el ciclo de vida de interceptores.

---

## ✅ Checklist General de Versiones y Funcionalidades

- [x] **Ciclo de Vida Completo `MitaElement` (`v2.8.0`)** (`alCrear`, `render`, `alMontar`, `alCambiarProp`, `alDesmontar`, `obtenerCicloDeVida`)
- [x] **Solid 2.0 Async Graph, Angular `linkedSignal`, React 19 Optimistic & Live SSE (`v2.8.0`)** (`crearMemoAsincrono`, `crearEstadoVinculado`, `crearEstadoOptimistaConRollback`, `crearFuncionServidorEnVivo`)
- [x] **`sinRastrear()` + 8 Subpath Exports + Agent Diagnostics `SKILL.md` + Vite 8 Oxc (`v2.8.0`)**
- [x] **Signals & Reactividad Granular** (`crearEstadoLocal`, `crearEstadoCompartido`, `crearEfecto`, `.derivar`, `vincularTexto`)
- [x] **Rust Memory Guard** (Borrow Checker `&T`/`&mut T`, RAII `Drop` 0 Memory Leaks)
- [x] **Estrategias de Render Universal** (`SSR`, `SSG`, `Hybrid Islands`, `CSR/SPA`, control ON/OFF por vista)
- [x] **Librería UI & CSS3 Grid** (Paginación, Data Fetching Click/Auto, FormBuilder, Signal Forms, `@defer` Views, `<mita-dialog>`)
- [x] **Moderación, Chat Gate (3s), Perfiles sin Cuenta (15 días) y Filtro `"DC"`**
- [x] **DevTools (`Mita Profiler` + `Mita Doc Advisor` + `SemVer Advisor`) y Paletas de Colores**

> ¡Gracias a todos los contribuidores por hacer que la web vuelva a ser rápida, simple y limpia!
