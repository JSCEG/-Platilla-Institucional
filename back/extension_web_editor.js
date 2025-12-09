/**
 * ============================================================================
 * EXTENSIÓN PARA EDITOR WEB - SOLICITUDES POST
 * ============================================================================
 * Instrucciones:
 * 1. Copia todo este código.
 * 2. Pégalo al final de tu archivo actual en Apps Script (o en un archivo nuevo .gs dentro del mismo proyecto).
 * 3. NO borres ni modifiques tu función 'doGet' existente.
 * 4. Actualiza el despliegue de tu Aplicación Web (Nueva implementación) para que los cambios surtan efecto.
 */

/**
 * Manejar peticiones POST (Crear, Actualizar, Eliminar) provenientes del Editor Web
 */
function doPost(e) {
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);

    try {
        // 1. Validar datos
        if (!e || !e.postData || !e.postData.contents) {
            throw new Error('No se recibieron datos POST');
        }

        // Parseo seguro
        let data;
        try {
            data = JSON.parse(e.postData.contents);
        } catch (parseError) {
            data = e.parameter;
        }

        const action = data.action;

        if (!action) {
            throw new Error('No se especifica ninguna acción (action)');
        }

        let result = {};

        // 2. Enrutador de acciones
        switch (action) {
            // SIGLAS
            case 'UPDATE_SIGLA':
                result = backendUpdateSigla(data);
                break;
            case 'CREATE_SIGLA':
                result = backendCreateSigla(data);
                break;
            case 'DELETE_SIGLA':
                result = backendDeleteSigla(data);
                break;

            // GLOSARIO
            case 'UPDATE_GLOSARIO':
                result = backendUpdateGlosario(data);
                break;
            case 'CREATE_GLOSARIO':
                result = backendCreateGlosario(data);
                break;
            case 'DELETE_GLOSARIO':
                result = backendDeleteGlosario(data);
                break;

            // BIBLIOGRAFÍA
            case 'UPDATE_BIBLIOGRAFIA':
                result = backendUpdateBibliografia(data);
                break;
            case 'CREATE_BIBLIOGRAFIA':
                result = backendCreateBibliografia(data);
                break;
            case 'DELETE_BIBLIOGRAFIA':
                result = backendDeleteBibliografia(data);
                break;

            default:
                throw new Error(`Acción desconocida: ${action}`);
        }

        // 3. Respuesta Éxito
        output.setContent(JSON.stringify({
            status: 'success',
            ...result
        }));

    } catch (error) {
        // 4. Respuesta Error
        console.error('Error en doPost:', error);
        output.setContent(JSON.stringify({
            status: 'error',
            message: error.toString()
        }));
    }

    return output;
}

// ============================================================================
// SIGLAS
// ============================================================================

function backendUpdateSigla(data) {
    const { siglaId, descripcion, docId } = data;

    if (!siglaId) throw new Error('Falta el ID de la sigla (siglaId)');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Siglas');
    if (!sheet) throw new Error('No se encontró la hoja "Siglas"');

    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    let rowIndex = -1;
    const COL_DOC_ID = 0, COL_SIGLA = 1, COL_DESCRIPCION = 2;

    for (let i = 1; i < values.length; i++) {
        if (String(values[i][COL_DOC_ID]) == docId && String(values[i][COL_SIGLA]) === siglaId) {
            rowIndex = i + 1;
            break;
        }
    }

    if (rowIndex === -1) throw new Error(`No se encontró la sigla "${siglaId}"`);

    sheet.getRange(rowIndex, COL_DESCRIPCION + 1).setValue(descripcion);

    return { message: 'Sigla actualizada', updatedSigla: siglaId };
}

function backendCreateSigla(data) {
    const { siglaId, descripcion, docId } = data;

    if (!siglaId) throw new Error('Falta el ID de la sigla');
    if (!docId) throw new Error('Falta el ID del documento');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Siglas');
    if (!sheet) throw new Error('No se encontró la hoja "Siglas"');

    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    for (let i = 1; i < values.length; i++) {
        if (String(values[i][0]) == docId && String(values[i][1]) === siglaId) {
            throw new Error(`Ya existe la sigla "${siglaId}"`);
        }
    }

    sheet.appendRow([docId, siglaId, descripcion || '']);

    return { message: 'Sigla creada', createdSigla: siglaId };
}

function backendDeleteSigla(data) {
    const { siglaId, docId } = data;

    if (!siglaId) throw new Error('Falta el ID de la sigla');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Siglas');
    if (!sheet) throw new Error('No se encontró la hoja "Siglas"');

    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
        if (String(values[i][0]) == docId && String(values[i][1]) === siglaId) {
            rowIndex = i + 1;
            break;
        }
    }

    if (rowIndex === -1) throw new Error(`No se encontró la sigla "${siglaId}"`);

    sheet.deleteRow(rowIndex);

    return { message: 'Sigla eliminada', deletedSigla: siglaId };
}

