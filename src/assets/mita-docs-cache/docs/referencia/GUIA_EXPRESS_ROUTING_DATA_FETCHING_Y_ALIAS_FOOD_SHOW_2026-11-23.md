# 🚂 Guía Práctica: Express.js 5 (Ejemplos Reales de `food-show-1`), Cambio de Estrategias de Render, Routing, Data Fetching y Alias (2026-11-23)

Esta guía documenta **exactamente cómo conectamos Express.js 5 + Vite + MySQL/Sequelize ORM + SSE** en el proyecto real `E:\investigations\webs\restaurant-systems\food-show-1`, cómo cambiar de estrategia de renderizado en 1 línea y los casos de uso reales de **Routing**, **Data Fetching** y **Alias**.

---

## 1. 🚂 Cómo Usamos Express.js 5 en `food-show-1` (Arquitectura Real)

En `food-show-1/server.js`, un único servidor Express 5 cumple **5 responsabilidades claras** sin magia oculta:

### A. Middleware Híbrido Vite Dev vs Producción (`server.js`)

```javascript
import express from 'express';
import path from 'path';
import { apiRouter } from './src/api/routes.js';
import { bootstrapApp } from './src/core/bootstrap.js';

const app = express();
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());
app.use('/uploads', express.static(path.resolve('uploads')));

// 1. En DEV: Vite como middleware con HMR + vite.ssrLoadModule
// 2. En PROD: archivos compilados de dist/client y dist/server
let vite;
if (!isProd) {
  const { createServer } = await import('vite');
  vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  app.use(vite.middlewares);
} else {
  app.use('/assets', express.static(path.resolve('dist/client/assets')));
  app.use(express.static(path.resolve('dist/client'), { index: false }));
}

// 3. API REST + ORM + SSE montada bajo /api/v2
app.use('/api/v2', apiRouter);

// 4. Catch-all SSR universal (Express 5 usa RegExp /.*/ en vez de '*')
app.use(/.*/, async (req, res) => {
  const url = req.originalUrl;
  const render = !isProd
    ? (await vite.ssrLoadModule('/src/entry-server.js')).render
    : (await import('./dist/server/entry-server.js')).render;

  const context = {
    isSlowNetwork: req.headers['save-data'] === 'on' || req.headers['ect'] === '2g'
  };
  const appHtml = await render(url, context);
  res.status(200).set({ 'Content-Type': 'text/html' }).end(appHtml.body);
});

app.listen(3000, async () => {
  await bootstrapApp(); // Conecta MySQL + sequelize.sync() + seeds + MD5 docs sync
});
```

### B. API REST Modular con Sequelize ORM (`src/api/routes.js`)

```javascript
import express from 'express';
import { jobsController } from './jobs.controller.js';
import { settingsController } from './settings.controller.js';
import { featureController } from './feature.controller.js';

export const apiRouter = express.Router();
apiRouter.use(express.json());

// SSE en tiempo real (SIEMPRE antes de /:id)
apiRouter.get('/features/stream', featureController.stream);

// CRUD ORM ProjectFeature (MySQL)
apiRouter.post('/features', featureController.create);
apiRouter.get('/features', featureController.getAll);
apiRouter.get('/features/:id', featureController.getById);
apiRouter.put('/features/:id', featureController.update);
apiRouter.patch('/features/:id', featureController.patch);
apiRouter.delete('/features/:id', featureController.remove);

// Gobernanza Admin y Anuncios de Empleo (MySQL)
apiRouter.get('/settings', settingsController.getAll);
apiRouter.get('/settings/:clave', settingsController.getByKey);
apiRouter.put('/settings/:clave', settingsController.upsert);
apiRouter.get('/jobs', jobsController.getAll);
apiRouter.post('/jobs', jobsController.create);
apiRouter.patch('/jobs/:id', jobsController.patch);
apiRouter.delete('/jobs/:id', jobsController.remove);
```

### C. Server-Sent Events (SSE) + Uploads Asíncronos (`202 Accepted` + `sharp` WebP)

En `food-show-1/server.js`, subir fotos no bloquea el servidor: Express responde **`202 Accepted`** con un `job_id`, procesa las imágenes a WebP en segundo plano con `sharp` y el navegador escucha el progreso real mediante **`EventSource('/api/jobs/stream/:id')`** (o en `mita-dom`, mediante `crearFuncionServidorEnVivo()`).

---

