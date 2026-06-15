# Guía Definitiva: Rutas Dinámicas con URLPattern

El enrutamiento (Routing) en una Single Page Application (SPA) define qué vistas se muestran basándose en la URL. Pero, ¿qué pasa cuando la URL es dinámica? Por ejemplo:
- `/blog/novedades-v2`
- `/perfil/4582`
- `/docs/filosofia`

En estos casos, no podemos registrar mil rutas fijas en nuestro diccionario. Aquí es donde brilla el estándar **URLPattern**.

## ¿Qué es URLPattern?

`URLPattern` es una **API Nativa de la Plataforma Web** (Web Platform API) diseñada para resolver exactamente este problema. A diferencia de soluciones como React Router (que trae su propio parser masivo de URLs pesando KBs), los navegadores modernos ya saben cómo hacer *pattern matching* de manera ultrarrápida (Escrito en C++ bajo el capó).

### Ejemplo Básico

```javascript
// Definimos un patrón que espera un parámetro ":slug"
const patternBlog = new URLPattern({ pathname: '/blog/:slug' });

// Ejecutamos el patrón contra la ruta actual de la SPA
let match = patternBlog.exec({ pathname: '/blog/mi-primer-post' });

if (match) {
    // URLPattern mágicamente extrae las variables por nosotros
    console.log(match.pathname.groups.slug); // Imprime: "mi-primer-post"
} else {
    console.log("No coincide.");
}
```

## Casos de Uso Comunes

### 1. Extracción de Identificadores (IDs)
Imagina un Dashboard de usuarios.

```javascript
const patternUsuario = new URLPattern({ pathname: '/usuario/:id/configuracion' });
const match = patternUsuario.exec({ pathname: '/usuario/4815/configuracion' });

if (match) {
    const userId = match.pathname.groups.id; // "4815"
    // Hacemos Fetch de los datos de este usuario...
    fetch(`/api/users/${userId}`);
}
```

### 2. Filtros y Parámetros Opcionales
Puedes atrapar "Wildcards" o comodines.

```javascript
const patternFiltro = new URLPattern({ pathname: '/tienda/zapatos/*' });
const match = patternFiltro.exec({ pathname: '/tienda/zapatos/deportivos/rojos' });

if (match) {
    // Todo lo que está después de zapatos/ es capturado por el índice 0
    console.log(match.pathname.groups['0']); // "deportivos/rojos"
}
```

## Implementación en el Router de MitaDOM

En nuestro `router.js`, usamos `URLPattern` como un "Guardia de Tráfico". Antes de buscar en nuestro catálogo de rutas fijas, revisamos si la ruta pedida coincide con un patrón dinámico.

```javascript
// 1. Declaración
const patternDocs = new URLPattern({ pathname: '/docs/:id' });

rutaActual.suscribir((ruta) => {
    // 2. Comprobación
    let matchDocs = patternDocs.exec({ pathname: ruta });
    
    // 3. Normalización
    // Si la ruta dinámica coincide, engañamos al Router para que 
    // cargue el componente genérico '/docs'
    let rutaFisica = matchDocs ? '/docs' : ruta; 
    const configRuta = registroRutas.find(r => r.path === rutaFisica);

    // 4. Inyección de Estado
    if (matchDocs) {
        // Le pasamos el slug extraído al Store. 
        // El componente <mita-docs> escucha este Store y cambia su Markdown.
        estadoDocActivo.set(matchDocs.pathname.groups.id);
    }
});
```

## Beneficios del Enfoque "Platform First"

1. **Rendimiento:** 0 bytes de dependencias añadidas a tu bundle.
2. **Estándar Abierto:** Estás aprendiendo JavaScript real, no la sintaxis propietaria de un framework que podría desaparecer mañana.
3. **Escalabilidad:** Al combinar `URLPattern` con el sistema de **Signals** (estado), puedes tener componentes totalmente reactivos y agnósticos de la ruta. El router solo inyecta el ID, y el componente hace el resto.
