# 🌿 mita-dom

**mita-dom** es una librería reactiva moderna, modular e inclusiva, construida puramente sobre Vanilla JavaScript y Web Components nativos.

## 📖 El Origen del Nombre

El nombre de nuestro proyecto encierra un doble y poderoso significado cultural:

- **Mitay** (del Quechua): Refiere al sistema de "turnos de trabajo" optimizado en el Potosí colonial. En mita-dom, esto representa el motor interno de nuestro sistema reactivo (*Signals*), el cual gestiona y despacha las actualizaciones del DOM por turnos precisos y granulares, logrando la máxima eficiencia sin sobrecargar el procesador.
- **Mita** (del Guaraní): Significa "niño", "nuevo" o "nacimiento". Simboliza el renacer de la Web Nativa; una arquitectura fresca que devuelve a los desarrolladores a los fundamentos de la web, libres del peso de corporaciones y *frameworks* pesados.

## 🚀 ¿Qué hemos construido?

mita-dom es una librería de nivel Enterprise con **Cero Dependencias**. No utilizamos paquetes de terceros; de hecho, nuestra suite de pruebas está construida íntegramente sobre el estándar nativo de Node.js (`node:test`), sin requerir librerías externas pesadas como Vitest o Jest.

Ofrece un ecosistema completo para *Single Page Applications* (SPAs) enfocándose en el rendimiento absoluto:

- ⚛️ **Reactividad Granular (Signals):** Eliminamos el pesado *Virtual DOM*. Mutamos solo el texto necesario (`.textContent`) con precisión quirúrgica, optimizando el uso de CPU y batería.
- 🧭 **Router SPA Nativo:** Navegación ultra rápida e interceptada usando el estándar moderno `Navigation API`.
- 📦 **Componentes Modulares:** *Web Components* aislados y seguros utilizando CSS nativo (`@scope`), con un enfoque estricto en *Mobile First* y HTML Semántico.
- ⚡ **Fetch Reactivo:** Gestión limpia y asíncrona de recursos (`loading`, `data`, `error`) con excelente Experiencia del Desarrollador (DX).

## ⚙️ Arquitectura y Roadmap (Estado del Proyecto)

Actualmente, **mita-dom** es **Production Ready** para crear:
- ✅ **SPA (Single Page Applications)**
- ✅ Componentes Web Aislados (Microfrontends)
- ✅ Dashboards con Estado Global

🚧 **En Construcción (Futuro Roadmap)**:
- ⏳ **SSR (Server-Side Rendering)**: MitaDOM actualmente opera al 100% en el cliente.
- ⏳ **SSG (Static Site Generation)**: Renderizado estático en tiempo de build.
- ⏳ **Arquitecturas Híbridas & PWA**: Soporte nativo para Service Workers y Offline-First.

---

## 📚 Ecosistema de Documentación y Ruta de Aprendizaje

Para dominar MitaDOM, te recomendamos leer la documentación en este orden:

### 📖 Conceptos Base
1. **[Filosofía y Misión](./FILOSOFIA.md)**: ¿Por qué creamos MitaDOM? ¿Qué problemas resuelve?
2. **[Fundamentos Web y Git](./FUNDAMENTOS_WEB.md)**: Lo que debes saber sobre REST, Git, SPA y el DOM para no depender de frameworks.
3. **[Fundamentos Reactivos](./FUNDAMENTOS.md)**: Aprende sobre Signals y Granular DOM sin VDOM.
4. **[Arquitectura Core](./ARQUITECTURA.md)**: Polyfills, Memory Leaks, SEO y Seguridad.

### 🧩 Componentes y UI
5. **[Guía Maestra de Componentes](./GUIA_COMPONENTES.md)**: Los 4 pilares de Web Components en MitaDOM.
6. **[Web Components Nativos (Props)](./WEB_COMPONENTS_NATIVOS.md)**: Cómo usar `observedAttributes` y propiedades nativas de clase en vez de directivas mágicas.
7. **[Renderizado Condicional](./CONDITIONAL_RENDERING.md)**: Alternativas de Vanilla JS a `v-if`, `v-show` y `visibility`.
8. **[Teleport y Portales](./TELEPORT.md)**: Patrones avanzados de comunicación entre componentes distantes.

### 🌐 Ecosistema y Datos
9. **[Enrutamiento SPA Avanzado](./ENRUTAMIENTO_SPA.md)**: La Navigation API moderna frente a History API, rutas dinámicas y Catch-All 404.
10. **[Datos, APIs y LocalDB](./DATOS_Y_APIS.md)**: Fetch asíncrono, persistencia nativa con IndexedDB y Storage Adapter.
11. **[Ecosistema Vite y HMR](./ECOSISTEMA_VITE.md)**: Hot Module Replacement sin recargas y configuración de SPA.
12. **[Testing y UI](./GUIA_TESTING.md)**: Node:test para core, Vitest para componentes y Mita Profiler para 60FPS.

### 🛠️ Práctica y Casos de Uso
13. **[Ejemplos Prácticos (Learn MitaDOM)](./EJEMPLOS_PRACTICOS.md)**: ¿Vienes de React o Vue? Mira cómo hacer listas y toggles.
14. **[Patrones Avanzados](./PATRONES_AVANZADOS.md)**: Arquitectura de Persistencia, y Guards.

