# Glosario y Conceptos Clave (Keywords)

MitaDOM SPA introduce conceptos arquitectónicos poderosos inspirados en el ecosistema moderno. Aquí tienes la referencia completa de cada keyword y patrón utilizado en el framework.

## 1. Patrones de Reactividad y Estado

- **Signal (`Signal`, `SignalDerivado`)**: Una primitiva de estado reactivo. A diferencia del estado normal, un Signal rastrea automáticamente qué componentes (o funciones) se han suscrito a él, notificándolos instantáneamente cuando su valor muta. No usa Virtual DOM, las actualizaciones son O(1).
- **Inmutabilidad (`deepFreeze`)**: La práctica de congelar objetos para evitar modificaciones accidentales en cascada. En MitaDOM, los Signals globales usan `deepFreeze` bajo el capó para garantizar que la única forma de mutar el estado sea mediante los métodos oficiales (`set`, `update`).
- **Guards / Middlewares**: Funciones interceptoras que se ejecutan antes de que un Signal procese una mutación. Se usan para Control de Acceso (ej. verificar si hay token antes de guardar datos) o validación de tipos.

## 2. Componentes y UI (Web Components)

- **Light DOM vs Shadow DOM**: 
  - **Shadow DOM**: Encapsula el CSS y el HTML para que no afecten ni sean afectados por el resto de la página. Útil para componentes de interfaz genéricos como `<mita-dialog>`.
  - **Light DOM**: El DOM normal. En MitaDOM fomentamos el Light DOM en componentes de vistas (`demo-estados`, `mita-dashboard`) para que el CSS global (como variables de tema) funcione de forma natural.
- **Error Boundary (`fallbackUI`)**: Un límite de error. Al extender `MitaElement`, cualquier error que ocurra durante el método `render()` es capturado en un `try/catch` interno, y en lugar de romper toda la página, el componente dibuja un "Fallback UI" (una interfaz de repuesto que muestra el mensaje de error).

## 3. Flujo Dinámico y UX Avanzada

- **Teleport (`<mita-teleport>`)**: Un componente estructural que mueve sus nodos hijos al final del `<body>` u otro nodo especificado. Fundamental para evitar que los Modales queden atrapados dentro de contenedores con `overflow: hidden`.
- **Suspense (`<mita-suspense>`)**: Un patrón de UI para manejar operaciones asíncronas. Muestra un "estado de carga" (`fallback`) mientras espera que una promesa se resuelva, un estado de "éxito" cuando termina, y una UI de "error" si falla, todo sin escribir `if/else` espagueti.
- **View Transitions API (`document.startViewTransition`)**: API nativa del navegador que permite animar transiciones entre diferentes vistas (rutas) de una SPA, calculando automáticamente la interpolación de píxeles sin necesidad de librerías CSS externas.

## 4. Arquitectura de Herramientas (DX)

- **HMR (Hot Module Replacement)**: Reemplazo de Módulos en Caliente. Un plugin de Vite que permite que, al guardar un archivo, el navegador inyecte el nuevo código *sin recargar la página*, preservando los Signals y la memoria RAM de la aplicación.
- **Code Splitting (Lazy Loading)**: Dividir el código de la aplicación en múltiples "chunks" o trozos. En nuestro `router.js`, usamos `() => import(...)`. Esto significa que si el usuario no visita `/docs`, el código de `mita-docs.js` jamás se descarga, ahorrando ancho de banda y CPU.

---

> 💡 *Conocer estos términos te permitirá comunicarte eficientemente con otros desarrolladores senior y dominar la arquitectura subyacente de los frameworks modernos.*
