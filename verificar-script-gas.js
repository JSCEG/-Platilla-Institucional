/**
 * SCRIPT DE VERIFICACIÓN PARA GOOGLE APPS SCRIPT
 * 
 * Copia este código en tu Google Apps Script para verificar que funciona correctamente
 */

function doPost(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    // Log para debugging
    console.log('📥 Petición recibida');
    console.log('📋 Headers:', JSON.stringify(e.parameter));
    
    // Verificar que hay datos
    if (!e.postData || !e.postData.contents) {
      throw new Error('No se recibieron datos POST');
    }
    
    console.log('📄 Datos recibidos:', e.postData.contents);
    
    // Parsear datos
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    console.log('🎯 Acción solicitada:', action);
    
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
        
      case 'TEST_CONEXION':
        result = { message: 'Conexión exitosa', timestamp: new Date().toISOString() };
        break;
        
      default:
        throw new Error(`Acción no válida: ${action}`);
    }

    console.log('✅ Resultado:', JSON.stringify(result));

    output.setContent(JSON.stringify({
      success: true,
      data: result
    }));

  } catch (error) {
    console.error('❌ Error:', error.toString());
    
    output.setContent(JSON.stringify({
      success: false,
      error: error.toString(),
      stack: error.stack || 'No stack trace available'
    }));
  }
  
  return output;
}

/**
 * Función GET para verificar que el script está activo
 */
function doGet(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  output.setContent(JSON.stringify({
    success: true,
    message: 'Google Apps Script está funcionando',
    timestamp: new Date().toISOString(),
    method: 'GET'
  }));
  
  return output;
}

/**
 * Listar todas las figuras de un documento
 */
function listarFiguras(docId) {
  console.log('📋 Listando figuras para documento:', docId);
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Figuras');
  if (!sheet) {
    throw new Error('Hoja "Figuras" no encontrada. Verifica que existe una hoja con ese nombre exacto.');
  }
  
  console.log('📊 Hoja encontrada, obteniendo datos...');
  
  const data = sheet.getDataRange().getValues();
  console.log('📈 Filas encontradas:', data.length);
  
  if (data.length === 0) {
    return [];
  }
  
  const headers = data[0];
  console.log('📋 Headers:', headers);
  
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
  
  console.log('✅ Figuras filtradas:', figuras.length);
  return figuras;
}

/**
 * Crear nueva figura
 */
function crearFigura(docId, figura) {
  console.log('➕ Creando figura:', JSON.stringify(figura));
  
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
  
  console.log('📝 Agregando fila:', newRow);
  sheet.appendRow(newRow);
  
  const result = {
    id: `${figura.SeccionOrden}-${figura.OrdenFigura}`,
    message: 'Figura creada exitosamente'
  };
  
  console.log('✅ Figura creada:', result);
  return result;
}

/**
 * Actualizar figura existente
 */
function actualizarFigura(docId, figuraId, figura) {
  console.log('✏️ Actualizando figura:', figuraId);
  
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
  console.log('🗑️ Eliminando figura:', figuraId);
  
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
 * Función de prueba completa
 */
function testCompleto() {
  console.log('🧪 Iniciando test completo...');
  
  try {
    // 1. Verificar hoja
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Figuras');
    if (!sheet) {
      console.error('❌ Hoja "Figuras" no encontrada');
      return 'ERROR: Hoja "Figuras" no encontrada';
    }
    console.log('✅ Hoja "Figuras" encontrada');
    
    // 2. Verificar estructura
    const data = sheet.getDataRange().getValues();
    console.log('📊 Filas en hoja:', data.length);
    
    if (data.length > 0) {
      console.log('📋 Headers:', data[0]);
    }
    
    // 3. Probar listar figuras
    const figuras = listarFiguras('D01');
    console.log('📋 Figuras encontradas:', figuras.length);
    
    // 4. Probar crear figura de test
    const testFigura = {
      SeccionOrden: '999',
      OrdenFigura: '999',
      RutaArchivo: 'img/test.png',
      Caption: 'Figura de prueba - ' + new Date().toLocaleTimeString(),
      Fuente: 'Test automático'
    };
    
    const resultado = crearFigura('D01', testFigura);
    console.log('✅ Figura de test creada:', resultado);
    
    // 5. Limpiar figura de test
    eliminarFigura('D01', resultado.id);
    console.log('🧹 Figura de test eliminada');
    
    return 'Test completado exitosamente - Todo funciona correctamente';
    
  } catch (error) {
    console.error('❌ Error en test:', error.toString());
    return 'Test falló: ' + error.toString();
  }
}

/**
 * Crear hoja de figuras si no existe
 */
function crearHojaFiguras() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // Verificar si ya existe
  let sheet = spreadsheet.getSheetByName('Figuras');
  if (sheet) {
    console.log('ℹ️ La hoja "Figuras" ya existe');
    return 'La hoja "Figuras" ya existe';
  }
  
  // Crear nueva hoja
  sheet = spreadsheet.insertSheet('Figuras');
  
  // Agregar headers
  const headers = ['DocumentoID', 'SeccionOrden', 'OrdenFigura', 'RutaArchivo', 'Caption', 'Fuente'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formatear headers
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('white');
  
  console.log('✅ Hoja "Figuras" creada con headers');
  return 'Hoja "Figuras" creada exitosamente';
}