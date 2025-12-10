/**
 * ============================================================================
 * BACKEND FIGURAS - VERSIÓN NUEVA Y LIMPIA
 * ============================================================================
 * Sistema CRUD simple y robusto para figuras
 */

function doPost(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    // Parsear datos
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    let result = {};

    switch (action) {
      case 'LISTAR_FIGURAS':
        result = listarFiguras(data.docId);
        break;
        
      case 'CREAR_FIGURA':
        result = crearFigura(data.docId, data.figura);
        break;
        
      case 'ACTUALIZAR_FIGURA':
        result = actualizarFigura(data.docId, data.figuraId, data.figura);
        break;
        
      case 'ELIMINAR_FIGURA':
        result = eliminarFigura(data.docId, data.figuraId);
        break;
        
      default:
        throw new Error(`Acción no válida: ${action}`);
    }

    output.setContent(JSON.stringify({
      success: true,
      data: result
    }));

  } catch (error) {
    output.setContent(JSON.stringify({
      success: false,
      error: error.toString()
    }));
  }
  
  return output;
}

/**
 * Listar todas las figuras de un documento
 */
function listarFiguras(docId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Figuras');
  if (!sheet) throw new Error('Hoja "Figuras" no encontrada');
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const figuras = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] === docId) { // DocumentoID
      figuras.push({
        DocumentoID: row[0],
        SeccionOrden: row[1],
        OrdenFigura: row[2],
        RutaArchivo: row[3],
        Caption: row[4],
        Fuente: row[5],
        id: `${row[1]}-${row[2]}` // ID compuesto
      });
    }
  }
  
  return figuras;
}

/**
 * Crear nueva figura
 */
function crearFigura(docId, figura) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Figuras');
  if (!sheet) throw new Error('Hoja "Figuras" no encontrada');
  
  // Verificar que no exista ya una figura con la misma sección y orden
  const figuras = listarFiguras(docId);
  const existe = figuras.find(f => 
    f.SeccionOrden === figura.SeccionOrden && 
    f.OrdenFigura === figura.OrdenFigura
  );
  
  if (existe) {
    throw new Error(`Ya existe una figura ${figura.SeccionOrden}.${figura.OrdenFigura}`);
  }
  
  // Agregar nueva fila
  const newRow = [
    docId,
    figura.SeccionOrden,
    figura.OrdenFigura,
    figura.RutaArchivo,
    figura.Caption,
    figura.Fuente
  ];
  
  sheet.appendRow(newRow);
  
  return {
    id: `${figura.SeccionOrden}-${figura.OrdenFigura}`,
    message: 'Figura creada exitosamente'
  };
}

/**
 * Actualizar figura existente
 */
function actualizarFigura(docId, figuraId, figura) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Figuras');
  if (!sheet) throw new Error('Hoja "Figuras" no encontrada');
  
  const [seccion, orden] = figuraId.split('-');
  const data = sheet.getDataRange().getValues();
  
  // Buscar la fila
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] === docId && row[1] == seccion && row[2] == orden) {
      // Actualizar fila
      sheet.getRange(i + 1, 1, 1, 6).setValues([[
        docId,
        figura.SeccionOrden,
        figura.OrdenFigura,
        figura.RutaArchivo,
        figura.Caption,
        figura.Fuente
      ]]);
      
      return {
        id: `${figura.SeccionOrden}-${figura.OrdenFigura}`,
        message: 'Figura actualizada exitosamente'
      };
    }
  }
  
  throw new Error('Figura no encontrada');
}

/**
 * Eliminar figura
 */
function eliminarFigura(docId, figuraId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Figuras');
  if (!sheet) throw new Error('Hoja "Figuras" no encontrada');
  
  const [seccion, orden] = figuraId.split('-');
  const data = sheet.getDataRange().getValues();
  
  // Buscar y eliminar la fila
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] === docId && row[1] == seccion && row[2] == orden) {
      sheet.deleteRow(i + 1);
      return {
        id: figuraId,
        message: 'Figura eliminada exitosamente'
      };
    }
  }
  
  throw new Error('Figura no encontrada');
}

/**
 * Función de prueba
 */
function testFiguras() {
  // Crear figura de prueba
  const testFigura = {
    SeccionOrden: '99',
    OrdenFigura: '99',
    RutaArchivo: 'img/test.png',
    Caption: 'Figura de prueba',
    Fuente: 'Test'
  };
  
  try {
    const resultado = crearFigura('D01', testFigura);
    Logger.log('Figura creada:', resultado);
    
    const figuras = listarFiguras('D01');
    Logger.log('Figuras encontradas:', figuras.length);
    
    return 'Test completado exitosamente';
  } catch (error) {
    Logger.log('Error en test:', error.toString());
    return 'Test falló: ' + error.toString();
  }
}