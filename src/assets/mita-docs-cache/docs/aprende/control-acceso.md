# 🔒 Control de Acceso Granular (Vistas Ocultas)

En MitaDOM, no necesitas librerías externas de autorización. Al combinar **Signals** (para almacenar el rol del usuario) con **Renderizado Condicional** o **Guards en el Router**, puedes construir sistemas de permisos de nivel empresarial.

## 1. Almacenando el Perfil del Usuario

Primero, crea un Estado Global que almacene si el usuario es `admin`, `user` o `guest`:

```javascript
import { crearEstadoGlobal } from 'mita-dom';

export const estadoAuth = crearEstadoGlobal({
    usuario: 'invitado', // 'admin', 'user', 'invitado'
    token: null
}, { persistKey: 'auth_session' });
```

## 2. Nivel UI: Ocultar Botones o Secciones (Render Condicional)

En tus componentes, suscríbete al estado y oculta partes sensibles del DOM usando la propiedad `display` o inyectando HTML distinto.

<mita-code-editor archivo="admin-panel.js" lenguaje="javascript">
import { MitaElement } from 'mita-dom';
import { estadoAuth } from '../store/authStore.js';

export class PanelAdmin extends MitaElement {
    async render() {
        this.innerHTML = `
            <div>
                <h2>Panel de Control</h2>
                <!-- Contenedor Condicional -->
                <div id="zona-peligrosa"></div>
            </div>
        `;

        const $zonaPeligrosa = this.querySelector('#zona-peligrosa');

        estadoAuth.suscribir(({ usuario }) => {
            if (usuario === 'admin') {
                $zonaPeligrosa.innerHTML = `
                    <button class="btn-rojo">Eliminar Base de Datos</button>
                `;
            } else {
                $zonaPeligrosa.innerHTML = `
                    <p>No tienes permisos para ver las acciones destructivas.</p>
                `;
            }
        });
    }
}
</mita-code-editor>

## 3. Nivel Arquitectura: Guards en el Router

Para evitar que un usuario "averigüe" la URL `/admin` y entre de todos modos, debes interceptar la navegación a nivel del enrutador.

<mita-code-editor archivo="router.js" lenguaje="javascript">
import { estadoAuth } from '../store/authStore.js';

const registroRutas = [
  { path: '/inicio', tag: 'vista-inicio' },
  { 
    path: '/admin', 
    tag: 'vista-admin', 
    meta: { rolesPermitidos: ['admin'] } // 👈 Definimos reglas
  }
];

// Dentro de tu lógica de enrutamiento...
rutaActual.suscribir(async (ruta) => {
    const configRuta = registroRutas.find(r => r.path === ruta);

    // 🛡️ Mita Guard
    if (configRuta && configRuta.meta && configRuta.meta.rolesPermitidos) {
        const { usuario } = estadoAuth.get();
        
        if (!configRuta.meta.rolesPermitidos.includes(usuario)) {
            console.warn('Acceso denegado. Redirigiendo...');
            alert('Acceso Denegado: Esta vista es solo para Administradores.');
            rutaActual.set('/inicio'); // Redirigir
            return; // Abortar renderizado de la vista protegida
        }
    }

    // ... código de renderizado normal ...
});
</mita-code-editor>

## Resumen
Con estas dos técnicas proteges tu aplicación tanto a **Nivel Visual** (ocultando pedazos de UI) como a **Nivel Arquitectura** (bloqueando la carga del chunk de JavaScript entero gracias al Lazy Loading y los Guards).
