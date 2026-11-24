# 📡 Signals en Profundidad y su Uso en SSR, SSG, Hybrid e Islas (`v2.7.0`)

En `mita-dom` no existe el **Virtual DOM**. Cuando un dato cambia, no re-ejecutamos árboles enteros de componentes ni comparamos miles de nodos virtuales: el `Signal` notifica **directamente** al único `TextNode`, atributo o fragmento condicional que depende de ese dato.

---

## 1. Anatomía Completa de un `Signal` en Mita-DOM v2.7

Un `Signal` es un contenedor reactivo e inmutable con métodos explícitos y claros:

| Método | Propósito | Ejemplo |
| --- | --- | --- |
| `.get()` | Lee el valor actual (y se auto-registra si está dentro de `crearEfecto`). | `const actual = contador.get();` |
| `.set(nuevoValor)` | Reemplaza el valor completo y notifica a los suscriptores si cambió. | `contador.set(10);` |
| `.patch(objetoParcial)` | Fusiona propiedades superficiales cuando el estado es un objeto. | `usuario.patch({ rol: 'ADMIN' });` |
| `.update(fn)` | Calcula el siguiente valor a partir del valor actual. | `contador.update((n) => n + 1);` |
| `.derivar(fn)` | Crea un `SignalDerivado` de solo lectura sincronizado con el padre. | `const doble = contador.derivar((n) => n * 2);` |
| `.suscribir(cb)` | Ejecuta `cb` ahora y en cada cambio; **retorna `desuscribir()`**. | `const stop = contador.suscribir(console.log);` |
| `.reset()` | Restaura el valor inicial de fábrica con el que se creó el Signal. | `contador.reset();` |

---

## 2. Los 3 Niveles de Estado: Local, Compartido e Inmutable (Estilo Rust 🦀)

### Nivel 1: Estado Local (`crearEstadoLocal`) — Para un solo componente
```javascript
import { MitaElement, crearEstadoLocal, vincularTexto } from 'mita-dom';

export class ContadorGranular extends MitaElement {
  render() {
    const estado = crearEstadoLocal({ clics: 0 });
    this.innerHTML = `<button id="btn">+1</button> <output id="out"></output>`;

    // Actualiza SOLO el TextNode dentro de <output> (0 innerHTML re-render)
    const detenerTexto = vincularTexto(
      estado,
      this.querySelector('#out'),
      (st) => `Clics: ${st.clics}`
    );
    this.registrarLimpieza(detenerTexto);

    this.querySelector('#btn').addEventListener('click', () => {
      estado.patch({ clics: estado.get().clics + 1 });
    });
  }
}
```

### Nivel 2: Estado Compartido (`crearEstadoCompartido` + `obtenerEstadoCompartido`)
Permite que 2, 3 o 10 componentes en distintas partes de la pantalla (y en distintas rutas) compartan datos y los persistan en `localStorage` sin *Props Drilling*:

```javascript
import {
  crearEstadoCompartido,
  obtenerEstadoCompartido,
  listarEstadosCompartidos
} from 'mita-dom';

// En store/empleosStore.js
export const configEmpleos = crearEstadoCompartido(
  'empleos:config',
  { habilitado: true, requiereLogin: false },
  {
    persistirLocal: true,
    descripcion: 'Configuración del módulo de anuncios laborales',
    reglas: 'Modificable desde el Panel Admin; leído por el Tablón Público'
  }
);

// En cualquier otro componente sin importar el archivo del store:
const cfg = obtenerEstadoCompartido('empleos:config');
cfg.patch({ habilitado: false });

// Para auditar todos los estados compartidos de la app:
console.table(listarEstadosCompartidos());
```

### Nivel 3: Estado Protegido por Borrow Checker de Rust (`crearEstadoReactivoInmutable`)
Cuando quieres **claridad máxima, protección contra mutaciones directas accidentales e historial auditable de por qué cambió cada dato**:

```javascript
import {
  crearEstadoReactivoInmutable,
  leerEstadoInmutable,
  mutarEstadoConHistorial,
  obtenerHistorialDeMutaciones
} from 'mita-dom';

const inventario = crearEstadoReactivoInmutable(
  'tienda:inventario',
  { stockPlatos: 40, abierto: true },
  { compartidoEntreComponentes: true, persistirEnLocalStorage: true }
);

// 1. Préstamo Inmutable (&T): el objeto devuelto está congelado (Object.freeze)
const vista = leerEstadoInmutable(inventario);
// vista.stockPlatos = 0; // ❌ Lanza TypeError inmediato!

// 2. Préstamo Mutable (&mut T) con motivo explícito:
mutarEstadoConHistorial(
  inventario,
  (actual) => ({ ...actual, stockPlatos: actual.stockPlatos - 1 }),
  'Venta de 1 Majadito en mesa #4'
);

console.log(obtenerHistorialDeMutaciones(inventario));
```

---

## 3. 🌐 Cómo Funcionan los Signals en `SSR`, `SSG`, `Hybrid (Islands)` y `CSR`

Una duda frecuente es: *¿Cómo conviven los Signals con el renderizado en servidor (`SSR` / `SSG` / `Hybrid`)?*

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. SERVIDOR (Node.js — SSR / SSG / Hybrid)                                  │
│    • onInit(contexto) carga datos (ej. MySQL ORM) y llama a signal.set().   │
│    • MitaMeta.useHead() guarda <title> y <meta> en el Signal SEO.           │
│    • render() lee signal.get() UNA sola vez para producir HTML limpio.      │
│    • Las islas <tag mita-client="only"> se vacían para no fallar en Node.   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. CLIENTE (Navegador — Hidratación Selectiva / SPA)                        │
│    • Las islas <tag mita-server="only"> NO se re-renderizan (0 costo CPU).  │
│    • Los componentes interactivos conectan sus Signals con vincularTexto(), │
│      renderCondicional() y crearAmbitoConLimpiezaAutomatica().              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Cómo Cambiar o Desactivar Estrategias de Render en Vistas Específicas

Con `crearControladorEstrategiaPorVista()` puedes decidir granularmente qué estrategia usa cada ruta o incluso desactivar una vista en mantenimiento:

```javascript
import { crearControladorEstrategiaPorVista } from 'mita-dom';

const controlVistas = crearControladorEstrategiaPorVista();

// 1. Cambiar /empleos de SSR a Hybrid con Islas en caliente:
controlVistas.cambiarModoDeVistaEnCaliente('/empleos', 'hybrid');

// 2. Cambiar /admin a CSR puro (sin SSR):
controlVistas.cambiarModoDeVistaEnCaliente('/admin', 'csr');

// 3. Desactivar temporalmente una vista específica por mantenimiento:
controlVistas.activarODesactivarVista('/empleos', false);
```
