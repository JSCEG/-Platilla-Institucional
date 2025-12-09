/**
 * SENER LaTeX Editor - Configuración
 */

// Configuración del Google Sheets público
const CONFIG = {
    // URL base del Google Sheets publicado
    GOOGLE_SHEETS_BASE_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQaJ_BNSR2R7nVPc4eKv_YM24IJnO4FyGqJEYq-oyOciFn_2mrHqP5y5ZS61lkQe8jtMEe0IEZmZUMw/pub',
    
    // GIDs de cada hoja (obtenidos de la URL de cada pestaña)
    // Para obtener el GID: abre la pestaña en Google Sheets y copia el número después de "gid=" en la URL
    HOJAS: {
        'Documentos': '0',      // Primera hoja (gid=0)
        'Secciones': '1',       // Segunda hoja (gid=1)
        'Tablas': '2',          // Tercera hoja (gid=2)
        'Figuras': '3',         // Cuarta hoja (gid=3)
        'Bibliografia': '4',    // Quinta hoja (gid=4)
        'Siglas': '5',          // Sexta hoja (gid=5)
        'Glosario': '6'         // Séptima hoja (gid=6)
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
    return `${CONFIG.GOOGLE_SHEETS_BASE_URL}?gid=${gid}&single=true&output=csv`;
}

/**
 * Cargar una hoja específica del Google Sheets como CSV
 */
async function cargarHojaCSV(nombreHoja) {
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
 */
function parsearCSV(csvText) {
    const lineas = csvText.split('\n').filter(l => l.trim());
    if (lineas.length === 0) return [];
    
    // Primera línea son los headers
    const headers = parsearLineaCSV(lineas[0]);
    console.log('📋 Headers encontrados:', headers);
    
    // Resto son los datos
    const datos = [];
    for (let i = 1; i < lineas.length; i++) {
        const valores = parsearLineaCSV(lineas[i]);
        
        // Verificar que la fila tenga datos (no sea solo comas vacías)
        const tieneContenido = valores.some(v => v && v.trim() !== '');
        if (!tieneContenido) {
            console.log(`⚠️ Fila ${i + 1} vacía, ignorando`);
            continue;
        }
        
        const objeto = {};
        headers.forEach((header, index) => {
            objeto[header] = valores[index] || '';
        });
        
        datos.push(objeto);
    }
    
    console.log(`✅ Parseadas ${datos.length} filas con contenido`);
    return datos;
}

/**
 * Parsear una línea CSV respetando comillas
 */
function parsearLineaCSV(linea) {
    const resultado = [];
    let valorActual = '';
    let dentroComillas = false;
    
    for (let i = 0; i < linea.length; i++) {
        const char = linea[i];
        
        if (char === '"') {
            dentroComillas = !dentroComillas;
        } else if (char === ',' && !dentroComillas) {
            resultado.push(valorActual.trim());
            valorActual = '';
        } else {
            valorActual += char;
        }
    }
    
    // Agregar el último valor
    resultado.push(valorActual.trim());
    
    return resultado;
}

/**
 * Cargar todos los datos del Google Sheets
 */
async function cargarTodosDatos() {
    try {
        console.log('📥 Cargando todos los datos desde Google Sheets...');
        
        const [documentos, secciones, tablas, figuras, bibliografia, siglas, glosario] = await Promise.all([
            cargarHojaCSV('Documentos'),
            cargarHojaCSV('Secciones'),
            cargarHojaCSV('Tablas'),
            cargarHojaCSV('Figuras'),
            cargarHojaCSV('Bibliografia'),
            cargarHojaCSV('Siglas'),
            cargarHojaCSV('Glosario')
        ]);
        
        console.log('✅ Todos los datos cargados correctamente');
        
        return {
            documentos,
            secciones,
            tablas,
            figuras,
            bibliografia,
            siglas,
            glosario
        };
        
    } catch (error) {
        console.error('❌ Error al cargar datos:', error);
        throw error;
    }
}
