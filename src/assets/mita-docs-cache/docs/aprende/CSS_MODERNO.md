# 🎨 CSS3 Moderno: La Base del Diseño

MitaDOM favorece el uso de **CSS Vanilla Moderno** por encima de librerías pesadas o frameworks como Tailwind. Entender las características actuales de CSS te permitirá construir interfaces fluidas y "Mobile First" nativamente.

## 1. Variables Nativas (Custom Properties)

Las variables CSS permiten tener un "Tema Global" y componentes súper consistentes. Además, pueden cambiar en tiempo de ejecución para lograr modos Claro/Oscuro sin JS complejo.

```css
:root {
  --color-primario: #10b981;
  --color-fondo: #121212;
  --espaciado-base: 1rem;
}

body.tema-claro {
  --color-primario: #059669;
  --color-fondo: #f9fafb;
}

.tarjeta {
  background-color: var(--color-fondo);
  padding: var(--espaciado-base);
}
```

## 2. Flexbox y CSS Grid: Layouts Bidimensionales

Dejamos atrás los \`float\` y \`inline-block\`.
*   **Flexbox** es perfecto para alinear elementos en 1 sola dirección (filas o columnas). Ideal para un Header (Logo + Menú de navegación).
*   **Grid** es la solución definitiva para estructurar toda una página (Sidebar + Header + Contenido).

```css
/* Ejemplo Grid: App Layout Completo */
.app-container {
  display: grid;
  grid-template-areas: 
    "header header"
    "sidebar contenido";
  grid-template-columns: 250px 1fr;
  grid-template-rows: 60px 1fr;
  min-height: 100vh;
}

header { grid-area: header; }
aside { grid-area: sidebar; }
main { grid-area: contenido; }
```

## 3. Unidades Relativas (Rem, Vh, Clamp)

Para asegurar que tu web se vea perfecta en un reloj, un celular o un televisor 4k, no uses \`px\`.
La función \`clamp(min, preferido, max)\` es mágica para las tipografías responsivas.

```css
h1 {
  /* Mínimo 1.5rem, escala dinámicamente al 5% del ancho, máximo 3rem */
  font-size: clamp(1.5rem, 5vw, 3rem);
}

.contenedor {
  /* Ancho dinámico pero sin romperse */
  width: 100%;
  max-width: 1200px;
  padding: 2rem;
}
```

## 4. Web Components y el Shadow DOM (\`:host\`)

Cuando estilas un componente nativo (`<mita-code-editor>`), usas el Shadow DOM. Para estilizar al "contenedor mismo" de tu componente, usas `:host`.

```css
:host {
  display: block; /* Los custom elements son inline por defecto! */
  contain: content; /* Optimización brutal de renderizado */
}

/* Aplicar estilos solo si el Body tiene una clase (Temas) */
:host-context(.tema-claro) .btn {
  background: white;
}
```

## 5. Micro-animaciones (Transiciones)

Un diseño Premium ("WOW Effect") requiere micro-interacciones sutiles pero fluidas. Nunca animes \`width\`, \`height\`, o \`margin\` (causan "reflow" en la CPU). **Anima solo \`transform\` y \`opacity\` (Usan la GPU).**

```css
.boton {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s;
}

.boton:hover {
  transform: translateY(-2px); /* Se eleva */
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); /* Crea sombra abajo */
}

.boton:active {
  transform: translateY(0); /* Se hunde al clickear */
}
```
