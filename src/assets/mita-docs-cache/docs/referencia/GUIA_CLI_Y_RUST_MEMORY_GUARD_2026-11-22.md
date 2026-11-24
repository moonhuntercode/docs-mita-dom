# 🦀 Guía de Protección de Memoria Estilo Rust, Sintaxis Verbosa y CLI `npx mita` (2026-11-22)

Esta guía documenta las herramientas incorporadas en `mita-dom v2.7.0` para proteger tus aplicaciones contra fugas de memoria y acelerar la creación de componentes mediante el CLI.

---

## 1. 🦀 Conceptos de Rust Aplicados en `mita-dom` (`src/core/rustGuard.js`)

### 1.1 Borrow Checker Inmutable (`&T`) vs Préstamo Mutable (`&mut T`)
En JavaScript tradicional, si haces `const cfg = signal.get(); cfg.habilitado = false;`, corrompes el estado interno sin notificar a ningún componente.

Con `crearEstadoReactivoInmutable`, `leerEstadoInmutable` y `mutarEstadoConHistorial`, `mita-dom` aplica las reglas de préstamo de Rust:

```javascript
import {
  crearEstadoReactivoInmutable,
  leerEstadoInmutable,
  mutarEstadoConHistorial,
  obtenerHistorialDeMutaciones
} from 'mita-dom';

const estadoCuenta = crearEstadoReactivoInmutable('banco:cuenta', {
  titular: 'Victor Code',
  saldoBs: 1500
});

// 1. Préstamo Inmutable (&T): devuelve un objeto profundamente congelado
const lectura = leerEstadoInmutable(estadoCuenta);
// lectura.saldoBs = 999999; // ❌ Lanza TypeError inmediato (protegido por Borrow Checker)

// 2. Préstamo Mutable (&mut T) con motivo obligatorio para auditoría:
mutarEstadoConHistorial(
  estadoCuenta,
  (actual) => ({ ...actual, saldoBs: actual.saldoBs + 500 }),
  'Depósito por proyecto MitaDOM v2.7'
);

// 3. Consultar historial auditable de cambios:
console.table(obtenerHistorialDeMutaciones(estadoCuenta));
```

### 1.2 Ownership & RAII Auto-Drop (`crearAmbitoConLimpiezaAutomatica`)
Inspirado en el trait `Drop` de Rust: cada componente registra sus suscripciones, efectos, listeners del DOM e intervalos dentro de un ámbito propietario. Al desmontarse, una sola llamada a `liberarMemoriaCompleta()` libera el 100% de recursos y bloquea cualquier intento de *Use-After-Free*:

```javascript
import { MitaElement, crearAmbitoConLimpiezaAutomatica } from 'mita-dom';

export class MiRelojSeguro extends MitaElement {
  constructor() {
    super();
    this.ambito = crearAmbitoConLimpiezaAutomatica('<mi-reloj-seguro>');
  }

  render() {
    this.ambito.reiniciarAmbitoParaNuevoRender();
    this.innerHTML = `<button id="btn-ping">Ping</button><output id="out"></output>`;

    this.ambito.escucharEventoDomConLimpieza(
      this.querySelector('#btn-ping'),
      'click',
      () => { this.querySelector('#out').textContent = 'Pong!'; }
    );

    this.ambito.programarIntervaloConLimpieza(() => {
      console.log('Latido activo mientras el componente viva en el DOM');
    }, 5000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // 🦀 Drop: libera listeners, signals, efectos y timers con 0 fugas
    this.ambito.liberarMemoriaCompleta();
  }
}
```

---

## 2. 🛠️ Mita-DOM CLI (`npx mita`) — Inspirado en Angular, Vue, SolidJS y Cargo

El CLI oficial vive en `bin/mita.js` (y su motor isomórfico en `src/utils/cliSimulator.js` para que puedas probarlo también desde el navegador en `/laboratorio`).

### Comandos Disponibles

1. **Generar un Web Component Light DOM completo (`.js` + `.css` con `@scope` + `.test.js`):**
   ```bash
   npx mita g component TarjetaEmpleo
   ```
2. **Generar un Store Compartido con Inmutabilidad Rust (`&T` / `&mut T`) y Persistencia:**
   ```bash
   npx mita g store carritoCompras
   ```
3. **Generar una Página Universal (`SSR`, `SSG`, `Hybrid` o `SPA`) con SEO `MitaMeta`:**
   ```bash
   npx mita g page Catalogo --hybrid
   ```
4. **Ejecutar el Doctor de Arquitectura y Memoria (`mita doctor`):**
   ```bash
   npx mita doctor
   ```
