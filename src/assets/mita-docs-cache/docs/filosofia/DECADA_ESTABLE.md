# 🏛️ Filosofía: Construyendo para una Década Estable

En MitaDOM, no construimos librerías para la moda efímera del próximo mes. Construimos cimientos. Nuestro objetivo es que una aplicación empresarial escrita hoy en MitaDOM siga siendo perfectamente funcional, mantenible y rápida dentro de **10 años**.

Para lograr esto, hemos adoptado un manifiesto riguroso sobre cómo desarrollamos herramientas.

---

## 1. El Peligro del Ecosistema Efervescente

El ecosistema Frontend actual sufre de fatiga crónica. Hoy es React, mañana es Svelte, la semana próxima es SolidJS. Los "meta-frameworks" añaden capas y capas de magia negra (compiladores personalizados, sintaxis inventada como JSX, hidrataciones complejas).

**El problema:** Cuando una de estas librerías muere o hace un "breaking change" drástico (ej. Angular 1 a Angular 2), las empresas pierden millones de dólares reescribiendo código.

### Nuestra Solución: Estándares Nativos
MitaDOM actúa como un delgado "azúcar sintáctico" sobre los **Web Components Nativos** (`HTMLElement`). 
- No usamos un compilador personalizado mágico.
- No procesamos tu HTML en un AST oscuro.
- No te atamos a un motor de renderizado virtual.

**Resultado:** Mientras existan los navegadores web (Chrome, Firefox, Safari), el código escrito en MitaDOM funcionará, porque bajo el capó es simple y puro JavaScript nativo del W3C.

---

## 2. La Evolución Segura de los Datos (Retro-Compatibilidad)

Cuando actualizamos MitaDOM, tenemos una regla de oro: **No romper implementaciones pasadas**.
- Si introducimos una forma mejor de hacer las cosas (ej. *Composition API / Signals*), la forma antigua (*POO / Options API*) debe seguir funcionando perfectamente.
- Permitimos que los datos evolucionen orgánicamente. Por eso los `Signals` tienen la opción `guard` y `immutable`, permitiendo que el desarrollador blinde su información de negocio contra errores en componentes no críticos.

---

## 3. El Valor Incalculable del Testing Dual

Un código sin pruebas es código legado desde el momento en que se escribe. Para asegurar que nuestra librería (y las apps de nuestros usuarios) sobrevivan al paso del tiempo, promovemos activamente **Múltiples Estrategias de Testing que Sí Funcionan**.

¿Por qué soportamos tanto el nativo `node:test` como `vitest`?
1. **Resiliencia**: Si mañana Vite deja de existir, tus tests escritos en el corredor nativo de NodeJS seguirán vivos.
2. **Ecosistema**: Si quieres integraciones potentes con HMR, simulaciones completas del navegador y reportes visuales, `vitest` es la herramienta moderna definitiva.
3. **Automatización (CI/CD)**: Identificar lo que no funciona antes de mandarlo a producción es la única forma de garantizar la estabilidad.

---

## 4. El DX Engine (Linter Interno)

Hemos incrustado un sistema de **Linter en Tiempo de Ejecución** dentro del corazón de MitaDOM.
Creemos que el framework debe ser un profesor, no un dictador. 

- En lugar de prohibirte que uses `innerHTML` (lo cual es vital para patrones como *Conditional Rendering*), MitaDOM observa **cómo** lo usas.
- Si detectamos que estás re-renderizando de forma brutal en un bucle cerrado (cometiendo un anti-patrón de performance), la consola no tirará tu app abajo, pero te advertirá verbalmente con sugerencias y keywords exactos para mejorarlo (`Signals`, `Granular DOM`).

El DX (Developer Experience) es intuitivo. Mejores mensajes de error = Mejor comprensión = Mejores interfaces (UI/UX) para el usuario final.
