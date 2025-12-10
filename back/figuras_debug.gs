/**
 * ============================================================================
 * BACKEND FIGURAS - DEBUG VERSION
 * ============================================================================
 * Versión simplificada con logging extensivo para diagnosticar problemas
 */

function doPost(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    Logger.log('=== INICIO doPost ===');
    Logger.log('Evento recibido: ' + JSON.stringify(e));
    
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('No se recibieron datos POST');
    }
    
    Logger.log('Contenido POST: ' + e.postData.contents);
    
    let data = null;
    try {
      data = JSON.parse(e.postData.contents);
      Logger.log('Datos parseados: ' + JSON.stringify(data));
    } catch (err) {
      Logger.log('Error parseando JSON: ' + err.toString());
      throw new Error('Error parseando JSON: ' + err.toString());
    }

    const action = data.action;
    Logger.log('Acción solicitada: ' + action);
    
    if (!action) {
      throw new Error('No se especificó ninguna acción');
    }

    let result = {};

    switch (action) {
      case 'TEST_CONNECTION':
        Logger.log('Procesando TEST_CONNECTION');
        result = { 
          message: 'Conexión exitosa con Google Apps Script', 
          timestamp: new Date().toISOString(),
          spreadsheetName: SpreadsheetApp.getActiveSpreadsheet().getName()
        };
        break;
        
      case 'CREATE_FIGURA':
        Logger.log('Procesando CREATE_FIGURA');
        result = createFiguraDebug(data);
        break;
        
      case 'UPDATE_FIGURA':
        Logger.log('Procesando UPDATE_FIGURA');
        result = updateFiguraDebug(data);
        break;
        
      case 'DELETE_FIGURA':
        Logger.log('Procesando DELETE_FIGURA');
        result = deleteFiguraDebug(data);
        break;
        
      default:
        throw new Error(`Acción desconocida: ${action}`);
    }

    Logger.log('Resultado: ' + JSON.stringify(result));

    output.setContent(JSON.stringify({
      status: 'success',
      ...result
    }));

  } catch (error) {
    Logger.log('ERROR en doPost: ' + error.toString());
    Logger.log('Stack trace: ' + error.stack);
    
    output.setContent(JSON.stringify({
      status: 'error',
      message: error.toString(),
      stack: error.stack
    }));
  }
  
  Logger.log('=== FIN doPost ===');
  return output;
}

