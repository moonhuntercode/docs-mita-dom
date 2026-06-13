# 🚀 ¡MitaDOM v2.2.0 ha llegado!
*Publicado el 12 de Junio de 2026*

Nos enorgullece anunciar la mayor actualización de MitaDOM hasta la fecha. Hemos escuchado a la comunidad y reconstruido la arquitectura de Signals para hacerla aún más predecible e inmutable.

## ✨ Novedades Principales

1. **Signals Inmutables**: Ahora puedes instanciar un Signal asegurando que nadie mutará sus datos sin pasar por tu interceptor.
2. **Mita Profiler Integrado**: No necesitas extensiones de Chrome pesadas. Nuestro Profiler flota en tu SPA y te avisa con luces rojas cuando tu código rompe la barrera de los 60FPS (16.6ms).
3. **Portal de Docs Interactivo**: Como estás viendo justo ahora, el SPA de MitaDOM es capaz de renderizar su propio contenido Markdown sin Virtual DOMs destructivos.

## 🐛 Bug Fixes
- **Router SPA**: Corregimos un problema por el que el Evento `navigate` utilizaba la API `.value` deprecada. Ahora el Router nativo utiliza `rutaActual.set()`, respetando el ciclo de vida de interceptores.

> ¡Gracias a todos los contribuidores por hacer que la web vuelva a ser rápida, simple y limpia!
