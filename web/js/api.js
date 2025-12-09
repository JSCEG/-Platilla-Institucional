/**
 * API para comunicación con Google Apps Script
 */

class SenerAPI {
    constructor() {
        // Detectar si estamos en Google Apps Script
        this.isGoogleAppsScript = typeof google !== 'undefined' &&
            google.script &&
            google.script.run;

        if (this.isGoogleAppsScript) {
            console.log('✅ Modo Google Apps Script - Conectado a Google Sheets');
        } else {
            console.log('⚠️ Modo Demo - Usando datos de ejemplo');
        }
    }

    /**
     * Obtener lista de documentos
     */
    async getDocumentos() {
        if (this.isGoogleAppsScript) {
            return new Promise((resolve, reject) => {
                google.script.run
                    .withSuccessHandler(resolve)
                    .withFailureHandler(reject)
                    .getDocumentos();
            });
        } else {
            console.warn('Modo demo: usando datos de ejemplo');
            return Promise.resolve([]);
        }
    }

    /**
     * Obtener documento completo por ID
     */
    async getDocumento(docId) {
        if (this.isGoogleAppsScript) {
            return new Promise((resolve, reject) => {
                google.script.run
                    .withSuccessHandler(resolve)
                    .withFailureHandler(reject)
                    .getDocumento(docId);
            });
        } else {
            console.warn('Modo demo: usando datos de ejemplo');
            return Promise.resolve({
                metadata: {},
                secciones: [],
                tablas: [],
                figuras: [],
                bibliografia: [],
                siglas: [],
                glosario: []
            });
        }
    }

    /**
     * Guardar cambios en documento
     */
    async guardarDocumento(docId, datos) {
        if (this.isGoogleAppsScript) {
            return new Promise((resolve, reject) => {
                google.script.run
                    .withSuccessHandler(resolve)
                    .withFailureHandler(reject)
                    .guardarDocumento(docId, datos);
            });
        } else {
            console.warn('Modo demo: guardado simulado');
            return Promise.resolve({ success: true, message: 'Guardado (demo)' });
        }
    }

    /**
     * Crear nueva tabla
     */
    async crearTabla(docId, datosTabla) {
        if (this.isGoogleAppsScript) {
            return new Promise((resolve, reject) => {
                google.script.run
                    .withSuccessHandler(resolve)
                    .withFailureHandler(reject)
                    .crearTabla(docId, datosTabla);
            });
        } else {
            console.warn('Modo demo: creación simulada');
            return Promise.resolve({ success: true });
        }
    }

    /**
     * Generar .tex desde la interfaz
     */
    async generarTex(docId) {
        if (this.isGoogleAppsScript) {
            return new Promise((resolve, reject) => {
                google.script.run
                    .withSuccessHandler(resolve)
                    .withFailureHandler(reject)
                    .generarTexDesdeWeb(docId);
            });
        } else {
            console.warn('Modo demo: generación simulada');
            return Promise.resolve({
                success: true,
                contenido: '% LaTeX generado (demo)',
                nombreArchivo: 'documento.tex'
            });
        }
    }