## 2. 🔄 Cambiar Estrategias de Renderizado en 1 Sola Línea

Cualquier desarrollador puede elegir o cambiar el modo de render de cada vista sin reescribir componentes:

```javascript
import {
  definirEstrategiaRenderRuta,
  cambiarEstrategiaRender,
  obtenerMapaEstrategiasRender
} from 'mita-dom';

// Configurar al iniciar la app
definirEstrategiaRenderRuta('/', 'HYBRID');       // Menú rápido + carrito interactivo
definirEstrategiaRenderRuta('/docs', 'SSG');      // HTML estático pre-compilado (~1ms)
definirEstrategiaRenderRuta('/empleos', 'SSR');   // SEO fresco directo desde MySQL
definirEstrategiaRenderRuta('/admin', 'CSR');     // Panel privado SPA puro
definirEstrategiaRenderRuta('/promo', 'RESUMABLE'); // JS bajo demanda (redes 3G)

// Cambiar de estrategia en 1 línea (ej. si /empleos tiene picos de tráfico)
cambiarEstrategiaRender('/empleos', 'HYBRID', { cacheSegundos: 30 });

console.table(obtenerMapaEstrategiasRender());
```

Además, en `food-show-1` puedes probar modos directamente en la URL del navegador:
- `?mita_mode=ssr` — Fuerza HTML completo desde Express.
- `?mita_mode=csr` — Fuerza renderizado puro en navegador.
- `?mita_mode=no-hydrate` — Entrega HTML puro con `0 KB` de hidratación para auditar SEO/accesibilidad.

---

## 3. 🧭 Casos de Uso de Routing (6 Patrones Reales)

| Caso de Uso | Patrón en MitaDOM | Ejemplo Conciso |
| --- | --- | --- |
| **1. Ruta Estática SPA** | `navegarA('/docs')` + `rutaActual` | `<a href="/docs">` interceptado por `window.navigation` (con fallback `history.pushState`). |
| **2. Ruta Dinámica (`URLPattern`)** | `/plato/:id` o `/docs/:slug` | `const match = new URLPattern({ pathname: '/plato/:id' }).exec(url);` |
| **3. Guard de Autenticación** | Verificar sesión antes de montar vista | Si `!auth.get().token` al entrar a `/admin`, redirigir a `/login` (sin `display: none`). |
| **4. Lazy Loading por Chunk** | `() => import('./pages/admin.js')` | El bundle de `/admin` nunca se descarga en visitas públicas. |
| **5. View Transitions Animadas** | `document.startViewTransition(...)` | Transición fluida Fade/Slide/Zoom configurable desde `/configuracion`. |
| **6. Fallback 404 + SEO Meta** | `MitaMeta.actualizar({ titulo, descripcion })` | Ruta desconocida renderiza `<vista-404>` con código `404` en SSR. |

---

## 4. 📡 Casos de Uso de Data Fetching (5 Patrones Claros)

| Necesidad | Primitiva MitaDOM | Cuándo Elegirla |
| --- | --- | --- |
| **1. Cargar solo al hacer clic** | `crearControladorFetchingPorModo({ modoDisparo: 'al-hacer-click' })` | Reportes pesados, exportaciones o filtros manuales (ahorra peticiones a BD). |
| **2. Cargar al entrar con Caché TTL** | `crearControladorFetchingPorModo({ modoDisparo: 'automatico-al-entrar' })` | Catálogos, menús o listas consultadas frecuentemente. |
| **3. Dependencias reactivas sin race conditions** | `crearMemoAsincrono(async ({ signal }) => ...)` | Búsqueda en vivo, selects en cascada (`Departamento → Ciudad`), paginación reactiva. |
| **4. Mutación con UX instantánea** | `crearEstadoOptimistaConRollback()` + `crearFuncionServidor()` | Likes, toggles de Admin ON/OFF, agregar al carrito con rollback si falla red. |
| **5. Datos en tiempo real (SSE)** | `crearFuncionServidorEnVivo('canal', async function* () { ... })` | Estado de pedidos en cocina, logs de telemetría, subastas o precios en vivo. |

---

## 5. 🏷️ Configuración Profesional de Alias (`@/*`, `~/*`) en Vite + VS Code

Los alias eliminan rutas frágiles como `../../../../core/signal.js` y hacen que tu código sea legible en cualquier carpeta:

### `vite.config.js` (Runtime + Build + Vitest)

