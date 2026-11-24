# 🚫 Anti-Patrones: Aprendiendo de los Errores

Para escribir el mejor código posible, primero debemos reconocer abiertamente nuestras peores prácticas y entender **por qué** están mal. 
En MitaDOM, identificamos y justificamos estas equivocaciones para guiarte hacia la mejor manera de desarrollar.

---

## 1. El HTML Quemado en Strings (Spaghetti Template)

### ❌ Lo que NO Funciona (El Error)
```javascript
export class MiComponente extends HTMLElement {
  render() {
    this.innerHTML = `
      <style>
         .error { color: red; }
      </style>
      <div class="error" onclick="hacerAlgo()">HTML Gigante metido en JS</div>
    `;
  }
}
```
### 🧠 Por qué está mal (La Justificación)
- **Ceguera del IDE**: Tu editor (VSCode) pierde la capacidad de autocompletar HTML, validar CSS o alertarte de etiquetas mal cerradas. Todo es solo un "texto verde".
- **Accesibilidad (a11y)**: Herramientas de análisis estático de SEO y ARIA no pueden leer el contenido de tu componente.
- **HMR Roto**: Si cambias un color en el CSS, la herramienta Vite tendrá que recargar *toda la página* en lugar de solo actualizar los estilos, arruinando tu experiencia de desarrollo.

### ✅ La Solución Opinionada (Tríada de Archivos)
Separar responsabilidades en archivos físicos reales:
```javascript
// mi-componente.js
import template from './mi-componente.html?raw';
import './mi-componente.css';

export class MiComponente extends MitaElement {
  alMontar() {
    this.innerHTML = template; // Limpio y semántico
  }
}
```

---

## 2. El Abuso del Re-Render Completo

### ❌ Lo que NO Funciona (El Error)
Intentar recrear el DOM cada vez que cambia un número (Mentalidad errónea traída del Virtual DOM).
```javascript
setInterval(() => {
  this.porcentaje++;
  // MALA PRÁCTICA: Destruir y recrear el HTML 10 veces por segundo
  this.innerHTML = `<div>Porcentaje: ${this.porcentaje}%</div>`;
}, 100);
```

### 🧠 Por qué está mal (La Justificación)
- **Rendimiento Catastrófico**: El navegador debe "Parsear HTML", destruir Nodos C++, y recalcular Layouts pesados en cada tick. El CPU se dispara, la batería de los móviles se drena.
- **MitaDOM Linter**: Si haces esto, nuestro DX Engine te lanzará un `⚠️ Warning` en consola alertándote del abuso.

### ✅ La Solución (Light DOM Granular)
Pintar la estructura una sola vez (Conditional Render permitido), y mutar **quirúrgicamente** el nodo específico usando un `Signal`.
```javascript
const $texto = this.querySelector('#porcentaje-texto');

this.estadoPorcentaje.suscribir(nuevoValor => {
  // Ultra eficiente: Solo modificamos un TextNode
  $texto.textContent = nuevoValor;
});
```

---

## 3. Variables Globales Mutables (El Síndrome del Estado Espagueti)

### ❌ Lo que NO Funciona (El Error)
```javascript
window.estadoUsuario = { nombre: "Juan", logueado: true };

// En algún archivo lejano...
estadoUsuario.logueado = "hack"; // Error de tipo sin detección
```

### 🧠 Por qué está mal (La Justificación)
En aplicaciones de décadas de vida, múltiples desarrolladores tocarán el código. Permitir que cualquier componente modifique el estado global directamente sin un contrato (setter) resulta en comportamientos impredecibles (race conditions) imposibles de debugear.

### ✅ La Solución (Contratos y Signals Inmutables)
Protección de datos y retro-compatibilidad garantizada.
```javascript
import { crearEstadoGlobal } from 'mita-dom';

export const estadoUsuario = crearEstadoGlobal({ nombre: "Juan", logueado: true }, {
  immutable: true, // Inmutabilidad Profunda
  guard: (nuevoVal) => typeof nuevoVal.logueado === 'boolean' // Contratos
});

// Forzamos el uso de la API correcta, documentada e interceptable
estadoUsuario.update(prev => ({ ...prev, logueado: false }));
```