---

## ⚙️ Inicio Rápido y Uso

## 🚨 Guía de Migración a v2.x (Breaking Changes)
Si vienes de la versión `1.x`, debes tener en cuenta los siguientes cambios arquitectónicos introducidos en la **v2.1.6**:

1. **Eliminación de `estadoAppGlobal`**: El core del framework ya no exporta estados globales prefabricados. Ahora tú debes crear tus propias instancias en tu aplicación utilizando las factorías de Experiencia del Desarrollador (DX): `const miEstado = crearEstadoGlobal(0)`. *Nota: la clase base `new Signal(0)` sigue siendo totalmente soportada como la primitiva de bajo nivel para compatibilidad hacia atrás.*
2. **Nueva API CRUD para Signals**: Las mutaciones directas (`estado.value = 10`) han sido deprecadas. Ahora debes usar `.get()`, `.set()`, `.update()`, `.patch()` y `.reset()`.
3. **Persistencia y Arquitectura Avanzada**: El constructor de `Signal` ahora acepta un objeto de opciones para Inmutabilidad y Adaptadores de Bases de Datos (`storageAdapter`).
4. **Mita Vite Plugin**: Se incluyó `mitaHmrPlugin()` para facilitar el Granular HMR en tus proyectos de Vite.

---

### 1. Iniciar un proyecto nuevo (Automatizado)

Si quieres empezar un proyecto nuevo con todo configurado automáticamente (Servidor local, Bundler, y TypeScript opcional), te recomendamos usar el andamiaje oficial de Vite:

```bash
# Para crear un proyecto en Vanilla JS puro:
npm create vite@latest mi-proyecto -- --template vanilla

# O si prefieres TypeScript (Configurará tsconfig.json y entorno automáticamente):
npm create vite@latest mi-proyecto -- --template vanilla-ts
```

### 2. Instalar mita-dom

Entra a la carpeta de tu proyecto e instala nuestra librería:

```bash
cd mi-proyecto
npm install mita-dom
```

### 3. Actualizar a la Última Versión

Dado que iteramos constantemente con nuevas mejoras de rendimiento, si ya tenías instalada la librería en un proyecto antiguo y deseas actualizarla a la última versión (ej. migrar a la **v2.2.x**), simplemente ejecuta:

```bash
npm install mita-dom@latest
```

### 3. Uso Básico

mita-dom es modular, solo importas lo que necesitas. Aquí un ejemplo rápido usando *Signals* y el *Router*:

```javascript
import { crearEstadoGlobal, rutaActual, navegarA } from 'mita-dom';

// Crear estado global con telemetría automática, persistencia e inmutabilidad
const estadoGlobal = crearEstadoGlobal({ contador: 0 }, { 
  immutable: true,
  persistKey: 'mi_app_estado'
});

// Mutación parcial avanzada (v2.x)
estadoGlobal.patch({ contador: 1 });
rutaActual.suscribir((ruta) => {
    console.log("El usuario navegó de manera fluida a:", ruta);
});
```

### 💙 Compatibilidad Total con TypeScript

mita-dom está escrita en Vanilla JS, pero **incluye nativamente sus archivos de declaración (`.d.ts`)**. ¡No necesitas instalar paquetes `@types/mita-dom` extra!

Si usas TypeScript en tu proyecto, disfrutarás de autocompletado estricto y soporte para genéricos de inmediato:

```typescript
import { crearEstadoLocal, crearRecurso } from 'mita-dom';

// TypeScript inferirá estrictamente que este estado solo acepta números
const contador = crearEstadoLocal<number>(0);

// Forzará errores en tiempo de compilación si intentas algo inválido:
// contador.set("hola"); // ❌ Error TS: Type 'string' is not assignable to type 'number'
```

### 3. Ejemplos y Entorno de Desarrollo

Para probar la librería en un entorno real y visualizar componentes, consulta nuestros proyectos de ejemplo separados:

- **`example-mita-spa-01-js`**: Aplicación de ejemplo usando Vite + Vanilla JS + mita-dom.

> [!WARNING]
> **No utilices `npm run preview` dentro de este repositorio.** mita-dom es una librería, no una SPA. El comando `preview` de Vite devolverá un error 404 porque no genera un `index.html` en la compilación. Para probar mita-dom, instálalo en un proyecto externo.

### 4. Pruebas Automáticas

Mantenemos la librería ligera usando los test-runners nativos de Node.js v24:

```bash
node --test
```

## 🌍 Inclusividad Tecnológica

De **Bolivia para el mundo**. mita-dom es nuestra respuesta social a la sobrecomplejidad de la industria actual. Al no depender de pesadas librerías de terceros, construimos aplicaciones extremadamente ligeras y veloces que cargan al instante.

Esto permite que personas con dispositivos móviles de gama baja o conexiones a internet limitadas puedan acceder a la información sin barreras, logrando una **verdadera inclusión digital**.

---
*mita-dom te devuelve el control y la comprensión profunda de la Web.*

- 📚 Lee nuestra visión y filosofía técnica en el [MANIFIESTO.md](./MANIFIESTO.md).
- 🛠️ Aprende a mejorar o actualizar la librería en nuestra [Guía de Mantenimiento](./CONTRIBUTING.md).
