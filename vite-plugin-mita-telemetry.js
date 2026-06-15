// @ts-check
import fs from 'fs';
import path from 'path';

/**
 * 🛠️ Vite Plugin Mita Telemetry
 * Intercepta los errores fatales durante el ciclo de vida del build (Rollup/Vite)
 * y los guarda en un archivo `build-errors.json` para que el Dashboard pueda
 * recogerlos y mostrarlos.
 */
export default function mitaTelemetryPlugin() {
  return {
    name: 'vite-plugin-mita-telemetry',
    
    // Capturamos cualquier error en la resolución o transformación
    buildEnd(error) {
      if (error) {
        const errorData = {
          timestamp: new Date().toISOString(),
          nivel: 'ERROR',
          mensaje: `[Build Error] ${error.message}`,
          stackTrace: error.stack || JSON.stringify(error, null, 2),
          url: 'Node (Vite Build)',
        };

        const targetDir = path.resolve(process.cwd(), 'public');
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        const logFile = path.resolve(targetDir, 'mita-build-errors.json');
        
        let existingLogs = [];
        if (fs.existsSync(logFile)) {
          try {
            existingLogs = JSON.parse(fs.readFileSync(logFile, 'utf-8'));
          } catch (e) {
            existingLogs = [];
          }
        }

        existingLogs.push(errorData);

        // Guardamos máximo los últimos 50 errores de build
        if (existingLogs.length > 50) {
          existingLogs.shift();
        }

        fs.writeFileSync(logFile, JSON.stringify(existingLogs, null, 2), 'utf-8');
      }
    }
  };
}
