# 🎨 CSS Moderno (Nativo)

En MitaDOM no encontrarás TailwindCSS, SASS, ni Styled Components. Hemos optado por Vanilla CSS porque el estándar ha evolucionado espectacularmente.

## 1. Variables CSS (Custom Properties)

Las variables CSS permiten tener un Sistema de Diseño dinámico. Si cambias el valor de una variable en JS, toda la aplicación se redibuja en 60fps sin necesidad de un Virtual DOM.

```css
:root {
  /* Tokens de Color */
  --color-primario: #10b981;
  --bg-principal: #ffffff;
}

/* Modo Oscuro Nativo */
[data-theme="dark"] {
  --bg-principal: #121212;
  --color-texto: #e5e7eb;
}
```

```javascript
// En JS, cambiar a modo oscuro es solo mutar el DOM:
document.documentElement.setAttribute('data-theme', 'dark');
```

## 2. CSS Nesting (Anidamiento Nativo)

SASS ya no es necesario para el anidamiento. Los navegadores modernos soportan CSS Nesting nativamente.

```css
/* Esto es CSS puro, sin pre-procesadores */
.tarjeta-mita {
  background: var(--bg-secundario);
  border-radius: 8px;

  & .titulo {
    color: var(--color-primario);
    font-size: 1.5rem;
  }

  &:hover {
    transform: translateY(-2px);
  }
}
```

## 3. `@scope` (El futuro del encapsulamiento)

Para no contaminar el DOM global, los componentes de MitaDOM (cuando no usan Shadow DOM cerrado) utilizan la directiva `@scope`. 

```css
@scope (.mita-search-container) {
  /* Estas reglas SÓLO afectarán a los elementos dentro de .mita-search-container */
  input {
    border: 1px solid var(--color-primario);
  }
  
  /* Incluso si hay un <ul> global en la web, este <ul> solo se aplica localmente */
  ul {
    list-style: none;
  }
}
```

## 4. `color-mix()` y Unidades Lógicas

Podemos crear variaciones de color sobre la marcha mezclando el primario con blanco o transparente.

```css
.btn-hover {
  /* Mezcla un 80% de color primario con un 20% de blanco */
  background: color-mix(in srgb, var(--color-primario) 80%, white);
}
.btn-foco {
  /* Un anillo semitransparente perfecto para accesibilidad */
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primario) 30%, transparent);
}
```

MitaDOM utiliza estas tecnologías subyacentes para entregar una UI espectacular que pesa 0kb en librerías CSS externas.
