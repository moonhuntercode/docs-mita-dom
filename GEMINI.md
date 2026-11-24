# Reglas del Workspace — `example-mita-spa-01-js` (MitaDOM Docs & Laboratorio SPA)

- **Sincronización con `mita-dom`:** En local, `vite.config.js` y `vitest.config.js` enlazan `mita-dom` a `../mita-dom/dist/mita-dom.js` si existe (con fallback a `node_modules` en Vercel).
- **Documentación viva:** Antes de compilar o tras editar docs en `../mita-dom`, ejecutar `node scripts/sync-docs.js`. Todos los enlaces `href="/docs/..."` en `<mita-docs-nav>` deben pasar `test/integridad-rutas.test.js`.
- **Navegación contextual en `<aside id="sidebar">`:** Las sub-navegaciones de `/docs` (`<mita-docs-nav>`) y `/laboratorio` (`<mita-lab-nav>`) viven dentro del `<aside id="sidebar">` con buscador en vivo y acordeones `<details><summary>`.
- **Calidad estricta:** HTML5 semántico sin `<div>` innecesarios, Pure CSS3 Mobile-First con `@scope`, sin CSS muerto (`npm run test:css`), sin `persistKey` duplicados (`npm run lint`) y tests verdes (`npm run test` + `npm run build`).