    /**
     * Subir imagen
     */
    async subirImagen(file, carpeta = 'img') {
        if (this.isGoogleAppsScript) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const base64 = e.target.result.split(',')[1];
                    google.script.run
                        .withSuccessHandler(resolve)
                        .withFailureHandler(reject)
                        .subirImagen(base64, file.name, carpeta);
                };
                reader.readAsDataURL(file);
            });
        } else {
            console.warn('Modo demo: subida simulada');
            return Promise.resolve({
                success: true,
                ruta: `${carpeta}/${file.name}`
            });
        }
    }

    // ========================================================================
    // SIGLAS
    // ========================================================================

    async guardarSigla(docId, siglaId, descripcion) {
        const url = CONFIG.APPS_SCRIPT_URLS.SIGLAS;
        const payload = { action: 'UPDATE_SIGLA', docId, siglaId, descripcion };

        try {
            const response = await fetch(url, { method: 'POST', body: JSON.stringify(payload) });
            return await response.json();
        } catch (error) {
            console.error('Error en API guardarSigla:', error);
            return { status: 'error', message: error.message };
        }
    }

    async crearSigla(docId, siglaId, descripcion) {
        const url = CONFIG.APPS_SCRIPT_URLS.SIGLAS;
        const payload = { action: 'CREATE_SIGLA', docId, siglaId, descripcion };

        try {
            const response = await fetch(url, { method: 'POST', body: JSON.stringify(payload) });
            return await response.json();
        } catch (error) {
            console.error('Error en API crearSigla:', error);
            return { status: 'error', message: error.message };
        }
    }

    async eliminarSigla(docId, siglaId) {
        const url = CONFIG.APPS_SCRIPT_URLS.SIGLAS;
        const payload = { action: 'DELETE_SIGLA', docId, siglaId };

        try {
            const response = await fetch(url, { method: 'POST', body: JSON.stringify(payload) });
            return await response.json();
        } catch (error) {
            console.error('Error en API eliminarSigla:', error);
            return { status: 'error', message: error.message };
        }
    }

    // ========================================================================
    // GLOSARIO
    // ========================================================================

    async crearGlosario(docId, termino, definicion) {
        const url = CONFIG.APPS_SCRIPT_URLS.GLOSARIO;
        const payload = { action: 'CREATE_GLOSARIO', docId, termino, definicion };

        try {
            const response = await fetch(url, { method: 'POST', body: JSON.stringify(payload) });
            return await response.json();
        } catch (error) {
            console.error('Error en API crearGlosario:', error);
            return { status: 'error', message: error.message };
        }
    }

    async guardarGlosario(docId, termino, definicion) {
        const url = CONFIG.APPS_SCRIPT_URLS.GLOSARIO;
        const payload = { action: 'UPDATE_GLOSARIO', docId, termino, definicion };

        try {
            const response = await fetch(url, { method: 'POST', body: JSON.stringify(payload) });
            return await response.json();
        } catch (error) {
            console.error('Error en API guardarGlosario:', error);
            return { status: 'error', message: error.message };
        }
    }

    async eliminarGlosario(docId, termino) {
        const url = CONFIG.APPS_SCRIPT_URLS.GLOSARIO;
        const payload = { action: 'DELETE_GLOSARIO', docId, termino };

        try {
            const response = await fetch(url, { method: 'POST', body: JSON.stringify(payload) });
            return await response.json();
        } catch (error) {
            console.error('Error en API eliminarGlosario:', error);
            return { status: 'error', message: error.message };
        }
    }

    // ========================================================================
    // BIBLIOGRAFÍA
    // ========================================================================

    async crearBibliografia(docId, datos) {
        const url = CONFIG.APPS_SCRIPT_URLS.BIBLIOGRAFIA;
        const payload = { action: 'CREATE_BIBLIOGRAFIA', docId, ...datos };

        try {
            const response = await fetch(url, { method: 'POST', body: JSON.stringify(payload) });
            return await response.json();
        } catch (error) {
            console.error('Error en API crearBibliografia:', error);
            return { status: 'error', message: error.message };
        }
    }

    async guardarBibliografia(docId, datos) {
        const url = CONFIG.APPS_SCRIPT_URLS.BIBLIOGRAFIA;
        const payload = { action: 'UPDATE_BIBLIOGRAFIA', docId, ...datos };

        try {
            const response = await fetch(url, { method: 'POST', body: JSON.stringify(payload) });
            return await response.json();
        } catch (error) {
            console.error('Error en API guardarBibliografia:', error);
            return { status: 'error', message: error.message };
        }
    }

    async eliminarBibliografia(docId, clave) {
        const url = CONFIG.APPS_SCRIPT_URLS.BIBLIOGRAFIA;
        const payload = { action: 'DELETE_BIBLIOGRAFIA', docId, clave };

        try {
            const response = await fetch(url, { method: 'POST', body: JSON.stringify(payload) });
            return await response.json();
        } catch (error) {
            console.error('Error en API eliminarBibliografia:', error);
            return { status: 'error', message: error.message };
        }
    }

    // ========================================================================
    // METADATOS
    // ========================================================================

    async guardarMetadatos(docId, metadatos) {
        const url = CONFIG.APPS_SCRIPT_URLS.METADATOS;
        const payload = { action: 'UPDATE_METADATOS', docId, metadatos };

        try {
            const response = await fetch(url, { method: 'POST', body: JSON.stringify(payload) });
            return await response.json();
        } catch (error) {
            console.error('Error en API guardarMetadatos:', error);
            return { status: 'error', message: error.message };
        }
    }

    async crearDocumento(docId, metadatos) {
        const url = CONFIG.APPS_SCRIPT_URLS.METADATOS;
        const payload = { action: 'CREATE_DOCUMENTO', docId, metadatos };

        try {
            const response = await fetch(url, { method: 'POST', body: JSON.stringify(payload) });
            return await response.json();
        } catch (error) {
            console.error('Error en API crearDocumento:', error);
            return { status: 'error', message: error.message };
        }
    }
}

// Instancia global
const api = new SenerAPI();
