# Guía Senior: Pixel Perfect, CSS Moderno y UX/UI (2026)

Llegar al nivel *Frontend Senior* no solo se trata de saber JavaScript. Se trata de entender las bases de la interfaz, la accesibilidad, y cómo las medidas relativas funcionan en el navegador moderno. Esta guía destila las mejores prácticas del 2026.

## 1. Pixel Perfect Moderno: Olvídate del `px`

El concepto tradicional de *Pixel Perfect* asume que una página web se ve idéntica a un diseño de Figma en "píxeles absolutos". Sin embargo, **el píxel absoluto (`px`) está obsoleto** para maquetar la estructura principal de la web moderna porque destruye la accesibilidad y no escala con las configuraciones del usuario.

El "Pixel Perfect Moderno" significa: **El diseño debe mantener su jerarquía, proporciones y estética independientemente del dispositivo, tamaño de fuente o zoom del usuario.**

### La Calculadora Definitiva: `rem` vs `em` vs `px`

- **`px` (Píxel Absoluto):** Úsalo **ÚNICAMENTE** para bordes sutiles (`border: 1px solid`), sombras (`box-shadow`), o elementos donde la escala visual rompería el renderizado sub-píxel. ¡No lo uses para tipografías!
- **`rem` (Root EM):** La medida reina en 2026. Equivale al tamaño de fuente del `<html root>`. 
  - *Cálculo:* Si el usuario tiene su navegador por defecto en `16px`, entonces `1rem = 16px`. Si en tu diseño de Figma un título dice `32px`, en CSS debe ser `2rem` (`32 / 16`).
  - *Ventaja UX:* Si una persona con discapacidad visual configura su navegador a `24px` de fuente base, tu título de `2rem` automáticamente crecerá a `48px`, manteniendo la accesibilidad intacta. Si usaras píxeles fijos, el texto se quedaría pequeño.
- **`em` (Element EM):** Relativo al tamaño de fuente del *elemento padre directo*.
  - *Cálculo:* Si un `<button>` tiene `font-size: 1.5rem` (ej. 24px), y le das un `padding: 1em 2em`, el padding será proporcional a su propia fuente (24px de padding vertical y 48px horizontal).
  - *Ventaja UI:* Te permite crear componentes "modulares" que se escalan proporcionalmente solo cambiando su `font-size`.

## 2. Variables CSS (Custom Properties) y Themes

En la era del MitaDOM, no necesitas procesadores de CSS externos como SASS para manejar variables.

### Definiendo Temas Modernos
La mejor forma de estructurar un "Dark Mode" dinámico y libre de "flashes" es centralizando los *tokens de diseño* en `:root`.

```css
/* style.css - Tema Claro por Defecto */
:root {
  --color-fondo: #ffffff;
  --color-texto: #1e293b;
  --color-primario: #2563eb;
  --borde-suave: 1px solid rgba(0,0,0,0.1);
  --sombra-card: 0 4px 6px rgba(0,0,0,0.05);
}

/* Tema Oscuro: Se activa inyectando el atributo data-theme="dark" al <html> */
html[data-theme="dark"] {
  --color-fondo: #0f172a;
  --color-texto: #f8fafc;
  --color-primario: #3b82f6;
  --borde-suave: 1px solid rgba(255,255,255,0.1);
  --sombra-card: 0 4px 6px rgba(0,0,0,0.3);
}

/* Uso Semántico */
body {
  background-color: var(--color-fondo);
  color: var(--color-texto);
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

Para alternar el tema en JavaScript (MitaDOM):
```javascript
const modoActual = document.documentElement.getAttribute('data-theme');
document.documentElement.setAttribute('data-theme', modoActual === 'dark' ? 'light' : 'dark');
```

## 3. Accesibilidad y HTML5 Semántico (a11y)

Escribir `<div>` para todo (*div-soup*) no es de Seniors. Los lectores de pantalla (Screen Readers) y los motores de búsqueda (SEO) dependen de la semántica.

### Reglas Clave:
1. **Puntos de Referencia (Landmarks):** Usa `<header>`, `<nav>`, `<main>`, `<article>`, y `<footer>`. Evita tener múltiples etiquetas `<main>`.
2. **Botones vs Enlaces:**
   - Un botón `<button>`: **Ejecuta una acción** (ej. "Enviar Formulario", "Abrir Modal").
   - Un enlace `<a>`: **Navega a otra página** o sección. ¡Nunca uses un `<a>` para disparar eventos JavaScript si no cambia la URL!
3. **Roles ARIA (Solo cuando sea necesario):** HTML nativo es mejor que ARIA. Si tienes un SVG que es puramente decorativo, usa `aria-hidden="true"`.
4. **Focus Management:** Al abrir un `<dialog>` o un menú desplegable, asegúrate de que el foco del teclado se quede atrapado adentro. (Afortunadamente, `<dialog>` hace esto automáticamente en 2026).

## 4. Fundamentos UX/UI (User Experience / User Interface)

El Pixel Perfect no sirve si la experiencia es mala.

- **Feedback Inmediato:** Siempre muestra una respuesta visual antes de 100ms. Si haces un `fetch()`, deshabilita el botón temporalmente o muestra un spinner. La API `Signal` de MitaDOM es perfecta para este estado de `loading`.
- **Zonas de Clic (Touch Targets):** En dispositivos móviles, un botón nunca debe tener menos de `44px x 44px` (recomendación de Apple/Google). Un padding de `0.8rem 1.5rem` suele ser el estándar seguro.
- **Micro-interacciones:** Agrega `transition: transform 0.2s ease` a tus botones y un leve `transform: scale(0.97)` en el evento `:active`. Dará una sensación táctil robusta.
