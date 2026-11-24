# Informe Técnico y Guía Definitiva: Estados, Signals y Compartición de Datos en MitaDOM v2.7.0

- **Fecha del Informe:** 22 de noviembre de 2026 (`2026-11-22`)
- **Autor del Framework:** Victor Code (Bolivia) — `mita-dom`
- **Versión:** `v2.7.0`
- **Objetivo:** Establecer una forma **única, explícita, fácil de leer y fácil de aprender** para crear estados locales, estados compartidos entre componentes, efectos reactivos y renderizado condicional granular (sin Shadow DOM y sin Virtual DOM).

---

## 1. Diagnóstico: ¿Qué faltaba antes y qué se mejoró hoy?

Al auditar `mita-dom` frente al proyecto full-stack `food-show-1`, detectamos cuatro puntos de confusión para quien aprende o mantiene la arquitectura:

| Problema detectado | Solución implementada en `mita-dom v2.7.0` |
| --- | --- |
| Existían dos APIs paralelas (`createSignal` + `effect` con `.value` vs `Signal` con `.get()/.set()`). | Unificación total: `Signal.get()` ahora soporta auto-rastreo dentro de `crearEfecto(fn)` manteniendo el estándar CRUD explícito. |
| Compartir datos entre componentes exigía crear archivos sueltos o mezclar `localStorage`, `Preferences`, `AuthStore` y `globalState`. | Nuevo registro explícito: `crearEstadoCompartido()`, `obtenerEstadoCompartido()` y `listarEstadosCompartidos()` con `persistirLocal`, `descripcion` y `reglas`. |
| `renderCondicional(sig, nodo, fn, t1, t2)` tenía 5 parámetros posicionales difíciles de leer a simple vista. | Ahora acepta un **objeto declarativo y legible**: `{ estado, contenedor, cuando, mostrar, sino }` y devuelve función `detener()`. |
| Suscripciones manuales podían quedar vivas al desmontar componentes (memory leaks). | `suscribir()` retorna `desuscribir()`, y `MitaElement` incorpora `this.escucharEstado()` y `this.mostrarSi()` con limpieza automática en `disconnectedCallback()`. |

---

## 2. Mapa Mental Rápido: ¿Qué herramienta usar en cada caso?

1. **Estado solo para UN componente** (ej. pestaña activa, texto de buscador, modal abierto):
   - Usa **`crearEstadoLocal(valorInicial)`**.
2. **Estado compartido entre VARIOS componentes** (ej. configuración de anuncios de empleo, sesión admin, carrito, términos y condiciones):
   - Usa **`crearEstadoCompartido(nombreUnico, valorInicial, opciones)`** y léelo en otro componente con **`obtenerEstadoCompartido(nombreUnico)`**.
3. **Dato calculado a partir de otro estado** (ej. total de anuncios activos, total del carrito):
   - Usa **`miSignal.derivar((estado) => ...)`**.
4. **Reaccionar a uno o varios estados automáticamente** (ej. filtrar una tabla por búsqueda + categoría):
   - Usa **`crearEfecto(() => { ... })`** (devuelve función `detener()`).
5. **Mostrar u ocultar bloques de HTML sin `display: none`**:
   - Usa **`renderCondicional({ estado, contenedor, cuando, mostrar, sino })`** o **`this.mostrarSi({ ... })`** dentro de `MitaElement`.
6. **Actualizar solo un texto sin tocar `innerHTML`**:
   - Usa **`vincularTexto(signal, nodo, formateador)`**.

---

## 3. Ejemplos Prácticos Claros y Copiables

### Ejemplo 1: Estado Local dentro de un Web Component (`crearEstadoLocal` + `vincularTexto`)

```js
import { MitaElement, crearEstadoLocal, vincularTexto } from 'mita-dom';

export class ContadorClaro extends MitaElement {
  alMontar() {
    // 1. Creamos el estado local con un nombre descriptivo
    this.estadoContador = crearEstadoLocal({ clicks: 0 });

    // 2. Pintamos la estructura base UNA sola vez (Light DOM)
    this.innerHTML = `
      <div class="tarjeta-contador">
        <p id="texto-clicks"></p>
        <button id="btn-sumar" type="button">+1 Click</button>
      </div>
    `;

    // 3. Vinculamos solo el texto de forma granular y auto-limpiable
    const limpiarTexto = vincularTexto(
      this.estadoContador,
      this.querySelector('#texto-clicks'),
      (estado) => `Total de clicks: ${estado.clicks}`
    );
    this.registrarLimpieza(limpiarTexto);

    // 4. Mutamos con .patch() o .update()
    this.addEventListener('click', (evento) => {
      if (evento.target.id === 'btn-sumar') {
        const actual = this.estadoContador.get().clicks;
        this.estadoContador.patch({ clicks: actual + 1 });
      }
    });
  }
}

customElements.define('contador-claro', ContadorClaro);
```

---

