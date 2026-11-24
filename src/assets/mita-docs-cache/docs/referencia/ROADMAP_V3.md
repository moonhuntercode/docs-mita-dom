# Roadmap V3: Hacia la Madurez del Framework y Herramientas Útiles

MitaDOM ha crecido desde su concepción como una capa ligera de componentes web hasta convertirse en una arquitectura resiliente. Nuestra filosofía **no es competir** ni "codearse" con otras librerías por ego, sino **sacar lo mejor de ellas** para mejorar nuestras propias herramientas, documentar de forma cristalina, testear con rigor y lograr que la Web y JavaScript nativo trabajen a nuestro favor.

Para la **Versión 3.0.0**, MitaDOM integrará las siguientes capacidades nativas para considerarse una caja de herramientas *útil y definitiva*.

## 1. Patrones de Diseño Avanzados (Arquitectura Core)

### A. Context API y Dependency Injection (`provide/inject`)
Actualmente dependemos excesivamente de "Prop Drilling" (pasar datos de padre a hijo a través de múltiples capas) o del uso de `Signals` globales sueltas.
- **Solución V3:** Integrar métodos `this.provide('key', data)` y `this.inject('key')` que usen los eventos del DOM (`CustomEvent` subiendo por el árbol) para encontrar al ancestro proveedor sin acoplamiento estricto.

### B. Mita Store (Gestor Global Centralizado)
Las `Signals` son excelentes, pero para aplicaciones complejas (como editores gráficos 2D) se necesita un patrón "Action -> Mutation".
- **Solución V3:** Un micro-módulo (MitaStore) inspirado en Pinia, con persistencia nativa en `localStorage/IndexedDB` y registro de mutaciones (Time Travel Debugging).

### C. Lazy Loading y Suspense (Módulos Asíncronos)
- **Solución V3:** `MitaElement` podrá registrar componentes utilizando _Dynamic Imports_ (`() => import('./Component.js')`) envueltos en un `IntersectionObserver`, de manera que el código de un componente complejo no sea bloqueante y solo se descargue si el usuario hace scroll hacia él.

---

## 2. El Ecosistema 2D y Animaciones

MitaDOM fue concebido inicialmente para UI tradicional (Light DOM, CSS). Sin embargo, el paradigma moderno exige interactividad fluida, especialmente para aplicaciones como *Arbol Orgánico (Generación Procedural 2D)* o Metaversos ligeros. 

Para que MitaDOM sea completo en el entorno gráfico, la V3 considerará:

### A. Integración Nativa con Motores Gráficos 2D/3D (Ecosistema Externo)
MitaDOM no debe reinventar la rueda del renderizado, sino ser el puente perfecto.
- **[Galacean Engine](https://github.com/galacean):** Se explorará un patrón de adaptador (MitaGalacean) para encapsular escenas de Galacean (animación web interactiva de alto rendimiento) dentro de un Web Component `<mita-galacean-canvas>`, delegando la lógica de UI a MitaDOM y la lógica gráfica 2D/3D a Galacean, sin perder el reactivismo.

### B. Sistema de Animaciones (Mita Tween Engine)
La UI actual carece de interpolación elegante entre estados.
- **Web Animations API (WAAPI):** Se adoptará WAAPI nativa del navegador para transiciones del DOM (ej. Fade in, Slide out) para no depender de pesadas librerías externas.
- **Interpolación Matemática (TweenJS):** Para animaciones lógicas puras (ej. interpolar una coordenada `x: 0` a `x: 100` a 60 FPS en un Canvas 2D), MitaDOM recomendará la integración oficial con [es6-tween](https://github.com/tweenjs/es6-tween) o similares. Esto permitirá que una variable en el Store (ej. `grosorTronco`) cambie de forma elástica, y que el *Signal* dispare repintados suaves en el canvas sin saturar el DOM.

---
*MitaDOM Core Team - Arquitectura a Largo Plazo*
