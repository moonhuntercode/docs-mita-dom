# 🌐 Guía Definitiva: Cómo Entender las 4 Estrategias de Render (`CSR`, `SSR`, `SSG`, `Hybrid`), Data Fetching (`Click` vs `Auto`), Backend Node.js + Express + ORM y Docker Swarm (2026-11-22)

> **Propósito de esta Guía:** Si alguna vez sentiste que los términos `SSR`, `SSG`, `Hybrid`, `Islands` y `CSR/SPA` son confusos, aquí tienes la explicación más clara y visual posible, seguida del tutorial práctico para conectar **Frontend Mita-DOM + TypeScript/JavaScript + Vite + Backend Node.js/Express + MySQL ORM + Docker Swarm**.

---

## 1. 🍽️ Entendiendo las 4 Estrategias de Render en 60 Segundos (La Metáfora del Restaurante)

Imagina que tu página web es un **plato de comida** y el navegador del usuario es la **mesa del cliente**:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ 1. ⚡ CSR / SPA (Client-Side Rendering) — "Cocinar en la Mesa del Cliente"   │
│    • Qué envía el servidor: Un plato vacío (<main id="app"></main>) + JS.    │
│    • Quién arma el HTML: El navegador del usuario descarga JS y pide datos.  │
│    • Cuándo usarlo: Paneles privados (/admin, /dashboard, /configuracion)    │
│      donde Google NO necesita indexar SEO y el usuario navega mucho tiempo.  │
├──────────────────────────────────────────────────────────────────────────────┤
│ 2. 🖥️ SSR (Server-Side Rendering) — "Plato Recién Cocinado por Pedido"       │
│    • Qué envía el servidor: En cada visita, Node.js consulta MySQL, arma el  │
│      HTML completo con los datos del segundo exacto y lo entrega listo.      │
│    • Cuándo usarlo: Tablón de Empleos (/empleos) o precios en vivo que       │
│      cambian cada minuto y necesitan aparecer en Google y WhatsApp (SEO).    │
├──────────────────────────────────────────────────────────────────────────────┤
│ 3. 📄 SSG (Static Site Generation) — "Platos Pre-Empacados al Compilar"      │
│    • Qué envía el servidor: Cuando corres `npm run build`, se generan todos  │
│      los archivos .html una sola vez. El servidor solo entrega el archivo.   │
│    • Cuándo usarlo: Documentación (/docs), Blogs (/blog), Términos legales.  │
│      Gasta 0% de CPU y 0 consultas a MySQL en producción.                    │
├──────────────────────────────────────────────────────────────────────────────┤
│ 4. 🏝️ HYBRID + ISLAS (Lo Mejor de los 3 Mundos — Especialidad de Mita-DOM)   │
│    • El servidor entrega la página completa en HTML (rápido + SEO perfecto), │
│      PERO marca qué partes son estáticas y cuáles son interactivas:          │
│      - <header mita-server="only"> -> El navegador NO lo toca (0 JS en CPU). │
│      - <mita-chat mita-client="only"> -> Isla viva que se hidrata en cliente.│
└──────────────────────────────────────────────────────────────────────────────┘
```

### Tabla de Decisión Instantánea: ¿Qué Estrategia Elegir para Cada Vista?

| Vista de tu App | ¿Necesita SEO en Google? | ¿Los datos cambian cada minuto? | Estrategia Recomendada en Mita-DOM |
| --- | --- | --- | --- |
| `/docs` y `/blog` | ✅ Sí | ❌ No (cambian en cada deploy) | **`SSG`** (`modo: 'ssg'`) |
| `/inicio` (Landing + Carrito) | ✅ Sí | 🟡 Solo el widget del carrito/chat | **`HYBRID + ISLAS`** (`modo: 'hybrid'`) |
| `/empleos` (Anuncios en vivo) | ✅ Sí | ✅ Sí (publican todo el día) | **`SSR`** (`modo: 'ssr'`) |
| `/admin` y `/configuracion` | ❌ No (es privado) | ✅ Sí | **`CSR / SPA`** (`modo: 'csr'`) |

---

## 2. 📡 Data Fetching Correcto: ¿Cuándo Pedir Datos al Hacer Clic vs Automáticamente al Entrar?

Con `crearControladorFetchingPorModo()` tienes control total sobre **cuándo** se gasta red y base de datos:

### Caso 1: `modoDisparo: 'al-hacer-click'` (Bajo Demanda / Ahorro Máximo)
Úsalo para reportes pesados, historiales antiguos o verificaciones que el usuario quizá no abra:
```javascript
import { crearControladorFetchingPorModo } from 'mita-dom';

