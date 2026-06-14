# 🧪 Guía de Testing en MitaDOM

El ecosistema de MitaDOM utiliza una arquitectura híbrida de pruebas para garantizar el **Rendimiento Absoluto** del Core, y al mismo tiempo ofrecer la mejor **Experiencia de Desarrollador (DX)** para ti cuando construyas tus aplicaciones.

---

## 🏎️ 1. Node.js Native Test Runner (El Core)
*Ubicado en el repositorio de `mita-dom`*

**¿Por qué lo usamos?** 
Para probar el núcleo reactivo puro de MitaDOM (los Signals). El módulo `node:test` viene nativamente con Node.js, lo que significa que **no hay dependencias de terceros**.

- **Beneficio Principal:** Es brutalmente rápido (100% CPU puro, 0ms en sobrecarga de librerías).
- **Caso de Uso:** Cuando el equipo de MitaDOM crea nuevas lógicas para el `Signal`, `ComputedSignal` o funciones utilitarias que no tocan el navegador.
- **Comando:** `npm run test:node`

---

## 🎨 2. Vitest + JSDOM (Para tus Aplicaciones)
*Ubicado en `example-mita-spa-01-js` y tests del DOM de la librería*

Vitest es un framework moderno impulsado por Vite. Lo inyectamos en combinación con `JSDOM` (un emulador de navegador) para que puedas probar cómo tus Web Components se comportan en el mundo real.

**Ventajas y Beneficios de usar Vitest en tu SPA:**
1. **DOM Realista:** Puedes verificar si un `Signal` verdaderamente actualizó un nodo de texto o si una clase CSS condicional se aplicó (`assert.strictEqual(elemento.className, 'activo')`).
2. **Watch Mode:** Vitest se queda escuchando tus archivos y repite los tests instantáneamente al guardar, haciendo que el *Test-Driven Development (TDD)* sea un placer.
3. **Mocks y Stubs:** Facilita simular el `localStorage`, `IndexedDB` (usando plugins como `fake-indexeddb`), o el motor `fetch` de red.

### 🌟 El Superpoder: Vitest UI
Vitest incluye un dashboard visual en el navegador. En lugar de leer logs aburridos en la consola negra, puedes verlo gráficamente.

**Cómo usarlo:**
```bash
npm run test:ui
```
*Se abrirá automáticamente `http://127.0.0.1:3005/__vitest__/`*. 

- **¿Qué aporta la UI?** Te muestra un árbol con todos tus componentes testeados, líneas de código que fallaron remarcadas en rojo, y un explorador interactivo para ver qué console.logs emitió cada prueba individualmente. Es indispensable para depurar lógica compleja en tus componentes.

---

## 👁️ 3. Tests Manuales y End-to-End (E2E) <a name="tests-manuales"></a>

El Testing automatizado (Unitario/Integración) prueba las funciones lógicas aisladas, pero no siempre garantiza que el flujo de usuario sea impecable. Para ello, necesitamos Pruebas Manuales o E2E.

### 👥 Pruebas Manuales Estratégicas
En MitaDOM, sugerimos ejecutar el siguiente flujo manual antes de cada lanzamiento:
1. **Prueba de Rutas (Enrutamiento SPA)**: Carga tu SPA (`npm run dev`), e intenta acceder directamente desde la barra de direcciones a `/` , `/docs` , `/acerca` y a una `/ruta-que-no-existe`. Confirma que el **404 Catch-All** se dispare.
2. **Prueba de Persistencia**: Visita una página que mute un Estado Global (ej. `<demo-estados>`). Cambia el valor. Refresca el navegador por completo (`F5`). El valor debe mantenerse intacto gracias al `StorageAdapter` (localStorage/IndexedDB).
3. **Prueba de Desconexión (Memory Leak Check)**: Ve de una página pesada a otra. Abre las DevTools de Chrome, haz un "Garbage Collection" manual, y valida en la pestaña `Memory` que los nodos del DOM fueron destruidos. Los Web Components nativos, cuando se elimina su contenedor (Ej. `<mita-router>`), llaman automáticamente a `disconnectedCallback()`.

### 🤖 Pruebas End-to-End (Cypress / Playwright)
Dado que MitaDOM produce elementos 100% nativos (`<tu-componente>`), no requiere de plugins extraños o workarounds de selectores como ocurre con los frameworks de Virtual DOM.
- Cualquier test de Cypress (Ej. `cy.get('tu-componente').shadow().find('button').click()`) funcionará nativamente.

---

## ⚡ 4. Testing de Rendimiento (Mita Profiler)

Aparte del testing automatizado, construimos el **Mita Profiler**, un widget visual que flota en tu aplicación en modo desarrollo.

**Casos de Uso del Profiler:**
- Validar cuellos de botella en la UI visualmente.
- Asegurarte de que estás cumpliendo con la regla de los **60 FPS**. Si tu componente marca un render en amarillo (> 5ms) o rojo (> 10ms), sabes exactamente qué componente necesita refactorización antes de enviar a producción.
- Es el sustituto ligero a tener que abrir toda la pestaña de "Performance" de las Chrome DevTools.
