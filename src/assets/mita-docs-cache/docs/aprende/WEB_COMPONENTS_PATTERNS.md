# Patrones de Web Components en MitaDOM

En MitaDOM promovemos el uso de los **Web Components Nativos** de HTML5, pero la forma en que los escribimos puede variar según la complejidad del componente. Como desarrollador *Frontend Senior*, es crucial conocer cuándo usar qué estrategia.

## 1. El Monolito (Todo en JavaScript)
Es la forma más rápida de prototipar. Todo el HTML y CSS se define dentro del archivo `.js` usando `this.innerHTML`.

```javascript
import { MitaElement } from 'mita-dom';

export class MiComponente extends MitaElement {
  async render() {
    this.innerHTML = `
      <style>
        .mi-boton { background: blue; color: white; }
      </style>
      <div>
        <button class="mi-boton">Click</button>
      </div>
    `;
  }
}
customElements.define('mi-componente', MiComponente);
```
**Pros:** Un solo archivo, fácil de mover.
**Contras:** El archivo JS crece desmesuradamente, no hay buen resaltado de sintaxis (a menos que uses plugins) y mezclas lógica con presentación.

---

## 2. Separación de Responsabilidades (El Estándar Production-Ready)
Cuando un componente crece, lo correcto es separar el HTML y el CSS usando módulos ES y Vite (`?raw`).

### Estructura:
- `mi-componente.js` (Lógica y Controladores)
- `mi-componente.html` (Estructura y Accesibilidad)
- `mi-componente.css` (Estilos)

### Implementación

**1. El HTML (`mi-componente.html`)**
```html
<div class="mi-componente-contenedor">
  <h2>Título Separado</h2>
  <button id="btn-accion" class="btn-primario">Acción</button>
</div>
```

**2. El CSS (`mi-componente.css`)**
Importarlo directamente en el JS o en tu `style.css` global. Al usar **Light DOM**, las clases CSS globales funcionan perfectamente, permitiendo usar tu sistema de diseño global sin inyectar estilos en cada componente.

**3. La Lógica (`mi-componente.js`)**
```javascript
import { MitaElement } from 'mita-dom';
import htmlTemplate from './mi-componente.html?raw';
import './mi-componente.css'; // Vite inyectará esto en el <head> global

export class MiComponente extends MitaElement {
  async render() {
    // 1. Inyectar la plantilla HTML importada cruda
    this.innerHTML = htmlTemplate;
    
    // 2. Iniciar lógica
    this.iniciarEventos();
  }

  iniciarEventos() {
    const btn = this.querySelector('#btn-accion');
    btn.addEventListener('click', () => alert('Separación exitosa'));
  }
}
customElements.define('mi-componente', MiComponente);
```

### Ventajas de este Patrón
- **Mantenibilidad:** El equipo de diseño puede tocar el `.html` y el `.css` sin miedo a romper la lógica en `.js`.
- **Light DOM:** Al no usar `attachShadow`, el componente hereda instantáneamente las fuentes globales, el tema oscuro (variables CSS) y permite que los selectores globales (`*`, `body`) fluyan naturalmente.
- **HMR de Vite:** Vite actualizará el navegador al instante cuando guardes el CSS o el HTML sin recargar el estado global.
