/**
 * ============================================================================
 * BACKEND GLOSARIO - Google Apps Script
 * ============================================================================
 * Instrucciones:
 * 1. Crea un nuevo proyecto de Apps Script (o archivo .gs en tu proyecto existente)
 * 2. Nómbralo "glosario" o "Glosario Backend"
 * 3. Copia y pega este código
 * 4. Despliega como Web App:
 *    - Ejecutar como: "Yo"
 *    - Quién tiene acceso: "Cualquiera"
 * 5. Copia la URL del Web App y pásala al desarrollador
 */

function doPost(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('No se recibieron datos POST');
    }
    
    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseError) {
      data = e.parameter;
    }

    const action = data.action;
    
    if (!action) {
      throw new Error('No se especifica ninguna acción');
    }

    let result = {};

    switch (action) {
      case 'UPDATE_GLOSARIO':
        result = updateGlosario(data);
        break;
      case 'CREATE_GLOSARIO':
        result = createGlosario(data);
        break;
      case 'DELETE_GLOSARIO':
        result = deleteGlosario(data);
        break;
      default:
        throw new Error(`Acción desconocida: ${action}`);
    }

    output.setContent(JSON.stringify({
      status: 'success',
      ...result
    }));

  } catch (error) {
    console.error('Error en doPost:', error);
    output.setContent(JSON.stringify({
      status: 'error',
      message: error.toString()
    }));
  }
  
  return output;
}

function updateGlosario(data) {
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

function createGlosario(data) {
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

function deleteGlosario(data) {
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
