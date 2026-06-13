/**
 * 🗄️ Backend de Telemetría (Node.js Puro)
 * Escucha en el puerto 4000 y escribe los logs enviados por la SPA
 * en un archivo local `sistema_logs.json`. Funciona como una base de datos persistente simple.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 4000;
const LOG_FILE = path.join(__dirname, 'sistema_logs.json');

// Crear el archivo de logs si no existe
if (!fs.existsSync(LOG_FILE)) {
  fs.writeFileSync(LOG_FILE, '[]', 'utf8');
}

const server = http.createServer((req, res) => {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Handle Log POST request
  if (req.method === 'POST' && req.url === '/api/logs') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const logEntry = JSON.parse(body);
        
        // Leer el archivo, parsear, hacer append y volver a guardar
        const logsActuales = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
        logsActuales.push(logEntry);
        
        fs.writeFileSync(LOG_FILE, JSON.stringify(logsActuales, null, 2), 'utf8');
        
        console.log(`[TELEMETRY] Log recibido y guardado: [${logEntry.nivel}]`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(400);
        res.end('Error parsing JSON log');
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`📡 Servidor de Telemetría corriendo en http://localhost:${PORT}`);
  console.log(`💾 Los logs se guardarán persistentemente en: ${LOG_FILE}`);
});
