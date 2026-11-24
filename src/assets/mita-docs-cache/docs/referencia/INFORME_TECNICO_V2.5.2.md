# INFORME TÉCNICO V2.5.2 🚀

## Resolución de Errores y Profiling de Motor Reactivo

Este informe detalla las correcciones de rendimiento asíncrono y los bugs solventados en el núcleo de Signals y herramientas DX.

### 🐛 Errores Resueltos
1. **Uncaught (in promise) Error (versionCheck):**
   - *Problema:* El verificador de versiones `checkMitaDomVersion` realizaba solicitudes fetch al registro de NPM que podían quedar colgadas o interrumpidas por el HMR (Hot Module Replacement) de Vite u otras extensiones del navegador, dejando Promesas sin resolver y causando advertencias de "asynchronous response".
   - *Solución:* Implementación de `AbortController` nativo con un timeout estricto de 3 segundos y manejo silencioso de excepciones de red. Ahora el chequeo es 100% no-bloqueante.

2. **Error en Vitest JSDOM (`ComputedSignal is not a constructor`):**
   - *Problema:* Una regresión en las pruebas automatizadas (granular.test.js) que apuntaba a una clase de estado derivado obsoleta (`ComputedSignal`).
   - *Solución:* Refactorización del test suite para alinearse con la arquitectura oficial `SignalDerivado`, restaurando la cobertura de pruebas de Reactividad Granular al 100%.

### 🧪 Nueva Cobertura (Vitest)
Se introdujeron pruebas específicas para la resiliencia de promesas asíncronas de diagnóstico (`versionCheck.test.js`), simulando interrupciones de red y verificando que el motor principal nunca interrumpa su ciclo normal.
