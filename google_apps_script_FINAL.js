/**
 * SENER LaTeX Generator - Google Apps Script
 * Genera archivos .tex desde Google Sheets para el template institucional
 * 
 * CONFIGURACIÓN:
 * 1. Cambia CARPETA_SALIDA_ID por tu ID de carpeta de Drive
 * 2. Estructura de hojas:
 *    - Documentos: ID, Titulo, Subtitulo, Autor, Fecha, Institucion, Unidad, DocumentoCorto, PalabrasClave, Version, ResumenEjecutivo, DatosClave
 *    - Secciones: DocumentoID, Orden, Nivel, Titulo, Contenido
 *    - Bibliografia: DocumentoID, Clave, Tipo, Autor, Titulo, Anio, Editorial, Url
 */

const CARPETA_SALIDA_ID = '1NnO4B8EJCx6VNrmDxWwwW3KsHCTID_c2';

/**
 * Crea el menú en la interfaz de Google Sheets
 */
function onOpen() {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('📄 SENER LaTeX')
        .addItem('✨ Generar .tex de este documento', 'generarLatex')
        .addItem('🌐 Abrir Editor Web', 'abrirEditorWeb')
        .addItem('📋 Ver log de errores', 'mostrarLog')
        .addToUi();
}

/**
 * Servir la aplicación web
 */
