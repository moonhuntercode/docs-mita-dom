# 🧩 Guía Visual: Comunicación entre Componentes y Componentes 100% Re-usables (MitaDOM v2.7.0)

- **Fecha:** `2026-11-22`
- **Autor:** Victor Code (Bolivia) — `mita-dom v2.7.0`
- **Demo Interactiva en Vivo:** abre `/laboratorio` en `example-mita-spa-01-js` (Lección 1, Lección 5 y Lección 6).

---

## 1. 📡 ¿Cómo se comunican 2 o más Componentes sin Props Drilling?

En lugar de pasar callbacks por 5 niveles de componentes o usar *Shadow DOM* cerrado, en **MitaDOM v2.7.0** el flujo es directo, auditable y en 3 pasos:

```text
[Componente A: Admin]  ── .patch({ habilitado: false }) ──▶  [📦 Estado Compartido ('empleos:config')]
                                                                       │ (persiste en localStorage)
                                          ┌────────────────────────────┴──────────────────────────┐
                                          ▼                                                       ▼
                           [Componente B: Tablón Público]                          [Componente C: KPIs]
                           renderCondicional() destruye el                         derivar() + crearEfecto()
                           formulario real del DOM al instante                     recalculan métricas solitos
```

### Ejemplo completo y limpio (2 componentes independientes):

```js
// 1) store/empleosStore.js (Una sola fuente de verdad)
import { crearEstadoCompartido } from 'mita-dom';

export const estadoEmpleos = crearEstadoCompartido(
  'empleos:config',
  { habilitado: true, mensaje: 'Abierto al público' },
  {
    persistirLocal: true,
    descripcion: 'Control global del módulo de empleos',
    reglas: 'Solo el administrador cambia habilitado'
  }
);

// 2) componente-admin.js (Emisor)
import { obtenerEstadoCompartido } from 'mita-dom';
const cfg = obtenerEstadoCompartido('empleos:config');
cfg.patch({ habilitado: false, mensaje: 'Pausado por mantenimiento' });

// 3) componente-publico.js (Receptor en cualquier parte de la página)
import { MitaElement, obtenerEstadoCompartido } from 'mita-dom';

export class VistaPublicaEmpleos extends MitaElement {
  alMontar() {
    const cfg = obtenerEstadoCompartido('empleos:config');
    this.innerHTML = `<section id="zona-empleo"></section>`;

    // Auto-limpieza automática al desmontar
    this.mostrarSi({
      estado: cfg,
      contenedor: this.querySelector('#zona-empleo'),
      cuando: (estado) => estado.habilitado,
      mostrar: () => `<form>Formulario de Empleo Activo</form>`,
      sino: (estado) => `<p>⏸️ ${estado.mensaje}</p>`
    });
  }
}
```

---

## 2. ♻️ Cómo diseñar Componentes 100% Re-usables (Light DOM + Atributos + `emit()`)

Un componente es **verdaderamente re-usable** cuando puedes colocar la misma etiqueta HTML 3, 10 o 50 veces en distintas vistas sin duplicar lógica ni mezclar estados internos.

### Los 4 Pilares de Re-usabilidad en MitaDOM

1. **Configuración por Atributos HTML (`this.getAttribute(...)` o `this.props`):** pasa `titulo`, `variante`, `texto-accion` o `estado-clave`.
2. **Aislamiento visual con CSS `@scope` (sin Shadow DOM):** hereda las variables `:root` del tema y no contamina el exterior.
3. **Comunicación hacia arriba con eventos nativos (`this.emit('mi-evento', payload)`):** el componente NO asume qué hará el padre; solo emite un evento estándar.
4. **Estado Local aislado por instancia (`crearEstadoLocal`) o conectado por clave (`obtenerEstadoCompartido(clave)`):** cada instancia mantiene sus propios contadores/flags, o comparte un estado específico solo cuando se lo indicas por atributo.

### Ejemplo de Web Component 100% Re-usable: `<mita-tarjeta-accion>`

```html
<!-- Instancia 1: Verde, acción de publicar -->
<mita-tarjeta-accion
  titulo="Anuncios de Empleo"
  subtitulo="Abierto sin iniciar sesión"
  variante="exito"
  texto-accion="Publicar oferta"
></mita-tarjeta-accion>

<!-- Instancia 2: Ámbar, acción de auditar -->
<mita-tarjeta-accion
  titulo="Reglas y Términos"
  subtitulo="Persistidos en localStorage + MySQL"
  variante="alerta"
  texto-accion="Revisar reglas"
></mita-tarjeta-accion>

<!-- Instancia 3: Índigo, acción de estadísticas -->
<mita-tarjeta-accion
  titulo="Inspector de Signals"
  subtitulo="Monitoreo en tiempo real"
  variante="info"
  texto-accion="Auditar estados"
></mita-tarjeta-accion>
```

```js
import { MitaElement, crearEstadoLocal, vincularTexto } from 'mita-dom';

export class MitaTarjetaAccion extends MitaElement {
  alMontar() {
    // 1. Estado privado de ESTA instancia (no colisiona con las otras instancias)
    this.estadoLocal = crearEstadoLocal({ clics: 0 });

    // 2. Leer atributos declarativos (props)
    const titulo = this.getAttribute('titulo') || 'Tarjeta';
    const subtitulo = this.getAttribute('subtitulo') || '';
    const variante = this.getAttribute('variante') || 'info';
    const textoAccion = this.getAttribute('texto-accion') || 'Ejecutar';

    this.innerHTML = `
      <article class="tarjeta-reusable variante-${variante}">
        <header>
          <h3>${titulo}</h3>
          <small class="badge-clics"></small>
        </header>
        <p>${subtitulo}</p>
        <button type="button" class="btn-accion">${textoAccion}</button>
      </article>
    `;

    // 3. Binding granular del contador propio + auto-limpieza
    const stop = vincularTexto(
      this.estadoLocal,
      this.querySelector('.badge-clics'),
      (e) => `${e.clics} usos`
    );
    this.registrarLimpieza(stop);

    // 4. Emitir evento estándar al padre para desacoplar la acción de negocio
    const onClick = (ev) => {
      if (!ev.target.closest('.btn-accion')) return;
      const siguientes = this.estadoLocal.get().clics + 1;
      this.estadoLocal.patch({ clics: siguientes });
      this.emit('tarjeta-accion', { titulo, variante, clics: siguientes });
    };
    this.addEventListener('click', onClick);
    this.registrarLimpieza(() => this.removeEventListener('click', onClick));
  }
}

customElements.define('mita-tarjeta-accion', MitaTarjetaAccion);
```

---

## 3. ⚡ Comando Único Automatizado (`npm run qa`)

Para no repetir pasos manuales en cada cambio:
- En `mita-dom`: `npm run qa` ejecuta `docs:auto → build → lint → lint:css → test`.
- En `example-mita-spa-01-js`: `npm run qa` ejecuta `sync-docs → lint → test:css → test → build`.
