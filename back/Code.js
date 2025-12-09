/**
 * SENER LaTeX Editor - Backend (Google Apps Script)
 * 
 * Este script debe ser desplegado como Aplicación Web.
 * 
 * Instrucciones:
 * 1. Pega este código en el editor de Apps Script de tu hoja de cálculo.
 * 2. Despliega como aplicación web:
 *    - Ejecutar como: "Yo" (tu cuenta)
 *    - Quién tiene acceso: "Cualquiera" (incluso anónimo)
 */

// ID de la hoja de cálculo (actualizar con el ID real si es diferente al del script contenedor)
const SPREADSHEET_ID = '1zKKvxR_56Gk5ku4ZZ682hSpOgQQo3gC0xXOB_nta3Zg';

// GID de la hoja Siglas
const SIGLAS_SHEET_NAME_OR_ID = '1732595035'; // Usaremos el GID para encontrarla o el nombre si es estable

/**
 * Manejar peticiones GET (para pruebas o lectura simple)
 */
function doGet(e) {
    return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Backend SENER Editor online'
    })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Manejar peticiones POST (Crear, Actualizar, Eliminar)
 */
function doPost(e) {
    try {
        // 1. Parsear datos
        if (!e || !e.postData || !e.postData.contents) {
            throw new Error('No se recibieron datos POST');
        }

        const data = JSON.parse(e.postData.contents);
        const action = data.action;

        if (!action) {
            throw new Error('No se especificó nunguna acción');
        }

        let result = {};

        // 2. Ejecutar acción
        switch (action) {
            case 'UPDATE_SIGLA':
                result = updateSigla(data);
                break;
            case 'CREATE_SIGLA':
                // result = createSigla(data); // TODO
                throw new Error('Acción CREATE_SIGLA no implementada aún');
                break;
            case 'DELETE_SIGLA':
                // result = deleteSigla(data); // TODO
                throw new Error('Acción DELETE_SIGLA no implementada aún');
                break;
            default:
                throw new Error(`Acción desconocida: ${action}`);
        }

        // 3. Retornar respuesta exitosa
        return ContentService.createTextOutput(JSON.stringify({
            status: 'success',
            ...result
        })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        // 4. Retornar error
        return ContentService.createTextOutput(JSON.stringify({
            status: 'error',
            message: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * Actualizar una sigla existente
 */
function updateSigla(data) {
    const { siglaId, descripcion, docId } = data; // siglaId es la "Sigla" (clave), docId es el DocumentoID

    if (!siglaId || !docId) {
        throw new Error('Faltan datos obligatorios (siglaId, docId)');
    }

    const sheet = getSheetByGid(SIGLAS_SHEET_NAME_OR_ID);
    if (!sheet) throw new Error('No se encontró la hoja de Siglas');

    // Leer todos los datos para encontrar la fila
    // Asumimos headers en fila 1: DocumentoID, Sigla, Descripcion
    const values = sheet.getDataRange().getValues();

    // Buscar índice (fila)
    // Nota: values[i][0] es DocumentoID, values[i][1] es Sigla
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
        if (String(values[i][0]) === String(docId) && String(values[i][1]) === String(siglaId)) {
            rowIndex = i + 1; // +1 porque array es 0-based y hoja es 1-based
            break;
        }
    }

    if (rowIndex === -1) {
        throw new Error(`No se encontró la sigla "${siglaId}" para el documento "${docId}"`);
    }

    // Actualizar columna Descripcion (Columna C -> índice 3)
    sheet.getRange(rowIndex, 3).setValue(descripcion);

    return { message: 'Sigla actualizada correctamente' };
}

/**
 * Helper: Obtener hoja por GID (ya que el nombre puede cambiar)
 */
function getSheetByGid(gid) {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheets = ss.getSheets();
    for (let i = 0; i < sheets.length; i++) {
        if (String(sheets[i].getSheetId()) === String(gid)) {
            return sheets[i];
        }
    }
    return null;
}
