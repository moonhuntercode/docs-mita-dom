import globals from "globals";

/**
 * 🛠️ Regla Personalizada: mita-no-duplicate-persist-keys
 * Analiza estáticamente el AST para encontrar `new Signal(..., { persistKey: 'XXX' })`
 * y asegura que no se repitan los nombres, evitando colisiones en LocalStorage/IndexedDB.
 */
const mitaNoDuplicatePersistKeys = {
    meta: {
        type: "problem",
        docs: {
            description: "Evitar colisiones de persistKey en los Signals Globales de MitaDOM",
        },
        schema: []
    },
    create(context) {
        // Almacenamos las keys encontradas en el proyecto
        const seenKeys = new Set();
        return {
            NewExpression(node) {
                if (node.callee.name === "Signal" || node.callee.name === "ComputedSignal") {
                    const optionsArg = node.arguments[1];
                    if (optionsArg && optionsArg.type === "ObjectExpression") {
                        const persistProperty = optionsArg.properties.find(
                            p => p.key && p.key.name === "persistKey"
                        );
                        if (persistProperty && persistProperty.value.type === "Literal") {
                            const keyName = persistProperty.value.value;
                            if (seenKeys.has(keyName)) {
                                context.report({
                                    node: persistProperty,
                                    message: `🚨 PELIGRO: El persistKey '${keyName}' ya está siendo usado por otro Signal Global. Duplicar esta llave causará fugas de memoria y colisiones en la base de datos.`
                                });
                            } else {
                                seenKeys.add(keyName);
                            }
                        }
                    }
                }
            }
        };
    }
};

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        ignores: [".history/**", "dist/**"]
    },
    {
        files: ["src/**/*.js"],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.es2021
            }
        },
        plugins: {
            "mita-rules": {
                rules: {
                    "no-duplicate-persist-keys": mitaNoDuplicatePersistKeys
                }
            }
        },
        rules: {
            "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
            "no-undef": "error", // Evita variables globales implícitas que causan Memory Leaks
            "mita-rules/no-duplicate-persist-keys": "error"
        }
    }
];
