/**
 * ============================================================================
 * BACKEND FIGURAS - Google Apps Script
 * ============================================================================
 * CRUD para Figuras del documento
 * 
 * Instrucciones de despliegue:
 * 1. Crea un NUEVO proyecto de Apps Script
 * 2. Nómbralo "Figuras Backend"
 * 3. Copia y pega TODO este código
 * 4. Despliega como Web App:
 *    - Implementar → Nueva implementación
 *    - Tipo: Aplicación web
 *    - Ejecutar como: "Yo"
 *    - Quién tiene acceso: "Cualquiera"
 * 5. Autoriza los permisos
 * 6. Copia la URL del Web App
 */

function doPost(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('No se recibieron datos POST');
    }
    
    // Aceptar JSON puro o payload urlencoded (payload=<json>)
    let data = null;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (err) {
      const params = e.parameter || {};
      if (params.payload) {
        data = JSON.parse(params.payload);
      } else {
        throw new Error('Formato de payload no válido. Envía JSON o payload=urlencoded.');
      }
    }

    const action = data.action;
    
    if (!action) {
      throw new Error('No se especificó ninguna acción');
    }

    let result = {};

    switch (action) {
      case 'TEST_CONNECTION':
        result = { message: 'Conexión exitosa con Google Apps Script', timestamp: new Date().toISOString() };
        break;
      case 'CREATE_FIGURA':
        result = createFigura(data);
        break;
      case 'UPDATE_FIGURA':
        result = updateFigura(data);
        break;
      case 'DELETE_FIGURA':
        result = deleteFigura(data);
        break;
      default:
        throw new Error(`Acción desconocida: ${action}`);
    }

    output.setContent(JSON.stringify({
      status: 'success',
      ...result
    }));

  } catch (error) {
    Logger.log('Error en doPost: ' + error.toString());
    output.setContent(JSON.stringify({
      status: 'error',
      message: error.toString()
    }));
  }
  
  return output;
}

function createFigura(data) {
  const { docId, figura } = data;
  
  Logger.log('=== CREATE FIGURA ===');
  Logger.log('docId: ' + docId);
  Logger.log('figura: ' + JSON.stringify(figura));
  
  if (!docId) throw new Error('Falta el ID del documento');
  if (!figura) throw new Error('Faltan los datos de la figura');
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log('Spreadsheet: ' + ss.getName());
  
  const sheet = ss.getSheetByName('Figuras');
  if (!sheet) throw new Error('No se encontró la hoja "Figuras"');
  
  Logger.log('Hoja encontrada: ' + sheet.getName());
  
  const newRow = [
    docId,
    figura.SeccionOrden || '',
    figura.OrdenFigura || '',
    figura.RutaArchivo || '',
    figura.Caption || '',
    figura.Fuente || ''
  ];
  
  Logger.log('Nueva fila: ' + JSON.stringify(newRow));
  
  sheet.appendRow(newRow);
  Logger.log('Fila agregada exitosamente');
  
  return { 
    message: 'Figura creada correctamente',
    figuraId: `${figura.SeccionOrden}-${figura.OrdenFigura}`,
    rowData: newRow
  };
}

