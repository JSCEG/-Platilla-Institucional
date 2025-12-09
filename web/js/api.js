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
            // Modo demo/desarrollo
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
}

// Instancia global
const api = new SenerAPI();
