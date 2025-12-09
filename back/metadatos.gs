/**
 * ============================================================================
 * BACKEND METADATOS - Google Apps Script
 * ============================================================================
 * Instrucciones:
 * 1. Crea un nuevo proyecto de Apps Script (o archivo .gs en tu proyecto existente)
 * 2. Nómbralo "metadatos" o "Metadatos Backend"
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
      case 'UPDATE_METADATOS':
        result = updateMetadatos(data);
        break;
      case 'CREATE_DOCUMENTO':
        result = createDocumento(data);
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

function updateMetadatos(data) {
  const { docId, metadatos } = data;
  
  if (!docId) throw new Error('Falta el ID del documento');
  if (!metadatos) throw new Error('Faltan los metadatos');
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Documentos');
  if (!sheet) throw new Error('No se encontró la hoja "Documentos"');

  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  // Buscar la fila del documento
  let rowIndex = -1;
  const headers = values[0]; // Primera fila son los headers
  
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) == docId) { // Columna 0 es ID
      rowIndex = i + 1; // +1 porque las filas en Sheets son 1-indexed
      break;
    }
  }

  if (rowIndex === -1) {
    throw new Error(`No se encontró el documento con ID "${docId}"`);
  }

  // Mapeo de campos a columnas (basado en el orden típico)
  const columnMap = {
    'Titulo': 1,
    'Subtitulo': 2,
    'Autor': 3,
    'Fecha': 4,
    'Institucion': 5,
    'Unidad': 6,
    'DocumentoCorto': 7,
    'Version': 8,
    'PalabrasClave': 9,
    'PortadaRuta': 10,
    'ContraportadaRuta': 11,
    'ResumenEjecutivo': 12,
    'DatosClave': 13
  };

  // Actualizar cada campo
  for (const [campo, colIndex] of Object.entries(columnMap)) {
    if (metadatos.hasOwnProperty(campo)) {
      sheet.getRange(rowIndex, colIndex + 1).setValue(metadatos[campo] || '');
    }
  }

  return { 
    message: 'Metadatos actualizados correctamente',
    updatedDocId: docId 
  };
}

function createDocumento(data) {
  const { docId, metadatos } = data;
  
  if (!docId) throw new Error('Falta el ID del documento');
  if (!metadatos) throw new Error('Faltan los metadatos');
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Documentos');
  if (!sheet) throw new Error('No se encontró la hoja "Documentos"');

  // Verificar que no exista ya
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) == docId) {
      throw new Error(`Ya existe un documento con ID "${docId}"`);
    }
  }

  // Crear nueva fila
  const newRow = [
    docId,
    metadatos.Titulo || '',
    metadatos.Subtitulo || '',
    metadatos.Autor || '',
    metadatos.Fecha || '',
    metadatos.Institucion || '',
    metadatos.Unidad || '',
    metadatos.DocumentoCorto || '',
    metadatos.Version || '',
    metadatos.PalabrasClave || '',
    metadatos.PortadaRuta || '',
    metadatos.ContraportadaRuta || '',
    metadatos.ResumenEjecutivo || '',
    metadatos.DatosClave || ''
  ];

  sheet.appendRow(newRow);

  return { 
    message: 'Documento creado correctamente',
    createdDocId: docId 
  };
}