function updateFigura(data) {
  const { docId, figuraId, figura } = data;
  
  Logger.log('=== UPDATE FIGURA ===');
  Logger.log('docId: ' + docId);
  Logger.log('figuraId: ' + figuraId);
  Logger.log('figura: ' + JSON.stringify(figura));
  
  if (!docId) throw new Error('Falta el ID del documento');
  if (!figuraId) throw new Error('Falta el ID de la figura');
  if (!figura) throw new Error('Faltan los datos de la figura');
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Figuras');
  if (!sheet) throw new Error('No se encontró la hoja "Figuras"');
  
  Logger.log('Hoja encontrada: ' + sheet.getName());
  
  const values = sheet.getDataRange().getValues();
  Logger.log('Total de filas en la hoja: ' + values.length);
  
  // Parsear figuraId compuesto (formato: "seccion-orden" o "seccion-orden-index")
  let seccionBuscada, ordenBuscado;
  if (figuraId.includes('-')) {
    const partes = figuraId.split('-');
    seccionBuscada = partes[0];
    ordenBuscado = partes[1];
  } else {
    // Si no tiene guión, asumir que es solo el orden
    ordenBuscado = figuraId;
    seccionBuscada = figura.SeccionOrden || '1';
  }
  
  Logger.log(`Buscando figura: docId=${docId}, seccion=${seccionBuscada}, orden=${ordenBuscado}`);
  
  // Buscar la fila de la figura
  for (let i = 1; i < values.length; i++) {
    const filaDocId = String(values[i][0]);
    const filaSeccion = String(values[i][1]);
    const filaOrden = String(values[i][2]);
    
    Logger.log(`Fila ${i}: docId=${filaDocId}, seccion=${filaSeccion}, orden=${filaOrden}`);
    
    if (filaDocId == docId && filaSeccion == seccionBuscada && filaOrden == ordenBuscado) {
      const rowIndex = i + 1;
      
      Logger.log(`Actualizando fila ${rowIndex} con:`, figura);
      
      // Actualizar campos
      sheet.getRange(rowIndex, 2).setValue(figura.SeccionOrden || filaSeccion);
      sheet.getRange(rowIndex, 3).setValue(figura.OrdenFigura || filaOrden);
      sheet.getRange(rowIndex, 4).setValue(figura.RutaArchivo || '');
      sheet.getRange(rowIndex, 5).setValue(figura.Caption || '');
      sheet.getRange(rowIndex, 6).setValue(figura.Fuente || '');
      
      return { 
        message: 'Figura actualizada correctamente',
        figuraId: `${filaSeccion}-${filaOrden}`,
        rowUpdated: rowIndex
      };
    }
  }
  
  throw new Error(`No se encontró la figura con ID "${figuraId}" (docId: ${docId}, seccion: ${seccionBuscada}, orden: ${ordenBuscado})`);
}

function deleteFigura(data) {
  const { docId, figuraId } = data;
  
  if (!docId) throw new Error('Falta el ID del documento');
  if (!figuraId) throw new Error('Falta el ID de la figura');
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Figuras');
  if (!sheet) throw new Error('No se encontró la hoja "Figuras"');
  
  const values = sheet.getDataRange().getValues();
  
  // Parsear figuraId compuesto (formato: "seccion-orden" o "seccion-orden-index")
  let seccionBuscada, ordenBuscado;
  if (figuraId.includes('-')) {
    const partes = figuraId.split('-');
    seccionBuscada = partes[0];
    ordenBuscado = partes[1];
  } else {
    // Si no tiene guión, asumir que es solo el orden
    ordenBuscado = figuraId;
    seccionBuscada = '1'; // Sección por defecto
  }
  
  Logger.log(`Eliminando figura: docId=${docId}, seccion=${seccionBuscada}, orden=${ordenBuscado}`);
  
  // Buscar y eliminar la fila
  for (let i = 1; i < values.length; i++) {
    const filaDocId = String(values[i][0]);
    const filaSeccion = String(values[i][1]);
    const filaOrden = String(values[i][2]);
    
    if (filaDocId == docId && filaSeccion == seccionBuscada && filaOrden == ordenBuscado) {
      Logger.log(`Eliminando fila ${i + 1}`);
      sheet.deleteRow(i + 1);
      return { 
        message: 'Figura eliminada correctamente',
        figuraId: `${filaSeccion}-${filaOrden}`,
        rowDeleted: i + 1
      };
    }
  }
  
  throw new Error(`No se encontró la figura con ID "${figuraId}" (docId: ${docId}, seccion: ${seccionBuscada}, orden: ${ordenBuscado})`);
}

/**
 * Función de prueba
 */
function testScript() {
  Logger.log('✅ Script de Figuras funcionando correctamente');
  Logger.log('Spreadsheet: ' + SpreadsheetApp.getActiveSpreadsheet().getName());
  return 'OK';
}