function createFiguraDebug(data) {
  Logger.log('=== CREATE FIGURA DEBUG ===');
  
  const { docId, figura } = data;
  
  Logger.log('docId recibido: ' + docId);
  Logger.log('figura recibida: ' + JSON.stringify(figura));
  
  if (!docId) {
    Logger.log('ERROR: Falta docId');
    throw new Error('Falta el ID del documento');
  }
  
  if (!figura) {
    Logger.log('ERROR: Falta figura');
    throw new Error('Faltan los datos de la figura');
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log('Spreadsheet activo: ' + ss.getName());
  Logger.log('ID del Spreadsheet: ' + ss.getId());
  
  const sheet = ss.getSheetByName('Figuras');
  if (!sheet) {
    Logger.log('ERROR: No se encontró la hoja Figuras');
    Logger.log('Hojas disponibles: ' + ss.getSheets().map(s => s.getName()).join(', '));
    throw new Error('No se encontró la hoja "Figuras"');
  }
  
  Logger.log('Hoja Figuras encontrada');
  Logger.log('Última fila con datos: ' + sheet.getLastRow());
  Logger.log('Última columna con datos: ' + sheet.getLastColumn());
  
  const newRow = [
    docId,
    figura.SeccionOrden || '',
    figura.OrdenFigura || '',
    figura.RutaArchivo || '',
    figura.Caption || '',
    figura.Fuente || ''
  ];
  
  Logger.log('Fila a insertar: ' + JSON.stringify(newRow));
  
  try {
    sheet.appendRow(newRow);
    Logger.log('Fila insertada exitosamente');
    Logger.log('Nueva última fila: ' + sheet.getLastRow());
  } catch (insertError) {
    Logger.log('ERROR insertando fila: ' + insertError.toString());
    throw new Error('Error insertando fila: ' + insertError.toString());
  }
  
  return { 
    message: 'Figura creada correctamente',
    figuraId: `${figura.SeccionOrden}-${figura.OrdenFigura}`,
    rowData: newRow,
    newLastRow: sheet.getLastRow()
  };
}

function updateFiguraDebug(data) {
  Logger.log('=== UPDATE FIGURA DEBUG ===');
  
  const { docId, figuraId, figura } = data;
  
  Logger.log('docId: ' + docId);
  Logger.log('figuraId: ' + figuraId);
  Logger.log('figura: ' + JSON.stringify(figura));
  
  if (!docId) throw new Error('Falta el ID del documento');
  if (!figuraId) throw new Error('Falta el ID de la figura');
  if (!figura) throw new Error('Faltan los datos de la figura');
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Figuras');
  if (!sheet) throw new Error('No se encontró la hoja "Figuras"');
  
  Logger.log('Obteniendo datos de la hoja...');
  const values = sheet.getDataRange().getValues();
  Logger.log('Total de filas: ' + values.length);
  
  // Parsear figuraId
  let seccionBuscada, ordenBuscado;
  if (figuraId.includes('-')) {
    const partes = figuraId.split('-');
    seccionBuscada = partes[0];
    ordenBuscado = partes[1];
  } else {
    ordenBuscado = figuraId;
    seccionBuscada = figura.SeccionOrden || '1';
  }
  
  Logger.log('Buscando: docId=' + docId + ', seccion=' + seccionBuscada + ', orden=' + ordenBuscado);
  
  // Buscar la fila
  let filaEncontrada = -1;
  for (let i = 1; i < values.length; i++) {
    const filaDocId = String(values[i][0]);
    const filaSeccion = String(values[i][1]);
    const filaOrden = String(values[i][2]);
    
    Logger.log(`Fila ${i}: docId="${filaDocId}", seccion="${filaSeccion}", orden="${filaOrden}"`);
    
    if (filaDocId == docId && filaSeccion == seccionBuscada && filaOrden == ordenBuscado) {
      filaEncontrada = i + 1; // +1 porque las filas en Sheets empiezan en 1
      Logger.log('¡Fila encontrada en posición: ' + filaEncontrada);
      break;
    }
  }
  
  if (filaEncontrada === -1) {
    Logger.log('ERROR: Figura no encontrada');
    throw new Error(`No se encontró la figura con ID "${figuraId}" (docId: ${docId}, seccion: ${seccionBuscada}, orden: ${ordenBuscado})`);
  }
  
  // Actualizar campos
  Logger.log('Actualizando fila ' + filaEncontrada);
  
  try {
    sheet.getRange(filaEncontrada, 2).setValue(figura.SeccionOrden || seccionBuscada);
    sheet.getRange(filaEncontrada, 3).setValue(figura.OrdenFigura || ordenBuscado);
    sheet.getRange(filaEncontrada, 4).setValue(figura.RutaArchivo || '');
    sheet.getRange(filaEncontrada, 5).setValue(figura.Caption || '');
    sheet.getRange(filaEncontrada, 6).setValue(figura.Fuente || '');
    
    Logger.log('Campos actualizados exitosamente');
  } catch (updateError) {
    Logger.log('ERROR actualizando campos: ' + updateError.toString());
    throw new Error('Error actualizando campos: ' + updateError.toString());
  }
  
  return { 
    message: 'Figura actualizada correctamente',
    figuraId: `${seccionBuscada}-${ordenBuscado}`,
    rowUpdated: filaEncontrada
  };
}

function deleteFiguraDebug(data) {
  Logger.log('=== DELETE FIGURA DEBUG ===');
  
  const { docId, figuraId } = data;
  
  Logger.log('docId: ' + docId);
  Logger.log('figuraId: ' + figuraId);
  
  if (!docId) throw new Error('Falta el ID del documento');
  if (!figuraId) throw new Error('Falta el ID de la figura');
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Figuras');
  if (!sheet) throw new Error('No se encontró la hoja "Figuras"');
  
  const values = sheet.getDataRange().getValues();
  Logger.log('Total de filas: ' + values.length);
  
  // Parsear figuraId
  let seccionBuscada, ordenBuscado;
  if (figuraId.includes('-')) {
    const partes = figuraId.split('-');
    seccionBuscada = partes[0];
    ordenBuscado = partes[1];
  } else {
    ordenBuscado = figuraId;
    seccionBuscada = '1';
  }
  
  Logger.log('Buscando para eliminar: docId=' + docId + ', seccion=' + seccionBuscada + ', orden=' + ordenBuscado);
  
  // Buscar y eliminar
  for (let i = 1; i < values.length; i++) {
    const filaDocId = String(values[i][0]);
    const filaSeccion = String(values[i][1]);
    const filaOrden = String(values[i][2]);
    
    if (filaDocId == docId && filaSeccion == seccionBuscada && filaOrden == ordenBuscado) {
      const filaAEliminar = i + 1;
      Logger.log('Eliminando fila: ' + filaAEliminar);
      
      try {
        sheet.deleteRow(filaAEliminar);
        Logger.log('Fila eliminada exitosamente');
      } catch (deleteError) {
        Logger.log('ERROR eliminando fila: ' + deleteError.toString());
        throw new Error('Error eliminando fila: ' + deleteError.toString());
      }
      
      return { 
        message: 'Figura eliminada correctamente',
        figuraId: `${filaSeccion}-${filaOrden}`,
        rowDeleted: filaAEliminar
      };
    }
  }
  
  Logger.log('ERROR: Figura no encontrada para eliminar');
  throw new Error(`No se encontró la figura con ID "${figuraId}" (docId: ${docId}, seccion: ${seccionBuscada}, orden: ${ordenBuscado})`);
}

/**
 * Función de prueba para verificar que el script funciona
 */
function testScript() {
  Logger.log('=== TEST SCRIPT ===');
  Logger.log('Script funcionando correctamente');
  Logger.log('Spreadsheet: ' + SpreadsheetApp.getActiveSpreadsheet().getName());
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Figuras');
  if (sheet) {
    Logger.log('Hoja Figuras encontrada');
    Logger.log('Última fila: ' + sheet.getLastRow());
  } else {
    Logger.log('ERROR: Hoja Figuras no encontrada');
  }
  
  return 'Test completado - revisa los logs';
}