### Ejemplo 2: Compartir Datos entre Dos Componentes (Sin Props Drilling ni Imports Circulares)

#### Paso A — Definir el estado compartido (por ejemplo en `src/core/empleosStore.js`):

```js
import { crearEstadoCompartido } from 'mita-dom';

export const estadoConfigEmpleos = crearEstadoCompartido(
  'empleos:configuracion',
  {
    habilitado: true,
    requiereLogin: false,
    terminosCondiciones: 'Los anuncios deben ser verídicos y respetar la ley laboral boliviana.',
    reglasUso: 'Cualquier persona puede publicar mientras el módulo esté habilitado por Admin.'
  },
  {
    persistirLocal: true, // Guarda automáticamente en localStorage bajo "mita_estado_empleos:configuracion"
    descripcion: 'Controla si el tablón de anuncios de empleo está abierto al público.',
    reglas: 'Solo el administrador puede activar, desactivar o modificar términos.'
  }
);
```

#### Paso B — Componente Público (lee el estado compartido y usa `this.mostrarSi`):

```js
import { MitaElement, obtenerEstadoCompartido } from 'mita-dom';

export class TablonEmpleos extends MitaElement {
  alMontar() {
    const configEmpleos = obtenerEstadoCompartido('empleos:configuracion');

    this.innerHTML = `
      <section class="empleos-box">
        <h2>Bolsa de Empleos</h2>
        <div id="zona-formulario"></div>
      </section>
    `;

    // Render condicional declarativo: se auto-limpia si el componente sale del DOM
    this.mostrarSi({
      estado: configEmpleos,
      contenedor: this.querySelector('#zona-formulario'),
      cuando: (config) => config.habilitado === true,
      mostrar: (config) => `
        <p class="reglas">${config.reglasUso}</p>
        <form id="form-empleo">
          <input name="titulo" placeholder="Ej: Cocinero / Mesero" required />
          <label>
            <input type="checkbox" name="terminos" required />
            Acepto los términos: ${config.terminosCondiciones}
          </label>
          <button type="submit">Publicar Anuncio</button>
        </form>
      `,
      sino: () => `
        <div class="aviso-pausa">
          La publicación de anuncios de empleo está temporalmente desactivada por administración.
        </div>
      `
    });
  }
}
```

#### Paso C — Componente de Administración (modifica el mismo estado compartido):

```js
import { obtenerEstadoCompartido } from 'mita-dom';

// Desde el panel de administración (solo para ADMIN):
const configEmpleos = obtenerEstadoCompartido('empleos:configuracion');

// Al hacer clic en "Desactivar Anuncios", el componente público reacciona al instante:
configEmpleos.patch({ habilitado: false });
```

---

### Ejemplo 3: Efectos Automáticos con Múltiples Signals (`crearEfecto`)

```js
import { crearEstadoLocal, crearEfecto } from 'mita-dom';

const busqueda = crearEstadoLocal('');
const soloActivos = crearEstadoLocal(true);
const anuncios = crearEstadoLocal([]);

const detenerFiltro = crearEfecto(() => {
  const texto = busqueda.get().toLowerCase();
  const activos = soloActivos.get();
  const filtrados = anuncios.get().filter((a) => {
    const coincideTexto = a.titulo.toLowerCase().includes(texto);
    const coincideEstado = activos ? a.estado === 'activo' : true;
    return coincideTexto && coincideEstado;
  });

  console.info(`Anuncios visibles: ${filtrados.length}`);
});

// Cuando ya no se necesite (ej. en alDesmontar):
detenerFiltro();
```

---

### Ejemplo 4: Auditoría de Estados Locales en Panel de Administración (`listarEstadosCompartidos`)

```js
import { listarEstadosCompartidos } from 'mita-dom';

// Muestra en tabla de administración qué estados existen, sus reglas y clave localStorage:
const auditoria = listarEstadosCompartidos();
console.table(auditoria);
```

---

## 4. Reglas de Oro para Equipos y Nuevos Desarrolladores

1. **Un solo patrón de lectura/escritura:** usa siempre `.get()`, `.set()`, `.patch()` y `.update()`.
2. **Nunca uses `display: none` para ocultar funcionalidades sensibles:** usa `renderCondicional` o `this.mostrarSi` para destruir los nodos del DOM cuando una funcionalidad está desactivada.
3. **Usa Event Delegation en `this`:** cuando uses `renderCondicional`, conecta tus `click` y `submit` en el componente raíz (`this.addEventListener(...)`) para que no se pierdan al reconstruir fragmentos.
4. **Registra siempre tus limpiezas:** en `MitaElement`, prefiere `this.escucharEstado()` y `this.mostrarSi()`, o registra manualmente con `this.registrarLimpieza(detener)`.
5. **Documenta las reglas en el propio estado:** aprovecha los campos `descripcion` y `reglas` de `crearEstadoCompartido()` para que el panel de administración pueda auditarlos en vivo.