// ============================================================================
// GLOSARIO
// ============================================================================

function backendUpdateGlosario(data) {
    const { termino, definicion, docId } = data;

    if (!termino) throw new Error('Falta el término');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Glosario');
    if (!sheet) throw new Error('No se encontró la hoja "Glosario"');

    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    let rowIndex = -1;
    const COL_DOC_ID = 0, COL_TERMINO = 1, COL_DEFINICION = 2;

    for (let i = 1; i < values.length; i++) {
        if (String(values[i][COL_DOC_ID]) == docId && String(values[i][COL_TERMINO]) === termino) {
            rowIndex = i + 1;
            break;
        }
    }

    if (rowIndex === -1) throw new Error(`No se encontró el término "${termino}"`);

    sheet.getRange(rowIndex, COL_DEFINICION + 1).setValue(definicion);

    return { message: 'Término actualizado', updatedTermino: termino };
}

function backendCreateGlosario(data) {
    const { termino, definicion, docId } = data;

    if (!termino) throw new Error('Falta el término');
    if (!docId) throw new Error('Falta el ID del documento');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Glosario');
    if (!sheet) throw new Error('No se encontró la hoja "Glosario"');

    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    for (let i = 1; i < values.length; i++) {
        if (String(values[i][0]) == docId && String(values[i][1]) === termino) {
            throw new Error(`Ya existe el término "${termino}"`);
        }
    }

    sheet.appendRow([docId, termino, definicion || '']);

    return { message: 'Término creado', createdTermino: termino };
}

function backendDeleteGlosario(data) {
    const { termino, docId } = data;

    if (!termino) throw new Error('Falta el término');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Glosario');
    if (!sheet) throw new Error('No se encontró la hoja "Glosario"');

    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
        if (String(values[i][0]) == docId && String(values[i][1]) === termino) {
            rowIndex = i + 1;
            break;
        }
    }

    if (rowIndex === -1) throw new Error(`No se encontró el término "${termino}"`);

    sheet.deleteRow(rowIndex);

    return { message: 'Término eliminado', deletedTermino: termino };
}

// ============================================================================
// BIBLIOGRAFÍA
// ============================================================================

function backendUpdateBibliografia(data) {
    const { clave, tipo, autor, titulo, anio, editorial, url, docId } = data;

    if (!clave) throw new Error('Falta la clave de la referencia');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Bibliografia');
    if (!sheet) throw new Error('No se encontró la hoja "Bibliografia"');

    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
        if (String(values[i][0]) == docId && String(values[i][1]) === clave) {
            rowIndex = i + 1;
            break;
        }
    }

    if (rowIndex === -1) throw new Error(`No se encontró la referencia "${clave}"`);

    // Actualizar todas las columnas
    sheet.getRange(rowIndex, 2).setValue(clave);
    sheet.getRange(rowIndex, 3).setValue(tipo || '');
    sheet.getRange(rowIndex, 4).setValue(autor || '');
    sheet.getRange(rowIndex, 5).setValue(titulo || '');
    sheet.getRange(rowIndex, 6).setValue(anio || '');
    sheet.getRange(rowIndex, 7).setValue(editorial || '');
    sheet.getRange(rowIndex, 8).setValue(url || '');

    return { message: 'Referencia actualizada', updatedClave: clave };
}

function backendCreateBibliografia(data) {
    const { clave, tipo, autor, titulo, anio, editorial, url, docId } = data;

    if (!clave) throw new Error('Falta la clave de la referencia');
    if (!docId) throw new Error('Falta el ID del documento');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Bibliografia');
    if (!sheet) throw new Error('No se encontró la hoja "Bibliografia"');

    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    for (let i = 1; i < values.length; i++) {
        if (String(values[i][0]) == docId && String(values[i][1]) === clave) {
            throw new Error(`Ya existe la referencia "${clave}"`);
        }
    }

    sheet.appendRow([docId, clave, tipo || '', autor || '', titulo || '', anio || '', editorial || '', url || '']);

    return { message: 'Referencia creada', createdClave: clave };
}

function backendDeleteBibliografia(data) {
    const { clave, docId } = data;

    if (!clave) throw new Error('Falta la clave de la referencia');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Bibliografia');
    if (!sheet) throw new Error('No se encontró la hoja "Bibliografia"');

    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
        if (String(values[i][0]) == docId && String(values[i][1]) === clave) {
            rowIndex = i + 1;
            break;
        }
    }

    if (rowIndex === -1) throw new Error(`No se encontró la referencia "${clave}"`);

    sheet.deleteRow(rowIndex);

    return { message: 'Referencia eliminada', deletedClave: clave };
}
