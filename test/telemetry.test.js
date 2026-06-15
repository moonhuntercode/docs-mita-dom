import { describe, it, expect, beforeEach } from 'vitest';
import { telemetryStore, registrarTelemetria, limpiarTelemetria } from '../src/store/telemetryStore.js';
// Fake IndexedDB ya inyectado globalmente en vite.config.js para el entorno JSDOM

describe('Telemetry Store & Persistence', () => {
    beforeEach(async () => {
        await limpiarTelemetria();
    });

    it('Debe inicializar vacío', () => {
        expect(telemetryStore.get().logs.length).toBe(0);
    });

    it('Debe registrar un nuevo log en el store reactivo', async () => {
        await registrarTelemetria('INFO', 'Mensaje de prueba');
        const estado = telemetryStore.get();
        expect(estado.logs.length).toBe(1);
        expect(estado.logs[0].nivel).toBe('INFO');
        expect(estado.logs[0].mensaje).toBe('Mensaje de prueba');
        expect(estado.logs[0].timestamp).toBeDefined();
    });

    it('Debe ordenar los logs colocando el más reciente de primero', async () => {
        await registrarTelemetria('INFO', 'Log 1');
        await registrarTelemetria('ERROR', 'Log 2');
        
        const estado = telemetryStore.get();
        expect(estado.logs.length).toBe(2);
        expect(estado.logs[0].mensaje).toBe('Log 2'); // El último en entrar es el primero
        expect(estado.logs[1].mensaje).toBe('Log 1');
    });

    it('Debe limpiar la telemetría correctamente', async () => {
        await registrarTelemetria('WARN', 'Peligro');
        expect(telemetryStore.get().logs.length).toBe(1);
        
        await limpiarTelemetria();
        expect(telemetryStore.get().logs.length).toBe(0);
    });

    it('Debe extraer y guardar el stack trace si se pasa en datosExtra', async () => {
        const fakeError = new Error('Soy un error fatal');
        await registrarTelemetria('ERROR', fakeError.message, [{ stackTrace: fakeError.stack }]);

        const estado = telemetryStore.get();
        expect(estado.logs.length).toBe(1);
        expect(estado.logs[0].nivel).toBe('ERROR');
        expect(estado.logs[0].stackTrace).toContain('Error: Soy un error fatal');
    });

    it('Debe poder eliminar un log de manera individual', async () => {
        await registrarTelemetria('INFO', 'Log A');
        await registrarTelemetria('INFO', 'Log B');
        
        const logsIniciales = telemetryStore.get().logs;
        expect(logsIniciales.length).toBe(2);
        
        const logAEliminar = logsIniciales.find(l => l.mensaje === 'Log A');
        
        // Importar eliminarLog dinámicamente para el test
        const { eliminarLog } = await import('../src/store/telemetryStore.js');
        await eliminarLog(logAEliminar.idLocal);
        
        const logsFinales = telemetryStore.get().logs;
        expect(logsFinales.length).toBe(1);
        expect(logsFinales[0].mensaje).toBe('Log B');
    });
});