function doGet(e) {
    const page = e.parameter.page || 'index';

    if (page === 'editor') {
        return HtmlService.createHtmlOutputFromFile('editor')
            .setTitle('SENER LaTeX Editor')
            .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }

    return HtmlService.createHtmlOutputFromFile('index')
        .setTitle('SENER LaTeX - Dashboard')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Abrir editor web desde el menú
 */
function abrirEditorWeb() {
    const url = ScriptApp.getService().getUrl();
    const html = `<script>window.open('${url}', '_blank'); google.script.host.close();</script>`;
    const ui = HtmlService.createHtmlOutput(html);
    SpreadsheetApp.getUi().showModalDialog(ui, 'Abriendo Editor Web...');
}

/**
 * Variable global para logging
 */
let logMensajes = [];

function log(mensaje) {
    console.log(mensaje);
    logMensajes.push(mensaje);
}

function mostrarLog() {
    const ui = SpreadsheetApp.getUi();
    if (logMensajes.length === 0) {
        ui.alert('Log vacío', 'No hay mensajes de log.', ui.ButtonSet.OK);
    } else {
        ui.alert('Log de ejecución', logMensajes.join('\n'), ui.ButtonSet.OK);
    }
    logMensajes = [];
}

/**
 * Convierte cualquier valor a string y lo recorta para logs.
 * En Google Sheets, los valores pueden venir como número/fecha.
 */
function previewTexto(valor, maxLen = 50) {
    const s = (valor === null || valor === undefined) ? '' : valor.toString();
    return s.length > maxLen ? s.substring(0, maxLen) : s;
}

/**
 * Función principal para generar el archivo LaTeX
 */
function generarLatex() {
    logMensajes = [];
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ui = SpreadsheetApp.getUi();

    try {
        log('🚀 Iniciando generación de LaTeX...');

        // 1. Obtener datos de la hoja "Documentos"
        const hojaDocs = ss.getSheetByName('Documentos');
        if (!hojaDocs) {
            ui.alert('❌ Error: No se encuentra la hoja "Documentos".');
            return;
        }

        const filaActiva = hojaDocs.getActiveCell().getRow();
        if (filaActiva < 2) {
            ui.alert('⚠️ Por favor, selecciona una fila de documento válida en la hoja "Documentos".');
            return;
        }

        const datosDoc = obtenerDatosFila(hojaDocs, filaActiva);
        const docId = datosDoc['ID'];

        if (!docId) {
            ui.alert('❌ Error: La fila seleccionada no tiene un ID de documento.');
            return;
        }

        log(`📄 Procesando documento ID: ${docId}`);
        log(`📝 Título: ${datosDoc['Titulo']}`);

        // 2. Leer todas las hojas relacionadas
        const secciones = obtenerRegistros(ss, 'Secciones', docId, 'DocumentoID');
        const bibliografia = obtenerRegistros(ss, 'Bibliografia', docId, 'DocumentoID');
        const figuras = obtenerRegistros(ss, 'Figuras', docId, 'DocumentoID');
        const tablas = obtenerRegistros(ss, 'Tablas', docId, 'DocumentoID');
        const siglas = obtenerRegistros(ss, 'Siglas', docId, 'DocumentoID');
        const glosario = obtenerRegistros(ss, 'Glosario', docId, 'DocumentoID');

        log(`📑 Secciones encontradas: ${secciones.length}`);
        log(`📚 Referencias bibliográficas: ${bibliografia.length}`);
        log(`🖼️ Figuras encontradas: ${figuras.length}`);
        log(`📊 Tablas encontradas: ${tablas.length}`);
        log(`🔤 Siglas encontradas: ${siglas.length}`);
        log(`📖 Términos de glosario: ${glosario.length}`);

        if (secciones.length === 0) {
            ui.alert('⚠️ Advertencia: No se encontraron secciones para este documento.');
        }

        // Ordenar secciones por orden
        secciones.sort((a, b) => {
            const oa = parseFloat(a.Orden) || 0;
            const ob = parseFloat(b.Orden) || 0;
            return oa - ob;
        });

        // 3. Construir el contenido LaTeX
        const tex = construirLatex(datosDoc, secciones, bibliografia, figuras, tablas, siglas, glosario, ss);

        // 4. Guardar archivos en Drive
        guardarArchivos(datosDoc, tex, bibliografia);

        ui.alert('✅ ¡Éxito!', `Archivos generados correctamente.\n\n${logMensajes.join('\n')}`, ui.ButtonSet.OK);

    } catch (e) {
        ui.alert('❌ Error', `${e.toString()}\n\nStack: ${e.stack}`, ui.ButtonSet.OK);
        log(`ERROR: ${e.toString()}`);
        log(`Stack: ${e.stack}`);
    }
}

/**
 * Construye el documento LaTeX completo
 */
function construirLatex(datosDoc, secciones, bibliografia, figuras, tablas, siglas, glosario, ss) {
    let tex = '';

    // Crear mapas para acceso rápido
    const figurasMap = crearMapaPorSeccion(figuras);
    const tablasMap = crearMapaPorSeccion(tablas);

    // --- Metadatos del documento (requerido para axessibility) ---
    tex += `\\DocumentMetadata{\n`;
    tex += `  pdfversion=2.0,\n`;
    tex += `  lang=es-MX,\n`;
    tex += `  pdfstandard=ua-2\n`;
    tex += `}\n\n`;

    // --- Preámbulo ---
    tex += `\\documentclass{sener2025}\n\n`;

    if (bibliografia.length > 0) {
        tex += `\\addbibresource{referencias.bib}\n\n`;
    }

    // --- Metadatos PDF/UA para Accesibilidad ---
    tex += `% --- Metadatos PDF/UA (Accesibilidad Universal) ---\n`;
    tex += `\\hypersetup{\n`;
    tex += `  pdftitle={${escaparLatex(datosDoc['Titulo'] || 'Documento SENER')}},\n`;
    tex += `  pdfauthor={${escaparLatex(datosDoc['Autor'] || 'Secretaría de Energía')}},\n`;
    tex += `  pdfsubject={${escaparLatex(datosDoc['Subtitulo'] || datosDoc['Titulo'] || 'Documento Institucional')}},\n`;
    tex += `  pdfkeywords={${escaparLatex(datosDoc['PalabrasClave'] || 'SENER, Energía, México')}},\n`;
    tex += `  pdfcreationdate={D:${generarFechaPDF()}},\n`;
    tex += `  pdfversion={${escaparLatex(datosDoc['Version'] || '1.0')}}\n`;
    tex += `}\n\n`;

    // --- Metadatos del Documento ---
    tex += `% --- Metadatos del Documento ---\n`;
    tex += `\\title{${escaparLatex(datosDoc['Titulo'] || '')}}\n`;
    if (datosDoc['Subtitulo']) {
        tex += `\\subtitle{${escaparLatex(datosDoc['Subtitulo'])}}\n`;
    }
    tex += `\\author{${escaparLatex(datosDoc['Autor'] || 'SENER')}}\n`;

    // Formatear fecha
    const fechaFormateada = formatearFecha(datosDoc['Fecha']);
    tex += `\\date{${escaparLatex(fechaFormateada)}}\n`;

    tex += `\\institucion{${escaparLatex(datosDoc['Institucion'] || 'Secretaría de Energía')}}\n`;
    tex += `\\unidad{${escaparLatex(datosDoc['Unidad'] || '')}}\n`;
    tex += `\\setDocumentoCorto{${escaparLatex((datosDoc['DocumentoCorto'] || '').toString().trim())}}\n`;
    tex += `\\palabrasclave{${escaparLatex((datosDoc['PalabrasClave'] || '').toString().trim())}}\n`;
    tex += `\\version{${escaparLatex((datosDoc['Version'] || '1.0').toString().trim())}}\n`;

    tex += `\n\\begin{document}\n\n`;

    // --- Portada ---
    // Si hay ruta de portada personalizada, usarla
    if (datosDoc['PortadaRuta']) {
        tex += `\\portadafondo[${escaparLatex(datosDoc['PortadaRuta'])}]\n\n`;
    } else {
        tex += `\\portadafondo\n\n`;
    }

    // --- Tabla de Contenidos ---
    tex += `\\tableofcontents\n\\newpage\n\n`;

    // --- Índices de Figuras y Tablas (si existen) ---
    if (figuras.length > 0) {
        tex += `\\listafiguras\n\\newpage\n\n`;
    }
    if (tablas.length > 0) {
        tex += `\\listatablas\n\\newpage\n\n`;
    }

    // --- Resumen Ejecutivo ---
    if (datosDoc['ResumenEjecutivo']) {
        tex += `\\begin{resumenejecutivo}\n`;
        tex += `${escaparTextoConEtiquetas(datosDoc['ResumenEjecutivo'])}\n`;
        tex += `\\end{resumenejecutivo}\n\n`;
    }

    // --- Datos Clave ---
    if (datosDoc['DatosClave']) {
        tex += `\\begin{datosclave}\n`;
        const textoDatos = datosDoc['DatosClave'].toString();
        const items = textoDatos.split(/[;\n]/);
        tex += `  \\begin{itemize}\n`;
        items.forEach(item => {
            if (item.trim()) {
                tex += `    \\item ${escaparLatex(item.trim())}\n`;
            }
        });
        tex += `  \\end{itemize}\n`;
        tex += `\\end{datosclave}\n\n`;
    }

    // --- Secciones ---
    const resultado = procesarSecciones(secciones, figurasMap, tablasMap, ss);
    tex += resultado.contenido;

    // --- Glosario ---
    if (glosario.length > 0) {
        tex += generarGlosario(glosario);
    }

    // --- Directorio ---
    if (bibliografia.length > 0) {
        tex += `\\printbibliography\n\n`;
    }

    // --- Siglas y Acrónimos ---
    if (siglas.length > 0) {
        tex += generarSiglas(siglas);
    }

    // --- Página de Créditos (si existe) ---
    if (resultado.directorio) {
        tex += `\\paginacreditos{\n${resultado.directorio}\n}\n`;
    }

    // --- Contraportada ---
    if (resultado.contraportada) {
        // Si hay ruta de contraportada personalizada, usarla
        if (datosDoc['ContraportadaRuta']) {
            tex += `\\contraportada[${escaparLatex(datosDoc['ContraportadaRuta'])}]{\n${resultado.contraportada}\n}\n`;
        } else {
            tex += `\\contraportada{\n${resultado.contraportada}\n}\n`;
        }
    }

    tex += `\n\\end{document}\n`;

    return tex;
}

/**
 * Procesa todas las secciones del documento
 */
function procesarSecciones(secciones, figurasMap, tablasMap, ss) {
    let contenido = '';
    let directorio = '';
    let contraportada = '';
    let anexosIniciados = false;
    let contadorPortadas = 0;

    secciones.forEach((seccion, index) => {
        const nivel = (seccion['Nivel'] || 'Seccion').toString().toLowerCase();
        const titulo = seccion['Titulo'] || '';
        const contenidoRaw = (seccion['Contenido'] || '').toString();
        const ordenSeccion = seccion['Orden'];

        log(`  📄 Sección ${index + 1}: [${nivel}] ${previewTexto(titulo, 50)}...`);

        // Detectar inicio de Anexos
        if (nivel.includes('anexo') && !anexosIniciados) {
            contenido += `\\anexos\n\n`;
            anexosIniciados = true;
        }

        // --- NIVELES ESPECIALES ---

        // A. Portada de Sección
        if (nivel === 'portada') {
            contadorPortadas++;
            contenido += `\\portadaseccion{${contadorPortadas}}{${escaparLatex(titulo)}}{${escaparLatex(contenidoRaw)}}\n\n`;
            return;
        }

        // B. Directorio
        if (nivel === 'directorio') {
            directorio = procesarDirectorio(contenidoRaw);
            return;
        }

        // C. Contraportada
        if (nivel.includes('datos finales') || nivel.includes('datosfinales') || nivel === 'contraportada') {
            contraportada = procesarContraportada(contenidoRaw);
            return;
        }

        // --- NIVELES NORMALES ---
        contenido += generarComandoSeccion(nivel, titulo);
        contenido += procesarContenido(contenidoRaw);

        // Insertar figuras y tablas de esta sección
        if (figurasMap[ordenSeccion]) {
            figurasMap[ordenSeccion].forEach(fig => {
                contenido += generarFigura(fig);
            });
        }

        if (tablasMap[ordenSeccion]) {
            tablasMap[ordenSeccion].forEach(tabla => {
                contenido += generarTabla(tabla, ss);
            });
        }

        contenido += '\n\n';
    });

    return {
        contenido: contenido,
        directorio: directorio,
        contraportada: contraportada
    };
}

/**
 * Genera el comando LaTeX apropiado según el nivel
 */
function generarComandoSeccion(nivel, titulo) {
    const tituloEscapado = escaparLatex(titulo);

    // Normalizar nivel
    nivel = nivel.toLowerCase()
        .replace(/ó/g, 'o')
        .replace(/á/g, 'a')
        .replace(/é/g, 'e')
        .replace(/í/g, 'i')
        .replace(/ú/g, 'u');

    if (nivel === 'subseccion' || nivel === 'subanexo') {
        return `\\subsection{${tituloEscapado}}\n\n`;
    } else if (nivel === 'subsubseccion' || nivel.includes('subsub')) {
        return `\\subsubsection{${tituloEscapado}}\n\n`;
    } else if (nivel.includes('parrafo') || nivel.includes('titulo pequeño')) {
        return `\\paragraph{${tituloEscapado}}\n\n`;
    } else {
        // Default: sección principal
        return `\\section{${tituloEscapado}}\n\n`;
    }
}

/**
 * Procesa el contenido de una sección (listas, bloques, etc.)
 */
function procesarContenido(contenidoRaw) {
    const lineas = contenidoRaw.split('\n');
    let resultado = '';
    let enLista = false;
    let enBloque = false;
    let tipoBloque = '';
    let tituloBloque = '';
    let contenidoBloque = '';

    for (let i = 0; i < lineas.length; i++) {
        const linea = lineas[i];
        const lineaTrim = linea.trim();

        // 1. Detectar INICIO de bloque
        const inicioBloqueMatch = lineaTrim.match(/^\[\[(ejemplo|caja|alerta|info|destacado|recuadro)(?::\s*(.*))?\]\]$/i);
        if (inicioBloqueMatch) {
            if (enLista) {
                resultado += '\\end{itemize}\n';
                enLista = false;
            }
            enBloque = true;
            tipoBloque = inicioBloqueMatch[1].toLowerCase();
            tituloBloque = inicioBloqueMatch[2] || '';
            contenidoBloque = '';
            continue;
        }

        // 2. Detectar FIN de bloque
        const finBloqueMatch = lineaTrim.match(/^\[\[\/(ejemplo|caja|alerta|info|destacado|recuadro)\]\]$/i);
        if (finBloqueMatch) {
            resultado += generarBloque(tipoBloque, tituloBloque, contenidoBloque);
            enBloque = false;
            contenidoBloque = '';
            continue;
        }

        // 3. Si estamos DENTRO de un bloque, acumular contenido
        if (enBloque) {
            contenidoBloque += linea + '\n';
            continue;
        }

        // 4. Procesamiento normal (fuera de bloques)
        const esItemLista = lineaTrim.match(/^[-*•]\s+(.*)/);

        if (esItemLista) {
            if (!enLista) {
                resultado += '\\begin{itemize}\n';
                enLista = true;
            }
            resultado += `  \\item ${escaparTextoConEtiquetas(esItemLista[1])}\n`;
        } else {
            if (enLista) {
                resultado += '\\end{itemize}\n';
                enLista = false;
            }

            // Procesar línea normal
            if (lineaTrim.startsWith('[[tabla:')) {
                // Referencia a tabla inline (opcional, las tablas se insertan automáticamente)
                const match = lineaTrim.match(/\[\[tabla:(.+?)\]\]/);
                if (match) {
                    resultado += `% Referencia a tabla: ${match[1]}\n`;
                }
            } else if (lineaTrim.startsWith('[[figura:')) {
                // Referencia a figura inline (opcional, las figuras se insertan automáticamente)
                const match = lineaTrim.match(/\[\[figura:(.+?)\]\]/);
                if (match) {
                    resultado += `% Referencia a figura: ${match[1]}\n`;
                }
            } else if (lineaTrim !== '') {
                resultado += `${escaparTextoConEtiquetas(linea)}\n`;
            } else {
                resultado += '\n';
            }
        }
    }

    // Cerrar lista si quedó abierta
    if (enLista) {
        resultado += '\\end{itemize}\n';
    }

    return resultado;
}

/**
 * Genera un bloque LaTeX (ejemplo, caja, alerta, etc.)
 */
function generarBloque(tipo, titulo, contenido) {
    // Procesar el contenido del bloque (puede tener listas internas)
    const contenidoProcesado = procesarContenido(contenido);

    const tituloSafe = escaparLatex(titulo);
    const opts = tituloSafe ? `[title={${tituloSafe}}]` : '';

    if (tipo === 'ejemplo') {
        return `\\begin{ejemplo}${opts}\n${contenidoProcesado}\\end{ejemplo}\n`;
    } else if (tipo === 'caja' || tipo === 'recuadro') {
        return `\\begin{recuadro}${opts}\n${contenidoProcesado}\\end{recuadro}\n`;
    } else if (tipo === 'alerta') {
        return `\\begin{calloutWarning}${opts}\n${contenidoProcesado}\\end{calloutWarning}\n`;
    } else if (tipo === 'info') {
        return `\\begin{calloutTip}${opts}\n${contenidoProcesado}\\end{calloutTip}\n`;
    } else if (tipo === 'destacado') {
        return `\\begin{destacado}\n${contenidoProcesado}\\end{destacado}\n`;
    }

    return contenidoProcesado;
}

/**
 * Procesa el contenido del directorio
 */
function procesarDirectorio(contenidoRaw) {
    const lines = contenidoRaw.split('\n').map(l => l.trim()).filter(l => l);
    let dirTex = '\\begin{center}\n';

    for (let i = 0; i < lines.length; i += 2) {
        const nombre = lines[i];
        const cargo = lines[i + 1] || '';
        dirTex += `{\\patriafont\\fontsize{12}{14}\\selectfont\\color{gobmxGuinda} ${escaparLatex(nombre)}}\\\\\n`;
        if (cargo) {
            dirTex += `{\\patriafont\\fontsize{9}{11}\\selectfont ${escaparLatex(cargo)}}\\\\[0.5cm]\n`;
        } else {
            dirTex += `\\\\[0.5cm]\n`;
        }
    }

    dirTex += '\\end{center}';
    return dirTex;
}

/**
 * Procesa el contenido de la contraportada
 */
function procesarContraportada(contenidoRaw) {
    const lines = contenidoRaw.split('\n');
    let contraTex = '';

    for (let i = 0; i < lines.length; i++) {
        const l = lines[i].trim();
        const esUltima = (i === lines.length - 1);
        const siguienteEsVacia = (i < lines.length - 1) && (lines[i + 1].trim() === '');

        if (l === '') {
            if (!esUltima) {
                contraTex += `\\\\[0.5cm]\n`;
            }
        } else {
            contraTex += escaparTextoConEtiquetas(l);
            if (!esUltima && !siguienteEsVacia) {
                contraTex += `\\\\\n`;
            }
        }
    }

    return contraTex;
}

/**
 * Guarda los archivos .tex y .bib en Drive
 */
function guardarArchivos(datosDoc, tex, bibliografia) {
    const carpeta = DriveApp.getFolderById(CARPETA_SALIDA_ID);
    const nombreBase = datosDoc['DocumentoCorto'] || 'documento_generado';

    // Guardar .tex
    const archivosTexExistentes = carpeta.getFilesByName(nombreBase + '.tex');
    if (archivosTexExistentes.hasNext()) {
        archivosTexExistentes.next().setTrashed(true);
    }
    carpeta.createFile(nombreBase + '.tex', tex, 'text/plain');
    log(`✅ Archivo ${nombreBase}.tex creado`);

    // Guardar .bib si hay referencias
    if (bibliografia.length > 0) {
        let bibContent = '';
        bibliografia.forEach(ref => {
            const tipo = ref['Tipo'] ? ref['Tipo'].toLowerCase() : 'misc';
            bibContent += `@${tipo}{${ref['Clave']},\n`;
            if (ref['Autor']) bibContent += `  author = {${ref['Autor']}},\n`;
            if (ref['Titulo']) bibContent += `  title = {${ref['Titulo']}},\n`;
            if (ref['Anio']) bibContent += `  year = {${ref['Anio']}},\n`;
            if (ref['Editorial']) bibContent += `  publisher = {${ref['Editorial']}},\n`;
            if (ref['Url']) bibContent += `  url = {${ref['Url']}},\n`;
            bibContent += `}\n\n`;
        });

        const archivosBibExistentes = carpeta.getFilesByName('referencias.bib');
        if (archivosBibExistentes.hasNext()) {
            archivosBibExistentes.next().setTrashed(true);
        }
        carpeta.createFile('referencias.bib', bibContent, 'text/plain');
        log(`✅ Archivo referencias.bib creado con ${bibliografia.length} referencias`);
    }
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Obtiene todos los registros de una hoja que coincidan con docId
 * @param {Spreadsheet} ss - Spreadsheet activo
 * @param {string} nombreHoja - Nombre de la hoja
 * @param {string} docId - ID del documento a filtrar
 * @param {string} columnaId - Nombre de la columna que contiene el ID (default: 'ID')
 */
function obtenerRegistros(ss, nombreHoja, docId, columnaId = 'ID') {
    const hoja = ss.getSheetByName(nombreHoja);
    if (!hoja) {
        log(`⚠️ Advertencia: No se encuentra la hoja "${nombreHoja}"`);
        return [];
    }

    const datos = hoja.getDataRange().getValues();
    if (datos.length < 2) {
        log(`⚠️ Advertencia: La hoja "${nombreHoja}" está vacía`);
        return [];
    }

    const headers = datos[0];
    const indiceId = headers.indexOf(columnaId);

    if (indiceId === -1) {
        log(`⚠️ Advertencia: No se encuentra la columna "${columnaId}" en "${nombreHoja}"`);
        return [];
    }

    const registros = [];

    for (let i = 1; i < datos.length; i++) {
        const fila = datos[i];
        // Comparación flexible (== en lugar de ===)
        if (fila[indiceId] == docId) {
            const obj = {};
            for (let j = 0; j < headers.length; j++) {
                obj[headers[j]] = fila[j];
            }
            registros.push(obj);
        }
    }

    return registros;
}

/**
 * Obtiene los datos de una fila específica como objeto
 */
function obtenerDatosFila(hoja, numFila) {
    const headers = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
    const valores = hoja.getRange(numFila, 1, 1, hoja.getLastColumn()).getValues()[0];
    const obj = {};
    for (let i = 0; i < headers.length; i++) {
        obj[headers[i]] = valores[i];
    }
    return obj;
}

/**
 * Formatea una fecha al formato español
 */
function formatearFecha(fechaRaw) {
    if (!fechaRaw) return '';

    if (fechaRaw instanceof Date) {
        const meses = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ];
        return `${fechaRaw.getDate()} de ${meses[fechaRaw.getMonth()]} de ${fechaRaw.getFullYear()}`;
    }

    return fechaRaw.toString();
}

/**
 * Genera fecha en formato PDF (YYYYMMDDHHmmSS) para metadatos
 */
function generarFechaPDF() {
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    const hora = String(ahora.getHours()).padStart(2, '0');
    const min = String(ahora.getMinutes()).padStart(2, '0');
    const seg = String(ahora.getSeconds()).padStart(2, '0');
    return `${año}${mes}${dia}${hora}${min}${seg}`;
}

/**
 * Escapa caracteres especiales de LaTeX
 */
function escaparLatex(texto) {
    if (!texto) return '';
    return texto.toString()
        .replace(/\\/g, '\\textbackslash{}')
        .replace(/([&%$#_{}])/g, '\\$1')
        .replace(/~/g, '\\textasciitilde{}')
        .replace(/\^/g, '\\textasciicircum{}');
}

/**
 * Procesa texto de fuente/notas al pie
 * Convierte \n en saltos de línea reales, escapa LaTeX, agrega hypertargets
 * y formatea las notas como lista con viñetas
 */
function procesarTextoFuente(texto) {
    if (!texto) return '';

    // Convertir \n literales en saltos de línea reales
    const textoConSaltos = texto.toString().replace(/\\n/g, '\n');

    // Separar en líneas
    const lineas = textoConSaltos.split('\n').filter(l => l.trim() !== '');

    // Separar fuente principal de notas
    const lineasFuente = [];
    const lineasNotas = [];

    lineas.forEach(linea => {
        const matchNota = linea.match(/^([0-9]+\/|[a-zA-Z]+\/)\s+(.*)$/);
        if (matchNota) {
            lineasNotas.push({
                nota: matchNota[1],
                texto: matchNota[2]
            });
        } else {
            lineasFuente.push(linea);
        }
    });

    // Construir resultado
    let resultado = '';

    // Agregar fuente principal
    if (lineasFuente.length > 0) {
        resultado += lineasFuente.map(l => escaparLatex(l)).join('\n');
    }

    // Agregar notas como lista si existen
    if (lineasNotas.length > 0) {
        resultado += '\n\n{\\fontsize{9pt}{11pt}\\selectfont\n';
        // Evitar opciones en itemize: con latex-lab/testphase puede causar
        // "Package block Error: Some keys specified on the itemize environment are unknown".
        resultado += '\\begin{itemize}\n';

        lineasNotas.forEach(item => {
            const idNota = generarIdNota(item.nota);
            const notaEscapada = escaparLatex(item.nota);
            const textoEscapado = escaparLatex(item.texto);

            resultado += `  \\item[\\hypertarget{${idNota}}{${notaEscapada}}] ${textoEscapado}\n`;
        });

        resultado += '\\end{itemize}\n}';
    }

    return resultado;
}

/**
 * Crea un mapa de elementos agrupados por SeccionOrden
 */
function crearMapaPorSeccion(elementos) {
    const mapa = {};
    elementos.forEach(elem => {
        const seccion = elem['SeccionOrden'];
        if (seccion) {
            if (!mapa[seccion]) {
                mapa[seccion] = [];
            }
            mapa[seccion].push(elem);
        }
    });

    // Ordenar elementos dentro de cada sección
    Object.keys(mapa).forEach(key => {
        mapa[key].sort((a, b) => {
            const ordenA = parseFloat(a['OrdenFigura'] || a['OrdenTabla'] || 0);
            const ordenB = parseFloat(b['OrdenFigura'] || b['OrdenTabla'] || 0);
            return ordenA - ordenB;
        });
    });

    return mapa;
}

/**
 * Genera el código LaTeX para una figura
 */
function generarFigura(figura) {
    const rutaArchivo = figura['RutaArchivo'] || '';
    const caption = figura['Caption'] || '';
    const fuente = figura['Fuente'] || '';
    const textoAlt = figura['TextoAlternativo'] || caption; // Usar campo específico o caption como fallback

    // Detectar si es URL de Google Drive
    let rutaFinal = rutaArchivo;
    let esGoogleDrive = false;
    const driveMatch = rutaArchivo.match(/\/d\/([a-zA-Z0-9_-]+)/);

    if (driveMatch) {
        esGoogleDrive = true;
        const fileId = driveMatch[1];
        // Generar nombre de archivo local
        rutaFinal = `img/figura_${fileId.substring(0, 8)}.png`;
        log(`  🖼️ Figura de Google Drive detectada: ${previewTexto(caption, 40)}...`);
        log(`  ⚠️ IMPORTANTE: Descarga manualmente el archivo con ID: ${fileId}`);
        log(`  📁 Guárdalo como: ${rutaFinal}`);
    } else {
        log(`  🖼️ Figura local: ${previewTexto(caption, 40)}...`);
    }

    let tex = `\\begin{figure}[H]\n`;
    tex += `  \\centering\n`;

    if (esGoogleDrive) {
        tex += `  % IMPORTANTE: Descarga la imagen de Google Drive\n`;
        tex += `  % URL: ${rutaArchivo}\n`;
        tex += `  % Guárdala como: ${rutaFinal}\n`;
    }

    // Agregar texto alternativo para accesibilidad
    tex += `  % Texto alternativo para accesibilidad\n`;
    tex += `  \\pdftooltip{\\includegraphics[width=0.8\\textwidth]{${rutaFinal}}}{${escaparLatex(textoAlt)}}\n`;
    tex += `  \\caption{${escaparLatex(caption)}}\n`;

    // Generar label automático para referencias cruzadas
    const labelFigura = generarLabel(caption);
    tex += `  \\label{fig:${labelFigura}}\n`;

    tex += `\\end{figure}\n`;

    if (fuente) {
        tex += `\\fuente{${procesarTextoFuente(fuente)}}\n`;
    }

    tex += `\n`;
    return tex;
}

/**
 * Genera el código LaTeX para una tabla
 */
function generarTabla(tabla, ss) {
    const titulo = tabla['Titulo'] || '';
    const fuente = tabla['Fuente'] || '';
    const datosRef = tabla['DatosCSV'] || '';

    log(`  📊 Tabla detectada: ${previewTexto(titulo, 40)}...`);

    let esLarga = false;
    let texInicio = '';
    let texFin = '';
    let tex = '';

    // Procesar datos de la tabla
    if (datosRef.includes('!')) {
        // Referencia a rango en otra hoja (ej: Datos_Tablas!A1:E4 o Datos Tablas!A1:E4)
        const [nombreHojaRaw, rango] = datosRef.split('!');
        // En Google Sheets es común referenciar hojas con comillas simples cuando hay espacios:
        //   'Datos Tablas'!A1:E4
        // Normalizamos para poder resolver la hoja real.
        const nombreHoja = String(nombreHojaRaw || '')
            .trim()
            .replace(/^['"]+|['"]+$/g, '');
        log(`    📋 Leyendo datos de "${nombreHoja}" rango ${rango}`);

        try {
            // Intentar encontrar la hoja con el nombre exacto primero
            let hojaDatos = ss.getSheetByName(nombreHoja);

            // Si no se encuentra, intentar variaciones comunes
            if (!hojaDatos) {
                // Intentar con espacios en lugar de guiones bajos
                const nombreConEspacios = nombreHoja.replace(/_/g, ' ');
                hojaDatos = ss.getSheetByName(nombreConEspacios);
                if (hojaDatos) {
                    log(`    ✅ Hoja encontrada como: "${nombreConEspacios}"`);
                }
            }

            // Si aún no se encuentra, intentar con guiones bajos en lugar de espacios
            if (!hojaDatos) {
                const nombreConGuiones = nombreHoja.replace(/ /g, '_');
                hojaDatos = ss.getSheetByName(nombreConGuiones);
                if (hojaDatos) {
                    log(`    ✅ Hoja encontrada como: "${nombreConGuiones}"`);
                }
            }

            if (hojaDatos) {
                const datosTabla = hojaDatos.getRange(rango).getValues();
                log(`    ✅ Datos leídos: ${datosTabla.length} filas`);
                const resultado = procesarDatosArray(datosTabla, titulo);
                esLarga = resultado.tipo === 'longtable';
                if (esLarga) {
                    texInicio = `\\begin{tabladoradoLargo}\n`;
                    texFin = `\\end{tabladoradoLargo}\n`;
                } else {
                    texInicio = `\\begin{tabladorado}\n`;
                    texInicio += `  \\caption{${escaparLatex(titulo)}}\n`;
                    texInicio += `  \\label{tab:${generarLabel(titulo)}}\n`;
                    texFin = `\\end{tabladorado}\n`;
                }
                texInicio += resultado.contenido;
            } else {
                log(`    ⚠️ No se encontró la hoja: "${nombreHoja}"`);
                log(`    💡 Hojas disponibles: ${ss.getSheets().map(s => s.getName()).join(', ')}`);
                // No inyectamos una tabla de error al PDF; dejamos el diagnóstico en comentarios del .tex.
                tex += `  % ERROR: No se encontró la hoja "${nombreHoja}"\n`;
                tex += `  % Hojas disponibles: ${ss.getSheets().map(s => s.getName()).join(', ')}\n`;
            }
        } catch (e) {
            log(`    ❌ Error al leer rango: ${e.toString()}`);
            // Igual: evitamos meter “tablas de error” dentro del documento.
            tex += `  % ERROR: ${e.toString()}\n`;
        }
    } else {
        // Datos CSV directos
        texInicio += procesarDatosCSV(datosRef);
    }

    if (!texInicio) {
        texInicio = `\\begin{tabladorado}\n  \\caption{${escaparLatex(titulo)}}\n  \\label{tab:${generarLabel(titulo)}}\n`;
        texFin = `\\end{tabladorado}\n`;
    }
    if (tex === '') {
        tex = texInicio + texFin;
    }

    if (fuente) {
        tex += `\\fuente{${procesarTextoFuente(fuente)}}\n`;
    }

    tex += `\n`;
    return tex;
}

/**
 * Procesa un array 2D de datos (desde Google Sheets) y genera tabla LaTeX
 * Si la tabla tiene muchas columnas, la divide automáticamente
 */
function procesarDatosArray(datos, tituloTabla) {
    if (!datos || datos.length === 0) {
        return { tipo: 'tabular', contenido: `  \\begin{tabular}{lc}\n    % Sin datos\n  \\end{tabular}\n` };
    }

    const numCols = datos[0].length;
    const MAX_COLS_POR_TABLA = 6; // Máximo 6 columnas por tabla (incluyendo la primera)
    const MAX_FILAS_COMPACTA = 20; // Umbral para usar tabular en tablas cortas
    const MAX_FILAS_POR_PARTE = 35; // Si hay demasiadas filas, dividir por partes

    // Si la tabla cabe en una sola parte
    if (numCols <= MAX_COLS_POR_TABLA) {
        const numFilas = Math.max(0, datos.length - 1);
        if (numFilas <= MAX_FILAS_COMPACTA) {
            return { tipo: 'tabular', contenido: generarTablaCompacta(datos) };
        }
        if (numFilas > MAX_FILAS_POR_PARTE) {
            return { tipo: 'longtable', contenido: dividirTablaPorFilas(datos, MAX_FILAS_POR_PARTE, tituloTabla) };
        }
        return { tipo: 'longtable', contenido: generarTablaSimple(datos, tituloTabla) };
    }

    // Dividir tabla en múltiples partes
    return { tipo: 'longtable', contenido: dividirTabla(datos, MAX_COLS_POR_TABLA, tituloTabla) };
}

/**
 * Genera una tabla simple sin división
 */
function generarTablaSimple(datos, tituloTabla) {
    const numCols = datos[0].length;

    // Calcular ancho de columnas para longtable
    // Primera columna: 3cm con negritas automáticas (B), resto: distribuido equitativamente
    const anchoRestante = `${(11 / (numCols - 1)).toFixed(2)}cm`; // ancho útil compacto
    const especCols = 'B{3cm}' + ('p{' + anchoRestante + '}').repeat(numCols - 1);

    // Usar longtable para permitir saltos de página automáticos
    let tex = `  \\begin{longtable}{${especCols}}\n`;
    if (tituloTabla) {
        tex += `    \\caption{${escaparLatex(tituloTabla)}}\\label{tab:${generarLabel(tituloTabla)}}\\\\\n`;
    }

    // Encabezado para la primera página con fondo dorado
    tex += `    \\toprule\n`;
    const encabezados = procesarCeldasFila(datos[0], true).map(c => `\\encabezadodorado{${c}}`).join(' & ');
    tex += `    \\rowcolor{gobmxDorado} ${encabezados} \\\\\n`;
    tex += `    \\midrule\n`;
    tex += `    \\endfirsthead\n\n`;

    // Encabezado para páginas siguientes (con "Continuación...")
    tex += `    \\multicolumn{${numCols}}{l}{\\small\\textit{Continuación...}} \\\\\n`;
    tex += `    \\toprule\n`;
    tex += `    \\rowcolor{gobmxDorado} ${encabezados} \\\\\n`;
    tex += `    \\midrule\n`;
    tex += `    \\endhead\n\n`;

    // Pie de tabla en páginas intermedias
    tex += `    \\midrule\n`;
    tex += `    \\multicolumn{${numCols}}{r}{\\small\\textit{Continúa en la siguiente página...}} \\\\\n`;
    tex += `    \\endfoot\n\n`;

    // Pie de tabla en la última página
    tex += `    \\bottomrule\n`;
    tex += `    \\endlastfoot\n\n`;

    // Datos de la tabla (empezando desde la fila 1, ya que la 0 es el encabezado)
    for (let i = 1; i < datos.length; i++) {
        const celdas = procesarCeldasFila(datos[i]);
        tex += `    ${celdas.join(' & ')} \\\\\n`;
    }

    tex += `  \\end{longtable}\n`;
    return tex;
}

/**
 * Genera una tabla compacta usando longtable (para consistencia)
 */
function generarTablaCompacta(datos) {
    const numCols = datos[0].length;
    // Para tablas compactas, usar anchos más pequeños: primera 3cm, resto 2cm cada una
    const especCols = 'B{3cm}' + 'p{2cm}'.repeat(numCols - 1);
    let tex = `  \\begin{longtable}{${especCols}}\n`;
    tex += `    \\toprule\n`;
    // Encabezados con fondo dorado
    const encabezados = procesarCeldasFila(datos[0], true).map(c => `\\encabezadodorado{${c}}`).join(' & ');
    tex += `    \\rowcolor{gobmxDorado} ${encabezados} \\\\\n`;
    tex += `    \\midrule\n`;
    tex += `    \\endfirsthead\n\n`;

    // Encabezado para páginas siguientes (aunque sea compacta, por consistencia)
    tex += `    \\rowcolor{gobmxDorado} ${encabezados} \\\\\n`;
    tex += `    \\midrule\n`;
    tex += `    \\endhead\n\n`;

    tex += `    \\bottomrule\n`;
    tex += `    \\endlastfoot\n\n`;

    for (let i = 1; i < datos.length; i++) {
        const celdas = procesarCeldasFila(datos[i]);
        tex += `    ${celdas.join(' & ')} \\\\\n`;
    }
    tex += `  \\end{longtable}\n`;
    return tex;
}

/**
 * Divide una tabla grande en múltiples partes (por columnas)
 * Cada parte usa longtable para permitir saltos de página automáticos
 */
function dividirTabla(datos, maxCols, tituloTabla) {
    const numCols = datos[0].length;
    let tex = '';
    let parte = 1;

    // Calcular cuántas partes necesitamos
    // Primera columna siempre se repite, entonces: 1 + (maxCols - 1) columnas por parte
    const colsPorParte = maxCols - 1;
    let colInicio = 1; // Empezamos desde la columna 1 (la 0 es la primera que se repite)

    while (colInicio < numCols) {
        const colFin = Math.min(colInicio + colsPorParte, numCols);

        // Agregar nota de continuación si no es la primera parte
        if (parte > 1) {
            tex += `\n  \\vspace{1em}\n`;
            tex += `  {\\small\\textit{Continuación Tabla. ${escaparLatex(tituloTabla || '')}}}\n`;
            tex += `  \\vspace{0.5em}\n\n`;
        }

        // Generar esta parte de la tabla
        const colsEnEstaParte = [0].concat(Array.from({ length: colFin - colInicio }, (_, i) => colInicio + i));
        const numColsTabla = colsEnEstaParte.length;

        // Calcular ancho de columnas para longtable
        const anchoRestante = `${(11 / (numColsTabla - 1)).toFixed(2)}cm`;
        const especCols = 'B{3cm}' + ('p{' + anchoRestante + '}').repeat(numColsTabla - 1);

        // Usar longtable para permitir saltos de página
        tex += `  \\begin{longtable}{${especCols}}\n`;
        if (tituloTabla && parte === 1) {
            tex += `    \\caption{${escaparLatex(tituloTabla)}}\\label{tab:${generarLabel(tituloTabla)}}\\\\\n`;
        }

        // Extraer encabezados de esta parte con fondo dorado
        const celdasEncabezado = colsEnEstaParte.map(colIdx => datos[0][colIdx]);
        const encabezados = procesarCeldasFila(celdasEncabezado, true).map(c => `\\encabezadodorado{${c}}`).join(' & ');

        // Encabezado para la primera página
        tex += `    \\toprule\n`;
        tex += `    \\rowcolor{gobmxDorado} ${encabezados} \\\\\n`;
        tex += `    \\midrule\n`;
        tex += `    \\endfirsthead\n\n`;

        // Encabezado para páginas siguientes
        tex += `    \\multicolumn{${numColsTabla}}{l}{\\small\\textit{Continuación...}} \\\\\n`;
        tex += `    \\toprule\n`;
        tex += `    \\rowcolor{gobmxDorado} ${encabezados} \\\\\n`;
        tex += `    \\midrule\n`;
        tex += `    \\endhead\n\n`;

        // Pie en páginas intermedias
        tex += `    \\midrule\n`;
        tex += `    \\multicolumn{${numColsTabla}}{r}{\\small\\textit{Continúa en la siguiente página...}} \\\\\n`;
        tex += `    \\endfoot\n\n`;

        // Pie en la última página
        tex += `    \\bottomrule\n`;
        tex += `    \\endlastfoot\n\n`;

        // Datos de la tabla (empezando desde la fila 1)
        for (let i = 1; i < datos.length; i++) {
            const celdasParte = colsEnEstaParte.map(colIdx => datos[i][colIdx]);
            const celdas = procesarCeldasFila(celdasParte);
            tex += `    ${celdas.join(' & ')} \\\\\n`;
        }

        tex += `  \\end{longtable}\n`;

        colInicio = colFin;
        parte++;
    }

    return tex;
}

/**
 * Divide una tabla por filas en partes con longtable y nota de continuación
 */
function dividirTablaPorFilas(datos, maxFilasParte, tituloTabla) {
    const numCols = datos[0].length;
    const anchoRestante = `${(11 / (numCols - 1)).toFixed(2)}cm`;
    const especCols = 'p{3cm}' + ('p{' + anchoRestante + '}').repeat(numCols - 1);
    let tex = '';
    let inicio = 1; // Saltar encabezado
    let parte = 1;
    while (inicio < datos.length) {
        const fin = Math.min(inicio + maxFilasParte, datos.length);
        tex += `  \\begin{longtable}{${especCols}}\n`;
        if (tituloTabla && parte === 1) {
            tex += `    \\caption{${escaparLatex(tituloTabla)}}\\label{tab:${generarLabel(tituloTabla)}}\\\\\n`;
        }
        tex += `    \\toprule\n`;
        const encabezados = procesarCeldasFila(datos[0], true).map(c => `\\encabezadodorado{${c}}`).join(' & ');
        tex += `    \\rowcolor{gobmxDorado} ${encabezados} \\\\\n`;
        tex += `    \\midrule\n`;
        tex += `    \\endfirsthead\n\n`;
        tex += `    \\multicolumn{${numCols}}{l}{\\small\\textit{Continuación...}} \\\\\n`;
        tex += `    \\toprule\n`;
        tex += `    \\rowcolor{gobmxDorado} ${encabezados} \\\\\n`;
        tex += `    \\midrule\n`;
        tex += `    \\endhead\n\n`;
        tex += `    \\midrule\n`;
        tex += `    \\multicolumn{${numCols}}{r}{\\small\\textit{Continúa en la siguiente página...}} \\\\\n`;
        tex += `    \\endfoot\n\n`;
        tex += `    \\bottomrule\n`;
        tex += `    \\endlastfoot\n\n`;
        for (let i = inicio; i < fin; i++) {
            const celdas = procesarCeldasFila(datos[i]);
            tex += `    ${celdas.join(' & ')} \\\\\n`;
        }
        tex += `  \\end{longtable}\n`;
        if (fin < datos.length) {
            tex += `\n  \\vspace{1em}\n  {\\small\\textit{Continuación Tabla. ${escaparLatex(tituloTabla || '')}}}\n  \\vspace{0.5em}\n\n`;
        }
        inicio = fin;
        parte++;
    }
    return tex;
}

/**
 * Genera un ID único para una nota (para enlaces)
 * Ejemplos: "1/" -> "nota1", "6/" -> "nota6", "P/" -> "notaP"
 */
function generarIdNota(nota) {
    // Remover el "/" y agregar prefijo
    return 'nota' + nota.replace('/', '');
}

/**
 * Aplica estilo a las notas en el texto (superíndice clicable)
 * Detecta patrones como: 1/, 6/, P/, e/, 1/,7/, 1/,7/,11/, etc.
 * IMPORTANTE: Debe aplicarse ANTES de escapar LaTeX
 */
function estilizarNotas(texto) {
    // Detectar notas al final del texto
    // Patrón: espacio + una o más notas separadas por comas + opcional espacio final
    // Ejemplos: " 6/", " 1/,7/", " P/,e/", " 1/,7/,11/"

    // Buscar patrón de notas al final
    const match = texto.match(/^(.*?)\s+([0-9]+\/(?:,[0-9]+\/)*|[a-zA-Z]+\/(?:,[a-zA-Z]+\/)*)\s*$/);

    if (match) {
        const textoBase = match[1];
        const notasStr = match[2];

        // Separar notas múltiples (ej: "1/,7/" -> ["1/", "7/"])
        const notasArray = notasStr.split(',');

        return {
            textoBase: textoBase,
            notas: notasArray,
            tieneNotas: true
        };
    }

    return {
        textoBase: texto,
        notas: [],
        tieneNotas: false
    };
}

/**
 * Procesa las celdas de una fila (redondeo de números)
 * @param {boolean} esEncabezado - Si es fila de encabezado (para usar color blanco en notas)
 */
function procesarCeldasFila(fila, esEncabezado = false) {
    return fila.map((c, idx) => {
        if (c === null || c === undefined || c === '') return '';

        // Si es número, redondear a máximo 4 decimales
        if (typeof c === 'number') {
            const nf = Intl.NumberFormat('en-US', { maximumFractionDigits: 4, useGrouping: true });
            return escaparLatex(nf.format(c));
        }

        // Si es string que parece número, intentar redondear
        const num = parseFloat(c);
        if (!isNaN(num) && c.toString().includes('.')) {
            const decimales = c.toString().split('.')[1];
            if (decimales && decimales.length > 4) {
                const nf = Intl.NumberFormat('en-US', { maximumFractionDigits: 4, useGrouping: true });
                return escaparLatex(nf.format(num));
            }
        }

        // Detectar y separar notas ANTES de escapar
        const textoOriginal = c.toString();
        const resultado = estilizarNotas(textoOriginal);

        let textoFinal;
        if (resultado.tieneNotas) {
            // Escapar el texto base
            const textoBaseEscapado = escaparLatex(resultado.textoBase);

            // Color blanco para encabezados (fondo dorado), gris para cuerpo
            const colorNota = esEncabezado ? 'white' : 'gray';

            // Procesar cada nota por separado para crear enlaces individuales
            const notasLatex = resultado.notas.map(nota => {
                const notaEscapada = escaparLatex(nota);
                const idNota = generarIdNota(nota);
                // Crear enlace clicable a la explicación en la fuente
                return `\\hyperlink{${idNota}}{\\textcolor{${colorNota}}{${notaEscapada}}}`;
            }).join(',');

            textoFinal = `${textoBaseEscapado} \\textsuperscript{${notasLatex}}`;
        } else {
            textoFinal = escaparLatex(textoOriginal);
        }

        // Primera columna en negritas (sin color)
        if (idx === 0) {
            textoFinal = `\\textbf{${textoFinal}}`;
        }
        return textoFinal;
    });
}

/**
 * Procesa datos CSV y genera tabla LaTeX
 */
function procesarDatosCSV(csv) {
    if (!csv || csv.trim() === '') {
        return `  \\begin{tabular}{lc}\n    % Sin datos\n  \\end{tabular}\n`;
    }

    const lineas = csv.trim().split('\n');
    if (lineas.length === 0) return '';

    const numCols = lineas[0].split(',').length;
    let tex = `  \\begin{tabular}{${'l' + 'c'.repeat(numCols - 1)}}\n`;
    tex += `    \\toprule\n`;

    lineas.forEach((linea, index) => {
        const celdas = linea.split(',').map(c => escaparLatex(c.trim()));

        if (index === 0) {
            // Encabezado con fondo dorado
            const encabezados = celdas.map(c => `\\encabezadodorado{${c}}`).join(' & ');
            tex += `    \\rowcolor{gobmxDorado} ${encabezados} \\\\\n`;
            tex += `    \\midrule\n`;
        } else {
            // Datos - primera columna en negritas
            const celdasFormateadas = celdas.map((c, idx) => idx === 0 ? `\\textbf{${c}}` : c);
            tex += `    ${celdasFormateadas.join(' & ')} \\\\\n`;
        }
    });

    tex += `    \\bottomrule\n`;
    tex += `  \\end{tabular}\n`;
    return tex;
}

/**
 * Genera el glosario
 */
function generarGlosario(glosario) {
    let tex = `\\section*{Glosario}\n`;
    tex += `\\addcontentsline{toc}{section}{Glosario}\n\n`;

    // Ordenar alfabéticamente
    glosario.sort((a, b) => {
        const termA = (a['Termino'] || '').toString().toLowerCase();
        const termB = (b['Termino'] || '').toString().toLowerCase();
        return termA.localeCompare(termB);
    });

    glosario.forEach(entrada => {
        const termino = entrada['Termino'] || '';
        const definicion = entrada['Definicion'] || '';
        if (termino && definicion) {
            tex += `\\entradaGlosario{${escaparLatex(termino)}}{${escaparLatex(definicion)}}\n`;
        }
    });

    tex += `\n`;
    return tex;
}

/**
 * Genera la sección de siglas y acrónimos
 */
function generarSiglas(siglas) {
    let tex = `\\section*{Siglas y Acrónimos}\n`;
    tex += `\\addcontentsline{toc}{section}{Siglas y Acrónimos}\n\n`;

    // Ordenar alfabéticamente
    siglas.sort((a, b) => {
        const siglaA = (a['Sigla'] || '').toString().toLowerCase();
        const siglaB = (b['Sigla'] || '').toString().toLowerCase();
        return siglaA.localeCompare(siglaB);
    });

    siglas.forEach(entrada => {
        const sigla = entrada['Sigla'] || '';
        const descripcion = entrada['Descripcion'] || '';
        if (sigla && descripcion) {
            tex += `\\entradaSigla{${escaparLatex(sigla)}}{${escaparLatex(descripcion)}}\n`;
        }
    });

    tex += `\n`;
    return tex;
}

/**
 * Genera un label válido para LaTeX a partir de un texto
 */
function generarLabel(texto) {
    return texto.toString()
        .toLowerCase()
        .replace(/[áàäâ]/g, 'a')
        .replace(/[éèëê]/g, 'e')
        .replace(/[íìïî]/g, 'i')
        .replace(/[óòöô]/g, 'o')
        .replace(/[úùüû]/g, 'u')
        .replace(/ñ/g, 'n')
        .replace(/[^a-z0-9]/g, '_')
        .substring(0, 30);
}

// ============================================================================
// API WEB - FUNCIONES PARA LA INTERFAZ WEB
// ============================================================================

/**
 * API: Obtener lista de todos los documentos
 */
function getDocumentos() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const hoja = ss.getSheetByName('Documentos');

    if (!hoja) {
        return [];
    }

    const datos = hoja.getDataRange().getValues();

    if (datos.length < 2) {
        return [];
    }

    const headers = datos[0];
    const documentos = [];

    for (let i = 1; i < datos.length; i++) {
        const fila = datos[i];
        const doc = {};

        headers.forEach((header, j) => {
            doc[header] = fila[j];
        });

        // Solo agregar si tiene ID
        if (doc['ID']) {
            documentos.push(doc);
        }
    }

    return documentos;
}

/**
 * API: Obtener documento completo por ID
 */
function getDocumento(docId) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Obtener metadatos
    const hojaDocs = ss.getSheetByName('Documentos');
    if (!hojaDocs) {
        throw new Error('No se encuentra la hoja "Documentos"');
    }

    const datosDocs = hojaDocs.getDataRange().getValues();
    const headersDocs = datosDocs[0];
    let metadata = null;

    for (let i = 1; i < datosDocs.length; i++) {
        if (datosDocs[i][0] == docId) {
            metadata = {};
            headersDocs.forEach((header, j) => {
                metadata[header] = datosDocs[i][j];
            });
            break;
        }
    }

    if (!metadata) {
        throw new Error(`No se encontró el documento con ID: ${docId}`);
    }

    return {
        metadata: metadata,
        secciones: obtenerRegistros(ss, 'Secciones', docId, 'DocumentoID'),
        tablas: obtenerRegistros(ss, 'Tablas', docId, 'DocumentoID'),
        figuras: obtenerRegistros(ss, 'Figuras', docId, 'DocumentoID'),
        bibliografia: obtenerRegistros(ss, 'Bibliografia', docId, 'DocumentoID'),
        siglas: obtenerRegistros(ss, 'Siglas', docId, 'DocumentoID'),
        glosario: obtenerRegistros(ss, 'Glosario', docId, 'DocumentoID')
    };
}

/**
 * API: Guardar cambios en metadatos del documento
 */
function guardarDocumento(docId, datos) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const hoja = ss.getSheetByName('Documentos');

    if (!hoja) {
        return { success: false, message: 'No se encuentra la hoja "Documentos"' };
    }

    const datosFila = hoja.getDataRange().getValues();
    const headers = datosFila[0];

    // Buscar la fila del documento
    for (let i = 1; i < datosFila.length; i++) {
        if (datosFila[i][0] == docId) {
            // Actualizar cada campo
            if (datos.metadata) {
                Object.keys(datos.metadata).forEach(key => {
                    const colIndex = headers.indexOf(key);
                    if (colIndex !== -1) {
                        hoja.getRange(i + 1, colIndex + 1).setValue(datos.metadata[key]);
                    }
                });
            }

            return { success: true, message: 'Documento guardado correctamente' };
        }
    }

    return { success: false, message: 'No se encontró el documento' };
}

/**
 * API: Generar .tex desde la interfaz web
 */
function generarTexDesdeWeb(docId) {
    try {
        const ss = SpreadsheetApp.getActiveSpreadsheet();

        // Obtener datos del documento
        const hojaDocs = ss.getSheetByName('Documentos');
        if (!hojaDocs) {
            throw new Error('No se encuentra la hoja "Documentos"');
        }

        const datosDocs = hojaDocs.getDataRange().getValues();
        const headersDocs = datosDocs[0];
        let datosDoc = null;
        let filaDoc = -1;

        for (let i = 1; i < datosDocs.length; i++) {
            if (datosDocs[i][0] == docId) {
                datosDoc = {};
                headersDocs.forEach((header, j) => {
                    datosDoc[header] = datosDocs[i][j];
                });
                filaDoc = i + 1;
                break;
            }
        }

        if (!datosDoc) {
            throw new Error(`No se encontró el documento con ID: ${docId}`);
        }

        // Obtener todas las hojas relacionadas
        const secciones = obtenerRegistros(ss, 'Secciones', docId, 'DocumentoID');
        const bibliografia = obtenerRegistros(ss, 'Bibliografia', docId, 'DocumentoID');
        const figuras = obtenerRegistros(ss, 'Figuras', docId, 'DocumentoID');
        const tablas = obtenerRegistros(ss, 'Tablas', docId, 'DocumentoID');
        const siglas = obtenerRegistros(ss, 'Siglas', docId, 'DocumentoID');
        const glosario = obtenerRegistros(ss, 'Glosario', docId, 'DocumentoID');

        // Ordenar secciones
        secciones.sort((a, b) => {
            const oa = parseFloat(a.Orden) || 0;
            const ob = parseFloat(b.Orden) || 0;
            return oa - ob;
        });

        // Construir el contenido LaTeX
        const tex = construirLatex(datosDoc, secciones, bibliografia, figuras, tablas, siglas, glosario, ss);

        return {
            success: true,
            contenido: tex,
            nombreArchivo: `${datosDoc['DocumentoCorto'] || 'documento'}.tex`
        };

    } catch (error) {
        return {
            success: false,
            message: error.toString()
        };
    }
}

/**
 * Escapa texto LaTeX pero procesa etiquetas especiales [[...]]
 * Soporta: [[nota:]], [[cita:]], [[destacado:]], [[ecuacion:]], [[math:]], [[dorado:]], [[guinda:]]
 */
function escaparTextoConEtiquetas(texto) {
    if (!texto) return '';
    let str = texto.toString();

    // 1. Extraer Ecuaciones para NO escaparlas
    const ecuaciones = [];

    // [[ecuacion:...]] -> \begin{equation} ... \end{equation}
    str = str.replace(/\[\[ecuacion:([\s\S]*?)\]\]/g, function (_match, contenido) {
        ecuaciones.push(`\\begin{equation}\n${contenido}\n\\end{equation}`);
        return `ZEQPLACEHOLDER${ecuaciones.length - 1}Z`;
    });

    // [[math:...]] -> $ ... $
    str = str.replace(/\[\[math:([\s\S]*?)\]\]/g, function (_match, contenido) {
        ecuaciones.push(`$${contenido}$`);
        return `ZEQPLACEHOLDER${ecuaciones.length - 1}Z`;
    });

    // 2. Extraer CITAS para NO escaparlas
    const citas = [];
    str = str.replace(/\[\[cita:([\s\S]*?)\]\]/g, function (_match, contenido) {
        const clave = contenido.toString().trim();
        citas.push(`\\cite{${clave}}`);
        return `ZCITEPOLDER${citas.length - 1}Z`;
    });

    // 3. Proteger etiquetas de texto
    str = str
        .replace(/\[\[nota:([\s\S]*?)\]\]/g, 'ZFOOTNOTESTARTZ$1ZFOOTNOTEENDZ')
        .replace(/\[\[destacado:([\s\S]*?)\]\]/g, 'ZDESTACADOSTARTZ$1ZDESTACADOENDZ')
        .replace(/\[\[dorado:([\s\S]*?)\]\]/g, 'ZGOLDSTARTZ$1ZGOLDENDZ')
        .replace(/\[\[guinda:([\s\S]*?)\]\]/g, 'ZGUINDASTARTZ$1ZGUINDAENDZ');

    // 4. Escapar LaTeX general
    str = escaparLatex(str);

    // 5. Restaurar etiquetas de texto
    str = str
        .replace(/ZFOOTNOTESTARTZ/g, '\\footnote{')
        .replace(/ZFOOTNOTEENDZ/g, '}')
        .replace(/ZDESTACADOSTARTZ/g, '\\begin{destacado}\n')
        .replace(/ZDESTACADOENDZ/g, '\n\\end{destacado}')
        .replace(/ZGOLDSTARTZ/g, '\\textbf{\\textcolor{gobmxDorado}{')
        .replace(/ZGOLDENDZ/g, '}}')
        .replace(/ZGUINDASTARTZ/g, '\\textbf{\\textcolor{gobmxGuinda}{')
        .replace(/ZGUINDAENDZ/g, '}}');

    // 6. Restaurar Citas
    str = str.replace(/ZCITEPOLDER(\d+)Z/g, function (_match, index) {
        return citas[parseInt(index)];
    });

    // 7. Restaurar Ecuaciones
    str = str.replace(/ZEQPLACEHOLDER(\d+)Z/g, function (_match, index) {
        return ecuaciones[parseInt(index)];
    });

    return str;
}

