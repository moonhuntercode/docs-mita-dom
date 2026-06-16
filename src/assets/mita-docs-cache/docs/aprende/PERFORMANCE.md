# Optimización y Performance (Rendimiento)

MitaDOM está diseñado con la obsesión por el rendimiento extremo, apuntando a superar las métricas Core Web Vitals de Google desde el día cero. A continuación, detallamos las técnicas y arquitecturas que garantizan que tu aplicación vuele en dispositivos de gama baja y redes 3G.

## 1. Zero Virtual DOM

A diferencia de React o Vue, MitaDOM **no utiliza un Virtual DOM**. 
El Virtual DOM requiere mantener una copia en memoria de todo el árbol HTML de la aplicación, y en cada actualización de estado, ejecuta un costoso algoritmo de reconciliación (diffing) para calcular qué cambió.

**MitaDOM y Signals**:
Al usar Signals, MitaDOM aplica actualizaciones *quirúrgicas* (O(1)). Cuando el valor de un Signal cambia, MitaDOM no re-renderiza todo el componente ni compara árboles; simplemente ejecuta los callbacks que estaban escuchando específicamente esa variable y muta exactamente el nodo de texto o atributo que necesitaba cambiar.

## 2. Code Splitting (Carga Perezosa)

La SPA está configurada con **Lazy Loading** a nivel de rutas.
- En lugar de descargar todo el JavaScript del sitio en un único archivo inmenso `bundle.js`, MitaDOM separa tu aplicación por vistas.
- Si el usuario nunca entra al `/perfil`, el navegador **nunca** descarga el código, CSS ni dependencias asociados al perfil. Esto reduce dramáticamente el *Time to Interactive (TTI)* y el consumo de ancho de banda.

## 3. View Transitions API (Animaciones de 60 FPS)

Las animaciones CSS y JavaScript tradicionales suelen causar *Layout Thrashing* (reflujos constantes en el motor de renderizado del navegador).
MitaDOM integra nativamente `document.startViewTransition`. Esta API delega el cálculo de las animaciones directamente al motor gráfico del navegador (GPU), tomando "capturas de pantalla" del estado viejo y el estado nuevo, y fundiéndolos suavemente a 60 cuadros por segundo sin bloquear el Hilo Principal de JS.

## 4. Telemetry y Profiler Integrado

MitaDOM incluye el `mita-profiler`, que monitorea en tiempo real:
- **FPS (Cuadros por Segundo)**
- **Uso de Memoria RAM (JS Heap Size)**
- **Tiempo de Montaje y Latencia (INP - Interaction to Next Paint)**

Este profiler no es solo cosmético; expone un `telemetryStore.js` donde los componentes registran métricas automáticamente (usando el decorador nativo `MitaElement`), ayudándote a identificar cuellos de botella en producción antes de que tus usuarios se quejen.

## 5. Estrategias Adicionales Soportadas

Para escalar el rendimiento de tu MitaDOM SPA:
- **Service Workers (PWA)**: Implementa caché offline para que la app cargue en 0ms en visitas recurrentes.
- **Web Workers**: Si procesas grandes volúmenes de datos JSON, delégalo a un Worker para no congelar el hilo principal.
- **Importaciones `?raw`**: Para grandes bloques de HTML (como en `demo-estados`), usamos el sufijo `?raw` de Vite para inyectar plantillas de forma síncrona sin sobrecargar la memoria con literales de plantilla gigantes dentro del JS.
