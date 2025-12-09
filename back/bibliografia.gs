/**
 * ============================================================================
 * BACKEND BIBLIOGRAFÍA - Google Apps Script
 * ============================================================================
 * Instrucciones:
 * 1. Crea un nuevo proyecto de Apps Script (o archivo .gs en tu proyecto existente)
 * 2. Nómbralo "bibliografia" o "Bibliografia Backend"
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
      case 'UPDATE_BIBLIOGRAFIA':
        result = updateBibliografia(data);
        break;
      case 'CREATE_BIBLIOGRAFIA':
        result = createBibliografia(data);
        break;
      case 'DELETE_BIBLIOGRAFIA':
        result = deleteBibliografia(data);
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

function updateBibliografia(data) {
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

function createBibliografia(data) {
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

function deleteBibliografia(data) {
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