const fetchReporte = crearControladorFetchingPorModo({
  nombreEstado: 'admin:reporte_pesado',
  modoDisparo: 'al-hacer-click', // 0 peticiones al entrar a la vista
  cargadorAsyncFn: async () => {
    const res = await fetch('/api/reports/full');
    return res.json();
  }
});

// En el botón "Descargar Reporte":
boton.addEventListener('click', () => fetchReporte.alHacerClickEnBoton());
```

### Caso 2: `modoDisparo: 'automatico-al-entrar'` (Con Caché TTL de 60 Segundos)
Úsalo para la lista principal de una vista (ej. anuncios activos al abrir `/empleos`). La primera vez consulta al backend; si el usuario sale y vuelve antes de 60 segundos, responde en `0ms` desde memoria:
```javascript
const fetchEmpleos = crearControladorFetchingPorModo({
  nombreEstado: 'empleos:listado_activo',
  modoDisparo: 'automatico-al-entrar',
  tiempoCacheMs: 60000,
  cargadorAsyncFn: () => fetch('/api/jobs').then((r) => r.json())
});

// En render() o onInit() de la vista:
await fetchEmpleos.alEntrarALaVista();
```

---

## 3. 🖥️ Backend Node.js + Express + MySQL ORM (Sequelize) + Mita Server Actions

Inspirado en la arquitectura de producción de `food-show-1` y mejorado con `crearAccionServidorIsomorfica()`:

```javascript
// 1. En tu Backend (server.js — Node.js + Express + Sequelize ORM)
import express from 'express';
import { JobAnnouncement } from './src/db/models/JobAnnouncement.js';
import { renderizarVistaUniversal } from 'mita-dom';
import VistaEmpleos from './src/pages/empleos.js';

const app = express();
app.use(express.json());

// Endpoint REST / Server Action con validación y ORM parametrizado (0 SQL Injection)
app.post('/_mita/actions/empleos/crearAnuncioORM', async (req, res) => {
  const { titulo, categoria, autorNombre } = req.body;
  if (!titulo || !categoria) {
    return res.status(400).json({ ok: false, error: 'Título y categoría obligatorios' });
  }
  const creado = await JobAnnouncement.create({
    title: titulo.trim(),
    category: categoria.trim(),
    authorName: autorNombre || 'Invitado (No Verificado)',
    verified: false
  });
  res.json({ ok: true, datos: creado });
});

// Ruta Universal Hybrid / SSR
app.get('/empleos', async (req, res) => {
  const { htmlDocumento } = await renderizarVistaUniversal(VistaEmpleos, {
    url: req.originalUrl,
    modo: 'hybrid'
  });
  res.send(htmlDocumento);
});
```

```javascript
// 2. En tu Frontend o Componente Isomórfico:
import { crearAccionServidorIsomorfica } from 'mita-dom';

export const accionCrearEmpleo = crearAccionServidorIsomorfica(
  'empleos/crearAnuncioORM',
  async (payload) => {
    const res = await fetch('/_mita/actions/empleos/crearAnuncioORM', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },
  {
    validarPayload: (p) => (!p.titulo ? 'El título es obligatorio' : null)
  }
);
```

---

## 4. 🐳 Principios de Docker, Docker Swarm (Win11 Local → Debian 13) y Seguridad/Performance

### 4.1 Buenas Prácticas de Desarrollo Híbrido (Windows 11 → Docker Swarm en Debian 13)
1. **Rutas y Finales de Línea (LF vs CRLF)**: usa siempre `path.resolve()` / `path.join()` en scripts Node.js y configura `.gitattributes` con `* text=auto eol=lf` para que los scripts `bin/mita.js` con `#!/usr/bin/env node` corran sin errores en contenedores Linux Debian 13.
2. **Dockerfile Multi-Stage Ligero (`node:24-alpine` o `debian-slim`)**:
   ```dockerfile
   # Etapa 1: Build y Verificación QA
   FROM node:24-slim AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run qa

   # Etapa 2: Producción Ultra-Ligera
   FROM node:24-slim AS runner
   WORKDIR /app
   ENV NODE_ENV=production
   COPY --from=builder /app/dist ./dist
   COPY --from=builder /app/package*.json ./
   RUN npm ci --omit=dev
   EXPOSE 3000
   CMD ["node", "server.js"]
   ```

### 4.2 Checklist de Seguridad y Performance Web
- **0 XSS**: usa `vincularTexto()` para nodos de texto dinámico y `sanitizarTexto()` o escape HTML para plantillas.
- **0 Memory Leaks**: usa `crearAmbitoConLimpiezaAutomatica()` en cada vista y libera con `.liberarMemoriaCompleta()` en `disconnectedCallback()`.
- **60FPS Constantes (`< 16.6ms`)**: audita tus vistas con la pestaña **`⏱️ Mita Profiler`** y **`🩺 Mita Doc Advisor`** en `/performance`.