```javascript
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@api': fileURLToPath(new URL('./src/api', import.meta.url)),
      '~': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});
```

### `jsconfig.json` (Autocompletado e IntelliSense en IDE y Agentes IA)

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "checkJs": true,
    "allowJs": true,
    "moduleResolution": "bundler",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@core/*": ["./src/core/*"],
      "@components/*": ["./src/components/*"],
      "@api/*": ["./src/api/*"],
      "~/*": ["./src/*"]
    }
  },
  "include": ["src/**/*", "scripts/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Antes vs Después con Alias

```javascript
// ❌ ANTES (frágil si mueves el archivo de carpeta)
import { crearEstadoCompartido } from '../../../core/signal.js';
import { apiRouter } from '../../api/routes.js';

// ✅ DESPUÉS (limpio, legible y portable)
import { crearEstadoCompartido } from '@core/signal.js';
import { apiRouter } from '@api/routes.js';
```

---

## 6. 📦 Optimización de Bundle y Code Splitting en Vite 8 / Rolldown (Cero Warnings `> 500 kB`)

> **Regla QA Estricta:** nunca silencies la advertencia `(!) Some chunks are larger than 500 kB` subiendo `build.chunkSizeWarningLimit`. Resuelve la causa raíz con **dynamic `import()`** y **`build.rolldownOptions.output.codeSplitting`**.

### Caso Real Resuelto en `docs-mita-dom` (`example-mita-spa-01-js`)

- **❌ Antes (`515 kB` en `index-legacy.js`):** `<mita-search>` importaba `docsRegistry.js` estáticamente en el arranque (`main.js`), empaquetando todos los archivos `.md` dentro del chunk principal.
- **✅ Después (0 warnings, todos los chunks `< 500 kB`):**
  1. `<mita-search>` carga `await import('../mita-docs/docsRegistry.js')` **solo al enfocar o buscar**.
  2. `vite.config.js` agrupa librerías y documentos con `rolldownOptions.output.codeSplitting.groups`:

```javascript
build: {
  minify: 'terser',
  rolldownOptions: {
    output: {
      codeSplitting: {
        groups: [
          { name: 'docs-referencia', test: /mita-docs-cache[\\/]docs[\\/]referencia/ },
          { name: 'docs-aprende', test: /mita-docs-cache[\\/]docs[\\/](aprende|filosofia)/ },
          { name: 'docs-changelogs', test: /mita-docs-cache[\\/](changelogs|docs[\\/]changelogs)/ },
          { name: 'vendor-marked', test: /node_modules[\\/]marked/ },
          { name: 'vendor-mita-dom', test: /mita-dom[\\/](src|dist)/ }
        ]
      }
    }
  }
}
```

  3. El gate automático `npm run test:bundle` (`scripts/check-bundle-size.js`) audita `dist/assets/*.js` en cada `npm run qa` y falla el pipeline si cualquier chunk moderno o legacy supera `500 kB`.

### Cómo Entender y Resolver `[PLUGIN_TIMINGS]` en Vite 8 / Rolldown

Si Vite 8 imprime `[PLUGIN_TIMINGS] JavaScript callbacks ran for X.Xs (97%)`, **no es un error de tu app**: es un perfilador de Rolldown avisándote qué plugin escrito en JavaScript está frenando el compilador nativo en Rust:

| Plugin Lento Reportado | Causa | Solución Recomendada en Vite 8 |
| --- | --- | --- |
| `vite:terser renderChunk` | Tener `build.minify: 'terser'` (minificador JS antiguo) | Cambiar a `build.minify: true` (usa **Oxc nativo en Rust**, ~20x más rápido y conserva `console.*` por defecto). |
| `vite:legacy-post-process` | Ejecutar `@vitejs/plugin-legacy` en cada build (doble compilación + Babel) | Activarlo bajo demanda con `MITA_LEGACY=true` (`npm run build:legacy`) si tu app ya usa Web Components + ES Modules modernos. |

### Actualización Segura de Dependencias (`npm outdated` vs Majors)

- `npm update` solo actualiza versiones **Minor/Patch** dentro del rango `^` de `package.json`, pero **nunca salta de versión Major** (ej. `vitest 4.x` → `5.x`) para protegerte de breaking changes.
- Usa `npm outdated` para detectar saltos Major pendientes y actualízalos explícitamente con `npm install -D <paquete>@latest` seguido de `npm run qa`.
