// @ts-check
import { Logger } from './logger.js';
import packageJson from '../../package.json';

const CURRENT_VERSION = packageJson.dependencies['mita-dom']?.replace(/[\^~]/g, '') || '0.0.0';
const REGISTRY_URL = 'https://registry.npmjs.org/mita-dom/latest';

/**
 * Comprueba si hay una nueva versión de MitaDOM disponible en NPM
 * y emite una alerta elegante en consola y telemetría si es así.
 */
export async function checkMitaDomVersion() {
    try {
        const response = await fetch(REGISTRY_URL);
        if (!response.ok) return;

        const data = await response.json();
        const latestVersion = data.version;

        if (isNewerVersion(CURRENT_VERSION, latestVersion)) {
            const message = `
MitaDOM ${CURRENT_VERSION}

   A new MitaDOM stable release is available: v${latestVersion}
   Upgrade now by running: npm install mita-dom@latest
   Or check out the release page at:
     https://www.npmjs.com/package/mita-dom

`;
            // Mostramos como un Warning para que resalte
            Logger.warn(message);
        }
    } catch (err) {
        // Fallo silencioso si no hay internet, no es crítico
        if (import.meta.env.DEV) {
            console.debug('[MitaDOM VersionCheck] Error de red:', err);
        }
    }
}

/**
 * Compara dos versiones semánticas (x.y.z)
 * @returns {boolean} true si 'latest' es mayor que 'current'
 */
function isNewerVersion(current, latest) {
    const v1 = current.split('.').map(Number);
    const v2 = latest.split('.').map(Number);

    for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
        const num1 = v1[i] || 0;
        const num2 = v2[i] || 0;
        if (num2 > num1) return true;
        if (num2 < num1) return false;
    }
    return false;
}
