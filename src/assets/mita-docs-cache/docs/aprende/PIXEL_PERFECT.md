# 🎨 Guía Definitiva: Pixel Perfect, UI/UX y Temas Modernos (2026)

Bienvenido a la guía de **Accesibilidad, Fundamentos UX/UI y Diseño Pixel Perfect** para la Web en 2026, utilizando estándares nativos (CSS3, HTML5 Semántico y JS Moderno) sin dependencias pesadas.

---

## 💎 1. Fundamentos de "Pixel Perfect" Moderno

El concepto de *Pixel Perfect* ha evolucionado. Ya no significa "que se vea idéntico en todos los monitores", sino **que escale armónicamente en cualquier dispositivo manteniendo las proporciones ideales del diseño**.

### Unidades Relativas (rem vs em)
Olvídate de los píxeles (`px`) para la tipografía.
- **`rem`**: Usa `rem` para *font-size*, márgenes y paddings globales. Esto respeta la configuración de accesibilidad visual del usuario en su sistema operativo.
- **`em`**: Usa `em` para paddings internos de botones o componentes que deben crecer proporcionalmente si el texto interno crece.

```css
:root {
  /* Escala tipográfica fluida moderna (Clamp) */
  --font-size-base: clamp(1rem, 0.95rem + 0.25vw, 1.25rem);
  --font-size-h1: clamp(2rem, 1.8rem + 1vw, 3rem);
}
body {
  font-size: var(--font-size-base);
}
```

---

## 🌗 2. Temas Modernos (Dark Mode Dinámico)

En 2026, los temas claros y oscuros se manejan mejor con `CSS Variables` (Custom Properties) y el espacio de color `oklch()`, el cual proporciona colores vibrantes perceptualmente uniformes y es soportado universalmente.

### Ejemplo de Configuración Nativa

```css
/* Variables base y Modo Claro por defecto */
:root {
  --hue-primary: 250; /* Azul Púrpura */
  
  --bg-color: oklch(98% 0.01 var(--hue-primary));
  --text-main: oklch(20% 0.05 var(--hue-primary));
  --brand-color: oklch(60% 0.2 var(--hue-primary));
  
  --shadow-sm: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  color-scheme: light dark; /* Informa al navegador */
}

/* Modo Oscuro Detectado por Sistema */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: oklch(15% 0.02 var(--hue-primary));
    --text-main: oklch(90% 0.02 var(--hue-primary));
    --shadow-sm: 0 4px 6px -1px rgb(0 0 0 / 0.8);
  }
}

/* Tema Forzado por Atributo (Para botón de cambiar tema) */
[data-theme="dark"] {
  --bg-color: oklch(15% 0.02 var(--hue-primary));
  --text-main: oklch(90% 0.02 var(--hue-primary));
}
```

Implementación JS de un botón:
```javascript
const themeToggle = document.querySelector('#btn-theme');
themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});
```

---

## ♿ 3. Accesibilidad Web (a11y) y Semántica HTML5

La accesibilidad ya no es opcional, es obligatoria. HTML5 proporciona el 90% de la accesibilidad gratis si se usa correctamente.

### Reglas de Oro Semánticas:
1. **Nunca uses un `<div>` o `<span>` para botones.** Usa `<button>`. Los botones obtienen foco con `Tab`, se activan con `Enter` y `Espacio`, y son detectados por lectores de pantalla.
2. **Jerarquía de Encabezados:** Nunca saltes del `<h1>` al `<h3>`. Los lectores de pantalla usan los encabezados como índice de navegación.
3. **Imágenes siempre con `alt`:** `<img src="logo.png" alt="Logo de MitaDOM">`. Si es puramente decorativa: `alt=""`.

### Atributos ARIA (Accessible Rich Internet Applications)
Úsalos solo cuando HTML no es suficiente (por ejemplo, en modales y menús desplegables complejos).
```html
<button aria-expanded="false" aria-controls="menu-principal">Menú</button>
<nav id="menu-principal" aria-hidden="true">...</nav>
```

---

## 🎨 4. Fundamentos UX/UI y Microinteracciones

Una interfaz "intuitiva" es aquella que no requiere instrucciones. 

### Principios UX Claves:
- **Ley de Fitts:** Los botones de acciones principales deben ser grandes y estar cerca de la zona de interacción natural (especialmente en móviles, cerca del pulgar).
- **Feedback Visual Inmediato:** Cada interacción debe tener una respuesta. Hover, Focus, y Active.
  
```css
/* Microinteracciones modernas */
.btn-moderno {
  background: var(--brand-color);
  color: #fff;
  padding: 0.75em 1.5em;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), 
              box-shadow 0.2s ease;
}

.btn-moderno:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
}

.btn-moderno:active {
  transform: translateY(1px); /* Efecto de "presionar" */
}

/* Accesibilidad de foco ESENCIAL */
.btn-moderno:focus-visible {
  outline: 3px solid oklch(80% 0.1 var(--hue-primary));
  outline-offset: 4px;
}
```

---

## 🚀 5. Ejemplo en Vivo: UI Nativa con `<mita-dialog>`

A continuación, un componente moderno visual con su código, usando el concepto de *Dialog Nativo* de HTML5.

### Vista Previa

<div style="padding: 1.5rem; border: 1px solid var(--border-color, #444); border-radius: 8px; margin-bottom: 1rem; background: var(--bg-surface, #1e1e2e);">
  <h2 style="margin: 0; font-size: 1.25rem;">🪟 Demo: UI Nativa con &lt;mita-dialog&gt;</h2>
  <p>Haz clic abajo para abrir un modal accesible.</p>
  <button class="mita-button" onclick="document.getElementById('demo-modal').abrir()">Abrir Modal</button>
  
  <mita-dialog id="demo-modal" titulo="Términos Modernos">
    <div slot="body">
      <p>Este modal utiliza la API nativa de HTML5. Escala perfectamente, bloquea el scroll de fondo (backdrop) y puede ser cerrado presionando <kbd>ESC</kbd>.</p>
    </div>
  </mita-dialog>
</div>

### Código de Implementación
<mita-code-editor language="html" readonly>
<button onclick="document.getElementById('demo-modal').abrir()">
  Abrir Modal
</button>

<mita-dialog id="demo-modal" titulo="Términos Modernos">
  <div slot="body">
    <p>Este modal utiliza la API nativa de HTML5. Escala perfectamente...</p>
  </div>
</mita-dialog>
</mita-code-editor>

---

*Esta guía está diseñada para mantenerse a la vanguardia de los estándares Web, priorizando velocidad, accesibilidad y la eliminación de dependencias innecesarias.*
