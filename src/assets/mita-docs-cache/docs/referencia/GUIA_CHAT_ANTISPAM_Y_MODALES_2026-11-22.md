# 💬 Guía Práctica: Chats con Control Anti-Spam, Filtración, Modales de Novedades y Docs con DB Local

- **Fecha:** `2026-11-22`
- **Versión:** `mita-dom v2.7.0`
- **Autor:** Victor Code (Bolivia)
- **Demo en Vivo:** `/laboratorio` (Lección 7) y `/docs` (Buscador + Editor en DB Local).

---

## 1. 🛡️ Cómo crear un Chat con Control Anti-Spam (`crearControlSpam`)

Cuando construyes un chat comunitario, soporte en vivo o caja de comentarios, necesitas evitar que un usuario inunde la pantalla (*flood/cooldown*), repita el mismo texto o publique enlaces/palabras de spam. `mita-dom` incluye `crearControlSpam()` listo para usar:

```js
import {
  crearEstadoCompartido,
  crearControlSpam
} from 'mita-dom';

// 1. Estado compartido de los mensajes del chat (persistido en localStorage)
export const estadoMensajesChat = crearEstadoCompartido(
  'chat:mensajes_sala',
  [
    { id: 1, autor: 'Victor Code', canal: 'novedades', texto: '¡Bienvenidos al chat de MitaDOM v2.7!' }
  ],
  {
    persistirLocal: true,
    descripcion: 'Historial local de mensajes y novedades del chat',
    reglas: 'Protegido por crearControlSpam (cooldown 1.2s + bloqueo de spam)'
  }
);

// 2. Configurar el guardián Anti-Spam
const guardianChat = crearControlSpam({
  cooldownMs: 1200,
  maxLongitud: 220,
  palabrasProhibidas: ['spam', 'casino', 'phishing', 'estafa'],
  bloquearLinks: true,
  bloquearDuplicados: true
});

// 3. Validar antes de agregar al Signal
export function enviarMensajeSeguro(autor, texto, canal = 'general') {
  const resultado = guardianChat.evaluarMensaje(texto, autor);

  if (!resultado.permitido) {
    // Muestra el motivo exacto (ej: "espera 0.9s" o "mensaje duplicado")
    return { ok: false, error: resultado.motivo };
  }

  const nuevo = {
    id: Date.now(),
    autor,
    canal,
    texto: resultado.textoLimpio
  };

  estadoMensajesChat.set([...estadoMensajesChat.get(), nuevo]);
  return { ok: true, mensaje: nuevo };
}
```

---

## 2. 🔍 Cómo filtrar y buscar en Chats, Novedades o Documentación (`filtrarColeccion`)

Combina un `Signal` de mensajes o documentos con un `Signal` de filtros usando `filtrarColeccion()`:

```js
import { crearEstadoLocal, crearEfecto, filtrarColeccion } from 'mita-dom';

const filtrosUI = crearEstadoLocal({ busqueda: '', categoria: 'todos' });

const detener = crearEfecto(() => {
  const { busqueda, categoria } = filtrosUI.get();

  const visibles = filtrarColeccion(estadoMensajesChat.get(), {
    busqueda,
    categoria,
    campoCategoria: 'canal',
    camposTexto: ['autor', 'texto']
  });

  renderizarLista(visibles);
});
```

---

## 3. 🪟 Modal / Dialog Nativo Re-utilizable en Light DOM (`<mita-dialog>`) para Novedades

En MitaDOM prohibimos Shadow DOM incluso en modales. Usa el elemento nativo `<dialog>` envuelto en un Web Component Light DOM para publicar **Novedades y Notificaciones**:

```html
<mita-dialog id="modal-publicar-novedad">
  <span slot="titulo">📣 Publicar Novedad Oficial</span>
  <form id="form-novedad">
    <input name="titulo" placeholder="Título de la versión o aviso" required />
    <textarea name="detalle" placeholder="Describe la novedad..." required></textarea>
    <button type="submit">Publicar Ahora</button>
  </form>
</mita-dialog>
```

```js
const modal = document.querySelector('#modal-publicar-novedad');
modal.abrir();  // Llama a dialog.showModal() nativo con accesibilidad de teclado
modal.cerrar(); // Cierra con transición suave
```

---

## 4. 🗄️ Documentación Auto-Administrable con DB Local (`localStorage` + `IndexedDB`)

En `/docs` de `example-mita-spa-01-js`, cualquier documento Markdown puede **editarse o crearse desde el navegador**:
1. Los cambios se guardan en un `Signal` compartido (`docs:locales_db`) sincronizado con `localStorage` e `IndexedDBAdapter`.
2. Al abrir `/docs/:id`, el lector prioriza la versión editada en tu DB Local sobre el archivo estático, permitiendo corregir, ampliar o agregar nuevas guías en vivo y restaurar el original con 1 clic.
