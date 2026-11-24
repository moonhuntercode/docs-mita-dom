# 🗺️ Navegación SPA y Paginación Animada (Navigation API)

Una de las joyas de la corona en **MitaDOM** es su integración directa con el moderno estándar web **Navigation API** (`window.navigation`). Al combinar esto con el Core de animaciones (`MitaAnim`), logramos experiencias tipo aplicación nativa (Single Page Application - SPA) sin instalar dependencias de terceros (como `react-router` o `framer-motion`).

## 1. El Componente `<mita-router>`

MitaDOM proporciona un Web Component de fábrica llamado `<mita-router>` que intercepta la ruta de la URL actual y hace una transición suave hacia el `<template>` correspondiente. 

### ¿Cómo configurarlo?

En tu archivo principal de HTML (ej: `index.html`):

```html
<!-- Tus enlaces normales. MitaDOM interceptará el click -->
<nav>
  <a href="/">Inicio</a>
  <a href="/editor">Editor SVG</a>
</nav>

<!-- El Contenedor de Rutas -->
<mita-router>
  <!-- Definición de la Ruta / -->
  <template data-path="/">
    <div class="vista-home">
      <h1>Bienvenido a MitaDOM</h1>
      <p>Selecciona una opción en el menú para empezar.</p>
    </div>
  </template>

  <!-- Definición de la Ruta /editor -->
  <template data-path="/editor">
    <div class="vista-editor">
      <!-- Tus Web Components complejos aquí -->
      <tree-editor></tree-editor>
    </div>
  </template>
  
  <!-- Ruta de caída (404 Not Found) -->
  <template data-path="*">
    <div class="vista-404">
      <h2>Error 404 - Ruta no encontrada.</h2>
    </div>
  </template>
</mita-router>
```

### ¿Qué hace MitaDOM por debajo?
Cuando un usuario hace clic en un `<a href="/editor">`:
1. El navegador intenta recargar la página.
2. `router.js` en MitaDOM captura el evento `navigate` de la *Navigation API* y cancela la recarga de página.
3. Actualiza el *Signal* Global `rutaActual`.
4. El `<mita-router>` se entera del cambio, hace un *Fade Out* (desvanece) la vista `Inicio`, clona el HTML dentro del `<template>` del `Editor`, y lo anima (*Slide In Y*).
5. **Resultado:** 60FPS de paginación fluida, cero latencia, y el historial del navegador (`Botón Atrás`) funciona nativamente.

## 2. Navegación Programática

Si necesitas cambiar de página mediante código (por ejemplo, después de guardar un formulario):

```javascript
import { navegarA } from 'mita-dom';

// Navegar dinámicamente al presionar un botón
document.getElementById('btnGuardar').addEventListener('click', () => {
    // Lógica de guardado...
    navegarA('/dashboard'); // Transicionará suavemente hacia el dashboard.
});
```

---

> **💡 Consejo Pro (QA / Performance):**
> Al usar `<template>`, el navegador *parsea* el HTML que pones dentro, pero NO carga las imágenes pesadas ni ejecuta los scripts del interior hasta que el router los monte en la pantalla. Esto asegura un "Lazy Loading" estructural excelente para el *First Contentful Paint (FCP)*.
