/**
 * SENER LaTeX Editor - Configuración
 */

// Configuración del Google Sheets público
const CONFIG = {
    // URL base del Google Sheets (Vista de edición/compartida)
    GOOGLE_SHEETS_BASE_URL: 'https://docs.google.com/spreadsheets/d/1zKKvxR_56Gk5ku4ZZ682hSpOgQQo3gC0xXOB_nta3Zg',

    // URLs de los Web Apps de Google Apps Script (Backends modulares)
    APPS_SCRIPT_URLS: {
        SIGLAS: 'https://script.google.com/macros/s/AKfycbxfOQsDyrtMOXbCmUe5BRwfsj-5rvk9dc8-QQMdJz0DThcz89BzGVz5UkMllIS570NINA/exec',
        GLOSARIO: 'https://script.google.com/macros/s/AKfycby1M-F3mvRsajgPlqFG4OhvVq2sWg2fEYupk2IAabYbxk8zbJ_25Kp5Du5z5qXQpaG5Og/exec',
        BIBLIOGRAFIA: 'https://script.google.com/macros/s/AKfycbyiCez8WA_9tV2pOy6M2MKAqV0M3YVQ3rQXakkdw9kZzRbAvb4Pb9ttKlJqOhnRqlc3jg/exec',
        METADATOS: 'https://script.google.com/macros/s/AKfycbycEoRA7l9pl00bdbPlPsxXf-rAEJYtnUwnUC7oteWAG4tLU8Osic22QjKaSpfQXikDVA/exec'
    },

    // GIDs de cada hoja (obtenidos de la URL de cada pestaña)
    // Para obtener el GID: abre la pestaña en Google Sheets y copia el número después de "gid=" en la URL
    HOJAS: {
        'Documentos': '0',      // Primera hoja (gid=0)
        'Secciones': '624164950', // Actualizado
        'Tablas': '1233547389',        // Actualizado
        'DatosTablas': '1828040720',   // Actualizado: Hoja con los datos crudos de las tablas
        'Figuras': '19478262',         // Actualizado
        'Bibliografia': '1970507614',  // Actualizado
        'Siglas': '1732595035',        // Actualizado
        'Glosario': '1662281749'       // Actualizado
    },

    // Configuración de autoguardado
    AUTOGUARDADO_INTERVALO: 30000, // 30 segundos

    // Configuración de la aplicación
    APP: {
        nombre: 'SENER LaTeX Editor',
        version: '1.0.0',
        autor: 'Secretaría de Energía'
    }
};

/**
 * Obtener URL de una hoja específica en formato CSV
 */
function getUrlHojaCSV(nombreHoja) {
    const gid = CONFIG.HOJAS[nombreHoja] || '0';
    return `${CONFIG.GOOGLE_SHEETS_BASE_URL}/export?format=csv&gid=${gid}`;
}

/**
 * Cargar una hoja específica del Google Sheets como CSV
 */
async function cargarHojaCSV(nombreHoja) {
    // Si no tiene GID configurado (excepto Documentos que tiene default 0 en fallback pero configurable), retornamos vacío para no dar error 400
    if (nombreHoja !== 'Documentos' && (!CONFIG.HOJAS[nombreHoja] || CONFIG.HOJAS[nombreHoja] === '')) {
        // Silenciar advertencia para opcionales que a;un no tienen GID
        if (nombreHoja !== 'DatosTablas') {
            console.warn(`⚠️ Hoja "${nombreHoja}" no tiene GID configurado en config.js. Saltando carga.`);
        }
        return [];
    }

    const url = getUrlHojaCSV(nombreHoja);

    try {
        console.log(`📥 Cargando hoja "${nombreHoja}"...`);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const csvText = await response.text();
        const datos = parsearCSV(csvText);

        console.log(`✅ Hoja "${nombreHoja}" cargada: ${datos.length} registros`);
        return datos;

    } catch (error) {
        console.error(`❌ Error al cargar hoja "${nombreHoja}":`, error);
        return [];
    }
}

/**
 * Parsear CSV a array de objetos
 * Versión Robusta: Maneja saltos de línea dentro de comillas
 */
function parsearCSV(csvText) {
    if (!csvText || !csvText.trim()) return [];

    // Parsear todo el texto caracter por caracter para manejar newlines dentro de comillas
    const lineas = [];
    let lineaActual = [];
    let valorActual = '';
    let dentroComillas = false;

    // Normalizar finales de línea a \n
    const texto = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    for (let i = 0; i < texto.length; i++) {
        const char = texto[i];
        const nextChar = texto[i + 1];

        if (char === '"') {
            if (dentroComillas && nextChar === '"') {
                // Comilla escapada ("") -> agregar una comilla real y saltar la siguiente
                valorActual += '"';
                i++;
            } else {
                // Cambiar estado de dentroComillas
                dentroComillas = !dentroComillas;
            }
        } else if (char === ',' && !dentroComillas) {
            // Fin de celda
            lineaActual.push(valorActual);
            valorActual = '';
        } else if (char === '\n' && !dentroComillas) {
            // Fin de línea
            lineaActual.push(valorActual);
            lineas.push(lineaActual);
            lineaActual = [];
            valorActual = '';
        } else {
            // Caracter normal
            valorActual += char;
        }
    }

    // Agregar la última línea y valor si queda algo
    if (valorActual || lineaActual.length > 0) {
        lineaActual.push(valorActual);
        lineas.push(lineaActual);
    }

    if (lineas.length === 0) return [];

    // Primera línea son los headers (limpiamos espacios y comillas extra)
    const headers = lineas[0].map(h => h.trim().replace(/^"|"$/g, ''));
    console.log('📋 Headers encontrados:', headers);

    // Resto son los datos
    const datos = [];
    for (let i = 1; i < lineas.length; i++) {
        const valores = lineas[i];

        // Verificar que la fila tenga datos
        if (valores.length <= 1 && (!valores[0] || valores[0].trim() === '')) {
            continue;
        }

        const objeto = {};
        headers.forEach((header, index) => {
            let val = valores[index] !== undefined ? valores[index] : '';
            if (!val.includes('\n')) {
                val = val.trim();
            }
            objeto[header] = val;
        });

        datos.push(objeto);
    }

    console.log(`✅ Parseadas ${datos.length} filas correctamente`);
    return datos;
}

/**
 * Cargar todos los datos del Google Sheets
 */
async function cargarTodosDatos() {
    try {
        console.log('📥 Cargando todos los datos desde Google Sheets...');

        const [documentos, secciones, tablas, figuras, bibliografia, siglas, glosario, datosTablas] = await Promise.all([
            cargarHojaCSV('Documentos'),
            cargarHojaCSV('Secciones'),
            cargarHojaCSV('Tablas'),
            cargarHojaCSV('Figuras'),
            cargarHojaCSV('Bibliografia'),
            cargarHojaCSV('Siglas'),
            cargarHojaCSV('Glosario'),
            cargarHojaCSV('DatosTablas')
        ]);

        console.log('✅ Todos los datos cargados correctamente');

        return {
            documentos,
            secciones,
            tablas,
            figuras,
            bibliografia,
            siglas,
            glosario,
            datosTablas // Datos crudos de las tablas (rangos)
        };

    } catch (error) {
        console.error('❌ Error al cargar datos:', error);
        throw error;
    }
}
