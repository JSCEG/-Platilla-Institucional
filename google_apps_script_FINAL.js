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

// Carpeta destino en Drive (preferida). Ejemplo de URL:
// https://drive.google.com/drive/folders/<ESTE_ES_EL_ID>
const CARPETA_SALIDA_ID = '1NnO4B8EJCx6VNrmDxWwwW3KsHCTID_c2';

// FIX: Flag de debug para optimizar logging en producción
const DEBUG = true;

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
    // Acumular logs útiles para el usuario.
    // Nota: Aunque DEBUG esté apagado, conviene mostrar ✅/⚠️/❌ para diagnóstico.
    const esImportante =
        mensaje &&
        (mensaje.startsWith('✅') || mensaje.startsWith('⚠️') || mensaje.startsWith('❌'));
    if (DEBUG || esImportante) {
        logMensajes.push(mensaje);
    }
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

        // 1. Verificar que estamos en la hoja "Documentos"
        const hojaActiva = ss.getActiveSheet();
        if (hojaActiva.getName() !== 'Documentos') {
            ui.alert('⚠️ Por favor, selecciona una celda en la hoja "Documentos" antes de generar el archivo.');
            return;
        }

        // 2. Obtener datos de la hoja "Documentos"
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

        log(`🔍 Fila activa: ${filaActiva}`);
        log(`📋 Datos obtenidos: ${JSON.stringify(datosDoc)}`);
        log(`🆔 ID encontrado: "${docId}" (tipo: ${typeof docId})`);

        if (!docId || docId.toString().trim() === '') {
            ui.alert('❌ Error: La fila seleccionada no tiene un ID de documento válido.');
            log('❌ ID vacío o inválido');
            return;
        }

        log(`📄 Procesando documento ID: ${docId}`);
        log(`📝 Título: ${datosDoc['Titulo']}`);

        // 3. Leer todas las hojas relacionadas
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

        // 4. Construir el contenido LaTeX
        const tex = construirLatex(datosDoc, secciones, bibliografia, figuras, tablas, siglas, glosario, ss);

        // 5. Guardar archivos en Drive
        const salida = guardarArchivos(datosDoc, tex, bibliografia);

        const resumenSalida = salida
            ? `\n\n📁 Carpeta: ${salida.carpetaNombre}\n${salida.carpetaUrl}` +
            `\n\n📄 Archivo: ${salida.texNombre}\n${salida.texUrl}` +
            (salida.bibUrl ? `\n\n📚 Bibliografía:\n${salida.bibUrl}` : '')
            : '';

        ui.alert(
            '✅ ¡Éxito!',
            `Archivos generados correctamente.${resumenSalida}\n\n${logMensajes.join('\n')}`,
            ui.ButtonSet.OK
        );

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

    // NOTA: \\addbibresource{referencias.bib} ya se carga en sener2025.cls
    // Solo lo agregamos aquí si deseamos sobreescribir o agregar otros archivos.

    // --- Metadatos PDF/UA para Accesibilidad ---
    tex += `% --- Metadatos PDF/UA (Accesibilidad Universal) ---\n`;
    tex += `\\hypersetup{\n`;
    tex += `  pdftitle={${escaparLatex(datosDoc['Titulo'] || 'Documento SENER')}},\n`;
    tex += `  pdfauthor={${escaparLatex(datosDoc['Autor'] || 'Secretaría de Energía')}},\n`;
    tex += `  pdfsubject={${escaparLatex(datosDoc['Subtitulo'] || datosDoc['Titulo'] || 'Documento Institucional')}},\n`;
    tex += `  pdfkeywords={${escaparLatex(datosDoc['PalabrasClave'] || 'SENER, Energía, México')}},\n`;
    tex += `  pdfcreationdate={D:${generarFechaPDF()}}\n`;
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

    // --- Agradecimientos ---
    if (datosDoc['Agradecimientos'] && datosDoc['Agradecimientos'].toString().trim()) {
        tex += `\\clearpage\n`;
        tex += `\\begin{center}\n`;
        tex += `{\\Large\\patriafont\\bfseries\\color{gobmxGuinda}Agradecimientos}\\\\[1cm]\n`;
        tex += `\\end{center}\n\n`;
        tex += `${procesarConEtiquetas(datosDoc['Agradecimientos'])}\n\n`;
    }

    // --- Presentación ---
    // Nota: en Sheets puede venir como "Presentación" (con acento) según el encabezado.
    const presentacionRaw = (datosDoc['Presentación'] !== undefined && datosDoc['Presentación'] !== null)
        ? datosDoc['Presentación']
        : datosDoc['Presentacion'];
    if (presentacionRaw && presentacionRaw.toString().trim()) {
        tex += `\\clearpage\n`;
        tex += `\\begin{center}\n`;
        tex += `{\\Large\\patriafont\\bfseries\\color{gobmxGuinda}Presentación}\\\\[1cm]\n`;
        tex += `\\end{center}\n\n`;
        tex += `${procesarConEtiquetas(presentacionRaw)}\n\n`;
    }

    // --- Resumen Ejecutivo ---
    if (datosDoc['ResumenEjecutivo'] && datosDoc['ResumenEjecutivo'].toString().trim()) {
        tex += `\\clearpage\n`;
        tex += `\\begin{center}\n`;
        tex += `{\\Large\\patriafont\\bfseries\\color{gobmxGuinda}Resumen Ejecutivo}\\\\[1cm]\n`;
        tex += `\\end{center}\n\n`;
        tex += `${procesarConEtiquetas(datosDoc['ResumenEjecutivo'])}\n\n`;
    }

    // --- Datos Clave ---
    if (datosDoc['DatosClave'] && datosDoc['DatosClave'].toString().trim()) {
        tex += `\\clearpage\n`;
        tex += `\\begin{center}\n`;
        tex += `{\\Large\\patriafont\\bfseries\\color{gobmxGuinda}Datos Clave}\\\\[1cm]\n`;
        tex += `\\end{center}\n\n`;
        const textoDatos = datosDoc['DatosClave'].toString();
        const items = textoDatos.split(/[;\n]/);
        tex += `\\begin{itemize}\n`;
        items.forEach(item => {
            if (item.trim()) {
                tex += `  \\item ${escaparLatex(item.trim())}\n`;
            }
        });
        tex += `\\end{itemize}\n\n`;
    }

    // --- Secciones ---
    const resultado = procesarSecciones(secciones, figurasMap, tablasMap, ss);
    tex += resultado.contenido;

    // --- Glosario ---
    if (glosario.length > 0) {
        tex += generarGlosario(glosario);
    }

    // --- Bibliografía (Solo si hay citas) ---
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
        // FIX: Pasar estado de anexos para limpiar prefijos duplicados
        // NUEVO: Pasar figurasMap, tablasMap y ss a procesarContenido para inserción explícita
        contenido += generarComandoSeccion(nivel, titulo, anexosIniciados);
        contenido += procesarContenido(contenidoRaw, ordenSeccion, figurasMap, tablasMap, ss);

        contenido += '\n\n';
    });

    return {
        contenido: contenido,
        directorio: directorio,
        contraportada: contraportada
    };
}

/**
 * FIX: Limpia prefijos de anexo del título cuando estamos en modo anexos
 * Evita duplicación como "Anexo A Anexo A ..." en el PDF
 */
function limpiarPrefijoAnexoEnTitulo(titulo) {
    if (!titulo) return '';

    let tituloLimpio = titulo.toString().trim();

    // Patrones a eliminar al inicio del título:
    // - "Anexo A", "ANEXO B.", "Anexo C –"
    // - "A.1", "A1", "B.12", con o sin punto/espacio/guión
    const patronesAnexo = [
        /^Anexo\s+[A-Z][\.\s\-–]*\s*/i,     // "Anexo A", "Anexo B.", "Anexo C –"
        /^ANEXO\s+[A-Z][\.\s\-–]*\s*/i,     // "ANEXO A", "ANEXO B."
        /^[A-Z]\.?\d*[\.\s\-–]+\s*/,        // "A.1", "A1", "B.12", "A."
        /^[A-Z]\d*[\.\s\-–]+\s*/            // "A1", "B2"
    ];

    for (const patron of patronesAnexo) {
        tituloLimpio = tituloLimpio.replace(patron, '');
    }

    return tituloLimpio.trim();
}

/**
 * FIX: Genera el comando LaTeX apropiado según el nivel
 * Ahora recibe anexosIniciados para limpiar prefijos duplicados
 */
function generarComandoSeccion(nivel, titulo, anexosIniciados = false) {
    let tituloFinal = titulo;

    // FIX: Si estamos en anexos y es nivel anexo/subanexo, limpiar prefijos
    if (anexosIniciados && (nivel === 'anexo' || nivel === 'subanexo')) {
        tituloFinal = limpiarPrefijoAnexoEnTitulo(titulo);
    }

    const tituloEscapado = escaparLatex(tituloFinal);

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
        // Default: sección principal (incluyendo anexos)
        return `\\section{${tituloEscapado}}\n\n`;
    }
}

/**
 * FIX: Procesa el contenido de una sección (listas, bloques, etc.)
 * Corregido para no romper listas con líneas en blanco
 * @param {string} contenidoRaw - Texto crudo a procesar
 * @param {number} ordenSeccion - Orden de la sección actual para búsqueda de elementos
 * @param {Object} figurasMap - Mapa de figuras por sección
 * @param {Object} tablasMap - Mapa de tablas por sección
 * @param {Spreadsheet} ss - Referencia al spreadsheet
 */
function procesarContenido(contenidoRaw, ordenSeccion, figurasMap, tablasMap, ss) {
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
            resultado += generarBloque(tipoBloque, tituloBloque, contenidoBloque, ordenSeccion, figurasMap, tablasMap, ss);
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
            resultado += `  \\item ${procesarConEtiquetas(esItemLista[1])}\n`;
        } else {
            // FIX: Si estamos en lista y encontramos línea vacía, NO cerrar la lista
            // Solo ignorar la línea vacía para mantener la lista abierta
            if (enLista && lineaTrim === '') {
                // FIX: Línea vacía dentro de lista - ignorar sin cerrar
                continue;
            }

            // FIX: Solo cerrar lista si encontramos contenido real (no vacío)
            if (enLista && lineaTrim !== '') {
                // Verificar si las siguientes líneas contienen más items
                let hayMasItems = false;
                for (let j = i + 1; j < lineas.length; j++) {
                    const siguienteLinea = lineas[j].trim();
                    if (siguienteLinea === '') continue; // Saltar líneas vacías
                    if (siguienteLinea.match(/^[-*•]\s+/)) {
                        hayMasItems = true;
                        break;
                    } else {
                        break; // Encontramos contenido no-item
                    }
                }

                // Solo cerrar si no hay más items
                if (!hayMasItems) {
                    resultado += '\\end{itemize}\n';
                    enLista = false;
                }
            }

            // Procesar línea normal solo si no estamos en lista
            if (!enLista) {
                if (lineaTrim.startsWith('[[tabla:')) {
                    // Referencia a tabla explícita
                    const match = lineaTrim.match(/\[\[tabla:(.+?)\]\]/);
                    if (match && tablasMap) {
                        const nombreTabla = match[1].trim();
                        debugger; // Ayuda para depuración si es necesario

                        // 1. Buscar en la sección actual (prioridad)
                        let tablaObj = null;
                        if (ordenSeccion && tablasMap[ordenSeccion]) {
                            tablaObj = tablasMap[ordenSeccion].find(t =>
                                (t.Titulo || '').toString().trim() === nombreTabla ||
                                generarLabel(t.Titulo || '') === generarLabel(nombreTabla)
                            );
                        }

                        // 2. Si no se encuentra, buscar GLOBALMENTE en todas las secciones
                        if (!tablaObj) {
                            const todasLasSecciones = Object.keys(tablasMap);
                            for (const sec of todasLasSecciones) {
                                const encontrado = tablasMap[sec].find(t =>
                                    (t.Titulo || '').toString().trim() === nombreTabla ||
                                    generarLabel(t.Titulo || '') === generarLabel(nombreTabla)
                                );
                                if (encontrado) {
                                    tablaObj = encontrado;
                                    log(`⚠️ Aviso: Tabla "${nombreTabla}" encontrada en sección ${sec} (referenciada en ${ordenSeccion || '?'})`);
                                    break;
                                }
                            }
                        }

                        if (tablaObj) {
                            resultado += generarTabla(tablaObj, ss);
                        } else {
                            resultado += `% ⚠️ Error: No se encontró la tabla "${nombreTabla}" (buscado en sección ${ordenSeccion} y globalmente)\n`;
                            log(`⚠️ No se encontró la tabla "${nombreTabla}" en ninguna sección.`);
                            // Dump de claves para debug
                            const clavesDisponibles = Object.keys(tablasMap).map(k =>
                                `Sec ${k}: [${tablasMap[k].map(t => t.Titulo).join(', ')}]`
                            ).join('; ');
                            log(`ℹ️ Tablas disponibles: ${clavesDisponibles}`);
                        }
                    }
                } else if (lineaTrim.startsWith('[[figura:')) {
                    // Referencia a figura explícita
                    const match = lineaTrim.match(/\[\[figura:(.+?)\]\]/);
                    if (match && figurasMap) {
                        const nombreFig = match[1].trim();

                        // 1. Buscar en la sección actual
                        let figObj = null;
                        if (ordenSeccion && figurasMap[ordenSeccion]) {
                            figObj = figurasMap[ordenSeccion].find(f =>
                                (f.Caption || '').toString().trim() === nombreFig ||
                                generarLabel(f.Caption || '') === generarLabel(nombreFig)
                            );
                        }

                        // 2. Búsqueda GLOBAL
                        if (!figObj) {
                            const todasLasSecciones = Object.keys(figurasMap);
                            for (const sec of todasLasSecciones) {
                                const encontrado = figurasMap[sec].find(f =>
                                    (f.Caption || '').toString().trim() === nombreFig ||
                                    generarLabel(f.Caption || '') === generarLabel(nombreFig)
                                );
                                if (encontrado) {
                                    figObj = encontrado;
                                    log(`⚠️ Aviso: Figura "${nombreFig}" encontrada en sección ${sec} (referenciada en ${ordenSeccion || '?'})`);
                                    break;
                                }
                            }
                        }

                        if (figObj) {
                            resultado += generarFigura(figObj);
                        } else {
                            resultado += `% ⚠️ Error: No se encontró la figura "${nombreFig}" (buscado en sección ${ordenSeccion} y globalmente)\n`;
                            log(`⚠️ No se encontró la figura "${nombreFig}" en ninguna sección.`);
                            // Dump de claves para debug
                            const clavesDisponibles = Object.keys(figurasMap).map(k =>
                                `Sec ${k}: [${figurasMap[k].map(f => f.Caption).join(', ')}]`
                            ).join('; ');
                            log(`ℹ️ Figuras disponibles: ${clavesDisponibles}`);
                        }
                    }
                } else if (lineaTrim !== '') {
                    resultado += `${procesarConEtiquetas(linea)}\n`;
                } else {
                    resultado += '\n';
                }
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
function generarBloque(tipo, titulo, contenido, ordenSeccion, figurasMap, tablasMap, ss) {
    // Procesar el contenido del bloque (puede tener listas o elementos internos)
    const contenidoProcesado = procesarContenido(contenido, ordenSeccion, figurasMap, tablasMap, ss);

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
            contraTex += procesarConEtiquetas(l);
            if (!esUltima && !siguienteEsVacia) {
                contraTex += `\\\\\n`;
            }
        }
    }

    return contraTex;
}

/**
 * FIX: Guarda los archivos .tex y .bib en Drive (optimizado para evitar timeout)
 */
function obtenerCarpetaSalida_() {
    const userProps = PropertiesService.getUserProperties();

    // IMPORTANTE:
    // - Priorizamos el ID fijo (CARPETA_SALIDA_ID) para que siempre genere en la carpeta “en línea”.
    // - Para colaboradores, usamos UserProperties (por usuario) para recordar un fallback sin afectar a otros.
    const idFijo = (CARPETA_SALIDA_ID || '').toString().trim();
    const idUser = (userProps.getProperty('CARPETA_SALIDA_ID') || '').toString().trim();

    const candidatos = [];
    if (idFijo) candidatos.push({ id: idFijo, fuente: 'CARPETA_SALIDA_ID (const)' });
    if (idUser && idUser !== idFijo) candidatos.push({ id: idUser, fuente: 'UserProperties.CARPETA_SALIDA_ID' });

    for (let i = 0; i < candidatos.length; i++) {
        const c = candidatos[i];
        try {
            const carpeta = DriveApp.getFolderById(c.id);
            // Forzar lectura para validar acceso/permisos
            carpeta.getName();
            log(`✅ Carpeta de salida OK usando ${c.fuente}: ${carpeta.getName()} (ID: ${c.id})`);
            return carpeta;
        } catch (e) {
            log(`⚠️ No se pudo acceder a carpeta (fuente: ${c.fuente}, ID: ${c.id}). ` +
                `Asegura que la carpeta esté compartida con la cuenta que ejecuta el script. Detalle: ${e.toString()}`);
        }
    }

    return obtenerCarpetaFallback_();
}

function obtenerCarpetaFallback_() {
    const userProps = PropertiesService.getUserProperties();

    // Si ya existe un fallback por-usuario, reusarlo.
    const fallbackId = (userProps.getProperty('CARPETA_SALIDA_FALLBACK_ID') || '').toString().trim();
    if (fallbackId) {
        try {
            const carpeta = DriveApp.getFolderById(fallbackId);
            carpeta.getName();
            return carpeta;
        } catch (e) {
            // Si ya no existe/no hay acceso, se recrea abajo.
        }
    }

    // Fallback portable: carpeta dentro de "Mi unidad" del usuario que ejecuta el script
    const nombreFallback = 'SENER_LATEX_SALIDA';
    const root = DriveApp.getRootFolder();
    const existentes = root.getFoldersByName(nombreFallback);
    const carpetaFallback = existentes.hasNext() ? existentes.next() : root.createFolder(nombreFallback);

    // Guardar solo por-usuario: no afecta a otros colaboradores.
    userProps.setProperty('CARPETA_SALIDA_FALLBACK_ID', carpetaFallback.getId());
    log(`⚠️ Usando carpeta fallback en 'Mi unidad': ${carpetaFallback.getName()} (ID: ${carpetaFallback.getId()})`);
    return carpetaFallback;
}

function esAccesoDenegado_(e) {
    const msg = (e && e.toString) ? e.toString() : String(e);
    return /acceso denegado|access denied/i.test(msg);
}

function guardarArchivos(datosDoc, tex, bibliografia) {
    let carpeta = obtenerCarpetaSalida_();
    const nombreBase = datosDoc['DocumentoCorto'] || 'documento_generado';

    const carpetaId = carpeta.getId();
    const carpetaNombre = carpeta.getName();
    const carpetaUrl = `https://drive.google.com/drive/folders/${carpetaId}`;
    log(`📁 Guardando en carpeta: ${carpetaNombre} (ID: ${carpetaId})`);

    // FIX: Optimizar eliminación de archivos existentes
    const intentarGuardarEnCarpeta_ = (carpetaDestino) => {
        const carpetaIdLocal = carpetaDestino.getId();
        const carpetaNombreLocal = carpetaDestino.getName();
        const carpetaUrlLocal = `https://drive.google.com/drive/folders/${carpetaIdLocal}`;
        log(`📁 Guardando en carpeta: ${carpetaNombreLocal} (ID: ${carpetaIdLocal})`);

        // Guardar .tex (solo eliminar si existe)
        const texNombre = nombreBase + '.tex';
        const archivosTexExistentes = carpetaDestino.getFilesByName(texNombre);
        if (archivosTexExistentes.hasNext()) {
            archivosTexExistentes.next().setTrashed(true);
        }
        const fileTex = carpetaDestino.createFile(texNombre, tex, MimeType.PLAIN_TEXT);
        const texId = fileTex.getId();
        const texUrl = fileTex.getUrl();
        log(`✅ Archivo ${texNombre} creado (ID: ${texId})`);

        // Guardar .bib si hay referencias (optimizado)
        if (bibliografia.length > 0) {
            // FIX: Usar array.join() en lugar de concatenación masiva
            const bibEntries = [];
            bibliografia.forEach(ref => {
                const tipo = ref['Tipo'] ? ref['Tipo'].toLowerCase() : 'misc';
                const entry = [`@${tipo}{${ref['Clave']},`];
                if (ref['Autor']) entry.push(`  author = {${ref['Autor']}},`);
                if (ref['Titulo']) entry.push(`  title = {${ref['Titulo']}},`);
                if (ref['Anio']) entry.push(`  year = {${ref['Anio']}},`);
                if (ref['Editorial']) entry.push(`  publisher = {${ref['Editorial']}},`);
                if (ref['Url']) entry.push(`  url = {${ref['Url']}},`);
                entry.push('}\n');
                bibEntries.push(entry.join('\n'));
            });

            const bibContent = bibEntries.join('\n');

            const archivosBibExistentes = carpetaDestino.getFilesByName('referencias.bib');
            if (archivosBibExistentes.hasNext()) {
                archivosBibExistentes.next().setTrashed(true);
            }
            const fileBib = carpetaDestino.createFile('referencias.bib', bibContent, MimeType.PLAIN_TEXT);
            log(`✅ Archivo referencias.bib creado con ${bibliografia.length} referencias (ID: ${fileBib.getId()})`);

            return {
                carpetaId: carpetaIdLocal,
                carpetaNombre: carpetaNombreLocal,
                carpetaUrl: carpetaUrlLocal,
                texNombre,
                texId,
                texUrl,
                bibId: fileBib.getId(),
                bibUrl: fileBib.getUrl()
            };
        }

        return {
            carpetaId: carpetaIdLocal,
            carpetaNombre: carpetaNombreLocal,
            carpetaUrl: carpetaUrlLocal,
            texNombre,
            texId,
            texUrl,
            bibId: '',
            bibUrl: ''
        };
    };

    try {
        return intentarGuardarEnCarpeta_(carpeta);
    } catch (e) {
        if (esAccesoDenegado_(e)) {
            // Caso típico: el colaborador tiene acceso al Sheet pero NO permisos de edición en la carpeta.
            log(
                `⚠️ Acceso denegado al escribir en la carpeta de salida. ` +
                `Esto pasa si el usuario no tiene permiso de EDITOR en esa carpeta de Drive. ` +
                `Se guardará en una carpeta fallback en su 'Mi unidad'. Detalle: ${e.toString()}`
            );
            carpeta = obtenerCarpetaFallback_();
            // Recordar por-usuario (no global) para evitar errores repetidos.
            PropertiesService.getUserProperties().setProperty('CARPETA_SALIDA_ID', carpeta.getId());
            return intentarGuardarEnCarpeta_(carpeta);
        }

        log(`❌ Error al guardar archivos: ${e.toString()}`);
        throw e;
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
 * Escapa caracteres especiales de LaTeX (básico)
 */
function escaparLatexBasico(texto) {
    if (!texto) return '';
    return texto.toString()
        .replace(/\\/g, '\\textbackslash{}')
        .replace(/([&%$#_{}])/g, '\\$1')
        .replace(/~/g, '\\textasciitilde{}')
        .replace(/\^/g, '\\textasciicircum{}');
}

/**
 * Escapa contenido específicamente para footnotes
 * Aplica normalización + escape completo
 */
function escaparFootnote(texto) {
    if (!texto) return '';
    // Primero normalizar saltos, luego escapar
    const normalizado = normalizarSaltosLatex(texto);
    return escaparLatexBasico(normalizado);
}

/**
 * FIX: Función de seguridad final - corrige patrones LaTeX inválidos
 * Detecta y corrige automáticamente comandos LaTeX mal escapados
 * Previene errores de compilación como "There's no line here to end"
 */
function validarYCorregirLatex(str) {
    if (!str) return str;

    let corregido = str;
    let cambios = [];

    // FIX: Detectar y corregir \textbackslash{}par
    if (corregido.includes('\\textbackslash{}par')) {
        corregido = corregido.replace(/\\textbackslash\{\}par/g, '\n\n');
        cambios.push('\\textbackslash{}par → líneas en blanco');
    }

    // FIX: Detectar líneas que empiezan con \\ (problemático)
    const lineasProblematicas = corregido.match(/^\\\\[^\\]/gm);
    if (lineasProblematicas) {
        corregido = corregido.replace(/^\\\\([^\\])/gm, '$1');
        cambios.push('líneas iniciando con \\\\ → texto normal');
    }

    // FIX: Detectar \\ inmediatamente antes de texto (\\Texto)
    if (corregido.match(/\\\\[A-Za-z]/)) {
        corregido = corregido.replace(/\\\\([A-Za-z])/g, ' $1');
        cambios.push('\\\\ antes de texto → espacio');
    }

    // FIX: Detectar otros comandos LaTeX mal escapados comunes
    if (corregido.includes('\\textbackslash{}begin')) {
        corregido = corregido.replace(/\\textbackslash\{\}begin/g, '\\begin');
        cambios.push('\\textbackslash{}begin → \\begin');
    }

    if (corregido.includes('\\textbackslash{}end')) {
        corregido = corregido.replace(/\\textbackslash\{\}end/g, '\\end');
        cambios.push('\\textbackslash{}end → \\end');
    }

    if (corregido.includes('\\textbackslash{}section')) {
        corregido = corregido.replace(/\\textbackslash\{\}section/g, '\\section');
        cambios.push('\\textbackslash{}section → \\section');
    }

    if (corregido.includes('\\textbackslash{}item')) {
        corregido = corregido.replace(/\\textbackslash\{\}item/g, '\\item');
        cambios.push('\\textbackslash{}item → \\item');
    }

    // FIX: Registrar correcciones con Logger.warn() si se corrige algo
    if (cambios.length > 0) {
        console.warn(`⚠️ PATRONES INVÁLIDOS CORREGIDOS: ${cambios.join(', ')}`);
        log(`⚠️ Comandos LaTeX mal escapados corregidos: ${cambios.join(', ')}`);
    }

    return corregido;
}

/**
 * Escapa LaTeX pero preserva comandos LaTeX válidos
 */
function escaparLatex(texto) {
    if (!texto) return '';
    return escaparLatexBasico(texto);
}

/**
 * FIX: Normaliza saltos de línea para LaTeX usando ÚNICAMENTE líneas en blanco
 * NUNCA inserta comandos LaTeX (\par, \\) que puedan ser escapados después
 * NUNCA genera \\ al inicio de párrafos
 */
function normalizarSaltosLatex(str) {
    if (!str) return '';

    // 1. Convertir \\n literales (de Google Sheets) a saltos reales
    str = str.replace(/\\n/g, '\n');

    // 2. Normalizar CRLF a LF
    str = str.replace(/\r\n/g, '\n');
    str = str.replace(/\r/g, '\n');

    // 3. Quitar espacios y tabs al final de cada línea
    str = str.replace(/[ \t]+$/gm, '');

    // 4. FIX: Convertir múltiples saltos (2+) a UNA línea en blanco (\n\n)
    // SOLO líneas en blanco, NO comandos \par que se escaparían
    str = str.replace(/\n{2,}/g, '\n\n');

    // 5. FIX: NO convertir saltos simples a \\ ni a espacios
    // LaTeX maneja saltos simples correctamente como espacios naturales

    // 6. Colapsar espacios múltiples dentro de líneas
    str = str.replace(/[ \t]+/g, ' ');

    // 7. FIX: Trim final para eliminar espacios/saltos iniciales/finales problemáticos
    // Esto previene \\ al inicio de párrafos
    str = str.trim();

    return str;
}

/**
 * FIX: Procesa texto con etiquetas completas - ORDEN LÓGICO CORREGIDO
 * Orden OBLIGATORIO: texto crudo → normalizar saltos → proteger → escapar → restaurar → validar
 * NUNCA escapa comandos LaTeX generados por el propio script
 */
function procesarConEtiquetas(texto) {
    if (!texto) return '';
    let str = texto.toString();

    // FIX: PASO 1 - NORMALIZAR SALTOS PRIMERO (antes de proteger)
    // Esto previene problemas con saltos dentro de etiquetas
    str = normalizarSaltosLatex(str);

    // FIX: PASO 2 - Extraer y proteger ECUACIONES (no escapar)
    const ecuaciones = [];

    // Ecuaciones en línea: $...$
    str = str.replace(/\$([^$]+)\$/g, function (match, contenido) {
        ecuaciones.push(`$${contenido}$`);
        return `ZEQPLACEHOLDER${ecuaciones.length - 1}Z`;
    });

    // Ecuaciones display: $$...$$
    str = str.replace(/\$\$([\s\S]*?)\$\$/g, function (match, contenido) {
        ecuaciones.push(`$$${contenido}$$`);
        return `ZEQPLACEHOLDER${ecuaciones.length - 1}Z`;
    });

    // Ecuaciones LaTeX: \(...\) y \[...\]
    str = str.replace(/\\\\?\(([\s\S]*?)\\\\?\)/g, function (match, contenido) {
        ecuaciones.push(`\\(${contenido}\\)`);
        return `ZEQPLACEHOLDER${ecuaciones.length - 1}Z`;
    });

    str = str.replace(/\\\\?\[([\s\S]*?)\\\\?\]/g, function (match, contenido) {
        ecuaciones.push(`\\[${contenido}\\]`);
        return `ZEQPLACEHOLDER${ecuaciones.length - 1}Z`;
    });

    // [[ecuacion:...]] -> \begin{equation} ... \end{equation}
    str = str.replace(/\[\[ecuacion:([\s\S]*?)\]\]/g, function (match, contenido) {
        ecuaciones.push(`\\begin{equation}\n${contenido.trim()}\n\\end{equation}`);
        return `ZEQPLACEHOLDER${ecuaciones.length - 1}Z`;
    });

    // [[math:...]] -> $ ... $
    str = str.replace(/\[\[math:([\s\S]*?)\]\]/g, function (match, contenido) {
        ecuaciones.push(`$${contenido.trim()}$`);
        return `ZEQPLACEHOLDER${ecuaciones.length - 1}Z`;
    });

    // FIX: PASO 3 - Extraer y proteger CITAS
    const citas = [];
    str = str.replace(/\[\[cita:([\s\S]*?)\]\]/g, function (match, contenido) {
        const clave = contenido.toString().trim();
        citas.push(`\\cite{${clave}}`);
        return `ZCITEPOLDER${citas.length - 1}Z`;
    });

    // FIX: PASO 4 - Extraer y proteger RECUADROS MULTI-LÍNEA
    const recuadros = [];
    str = str.replace(/\[\[recuadro:([^\]]*)\]\]([\s\S]*?)\[\[\/recuadro\]\]/g, function (match, titulo, contenido) {
        const tituloLimpio = titulo.trim();
        // FIX: NO aplicar normalización aquí, ya se hizo al inicio
        const tituloArg = tituloLimpio ? `{${tituloLimpio}}` : '';
        recuadros.push(`\\begin{recuadro}${tituloArg}\n${contenido}\n\\end{recuadro}`);
        return `ZRECUADROPLACEHOLDER${recuadros.length - 1}Z`;
    });

    // FIX: PASO 5 - Proteger otras etiquetas simples
    const etiquetas = [];

    // [[nota:...]]
    str = str.replace(/\[\[nota:([\s\S]*?)\]\]/g, function (match, contenido) {
        etiquetas.push(`\\footnote{${escaparFootnote(contenido)}}`);
        return `ZETIQUETAPLACEHOLDER${etiquetas.length - 1}Z`;
    });

    // [[destacado:...]]
    str = str.replace(/\[\[destacado:([\s\S]*?)\]\]/g, function (match, contenido) {
        etiquetas.push(`\\begin{destacado}\n${contenido}\n\\end{destacado}`);
        return `ZETIQUETAPLACEHOLDER${etiquetas.length - 1}Z`;
    });

    // [[dorado:...]]
    str = str.replace(/\[\[dorado:([\s\S]*?)\]\]/g, function (match, contenido) {
        etiquetas.push(`\\textbf{\\textcolor{gobmxDorado}{${contenido}}}`);
        return `ZETIQUETAPLACEHOLDER${etiquetas.length - 1}Z`;
    });

    // [[guinda:...]]
    str = str.replace(/\[\[guinda:([\s\S]*?)\]\]/g, function (match, contenido) {
        etiquetas.push(`\\textbf{\\textcolor{gobmxGuinda}{${contenido}}}`);
        return `ZETIQUETAPLACEHOLDER${etiquetas.length - 1}Z`;
    });

    // FIX: PASO 6 - ESCAPAR LaTeX SOLO en texto plano (ya normalizado y protegido)
    str = escaparLatexBasico(str);

    // FIX: PASO 7 - NORMALIZAR comillas tipográficas
    str = str.replace(/[""]/g, '"');
    str = str.replace(/['']/g, "'");

    // FIX: PASO 8 - RESTAURAR contenido protegido (comandos LaTeX válidos)

    // Restaurar recuadros
    str = str.replace(/ZRECUADROPLACEHOLDER(\d+)Z/g, function (match, index) {
        return recuadros[parseInt(index)];
    });

    // Restaurar etiquetas
    str = str.replace(/ZETIQUETAPLACEHOLDER(\d+)Z/g, function (match, index) {
        return etiquetas[parseInt(index)];
    });

    // Restaurar citas
    str = str.replace(/ZCITEPOLDER(\d+)Z/g, function (match, index) {
        return citas[parseInt(index)];
    });

    // Restaurar ecuaciones
    str = str.replace(/ZEQPLACEHOLDER(\d+)Z/g, function (match, index) {
        return ecuaciones[parseInt(index)];
    });

    // FIX: PASO 9 - VALIDACIÓN FINAL: corregir patrones inválidos
    str = validarYCorregirLatex(str);

    return str;
}

/**
 * Procesa texto de fuente/notas al pie
 * Convierte \n en saltos de línea reales, escapa LaTeX, agrega hypertargets
 * y formatea las notas como lista con viñetas
 */
function procesarTextoFuente(texto) {
    if (!texto) return '';

    // Usar normalización segura de saltos
    const textoNormalizado = normalizarSaltosLatex(texto);

    // Separar en líneas (después de normalización, los saltos ya son espacios)
    const lineas = textoNormalizado.split(/\s+/).filter(l => l.trim() !== '');

    // Separar fuente principal de notas
    const lineasFuente = [];
    const lineasNotas = [];

    // Reconstruir texto y buscar patrones de notas
    const textoCompleto = lineas.join(' ');
    const partesTexto = textoCompleto.split(/(\b[0-9]+\/|\b[a-zA-Z]+\/)/);

    let textoFuente = '';
    for (let i = 0; i < partesTexto.length; i++) {
        const parte = partesTexto[i];
        if (parte.match(/^([0-9]+\/|[a-zA-Z]+\/)$/)) {
            // Es una nota, tomar el siguiente elemento como contenido
            const contenidoNota = partesTexto[i + 1] || '';
            lineasNotas.push({
                nota: parte,
                texto: contenidoNota.trim()
            });
            i++; // Saltar el contenido ya procesado
        } else if (parte.trim()) {
            textoFuente += parte + ' ';
        }
    }

    // Construir resultado
    let resultado = '';

    // Agregar fuente principal
    if (textoFuente.trim()) {
        // Permitir etiquetas como [[nota:...]] dentro de la fuente.
        // Esto es útil para notas al pie que deben ir pegadas a la línea FUENTE.
        // NOTA: procesarConEtiquetas ya protege/escapa texto plano y convierte [[nota:]] a \footnote{...}.
        resultado += procesarConEtiquetas(textoFuente.trim());
    }

    // Agregar notas como lista si existen
    if (lineasNotas.length > 0) {
        resultado += '\n\n{\\fontsize{9pt}{11pt}\\selectfont\n';
        resultado += '\\begin{itemize}\n';

        lineasNotas.forEach(item => {
            const idNota = generarIdNota(item.nota);
            const notaEscapada = escaparLatex(item.nota);
            // También permitir etiquetas (incluyendo [[nota:...]]) dentro del texto de la nota.
            const textoEscapado = procesarConEtiquetas(item.texto);

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
    const textoAlt = figura['TextoAlternativo'] || caption;
    const ancho = figura['Ancho'] || '1.0';

    log(`  🖼️  Figura detectada: ${previewTexto(caption, 40)}...`);

    let tex = `\\begin{figure}[H]\n`;
    // Agrupar \centering e imagen para que no afecte al caption
    tex += `  {\\centering\n`;

    if (rutaArchivo) {
        if (textoAlt) {
            // Con texto alternativo para accesibilidad
            tex += `  % Texto alternativo para accesibilidad\n`;
            tex += `  \\pdftooltip{\\includegraphics[width=${ancho}\\textwidth]{${rutaArchivo}}}{${escaparLatex(textoAlt)}}\n`;
        } else {
            // Sin texto alternativo
            tex += `  \\includegraphics[width=${ancho}\\textwidth]{${rutaArchivo}}\n`;
        }
    }

    // Cerrar el grupo con \par para finalizar el párrafo centrado
    tex += `  \\par}\n`;

    // Forzar alineación a la izquierda para el caption
    tex += `  \\raggedright\n`;

    // Caption va después de la imagen (abajo, alineado a la izquierda por configuración del cls)
    if (caption) {
        tex += `  \\caption{${escaparLatex(caption)}}\n`;
        tex += `  \\label{fig:${generarLabel(caption)}}\n`;
    }

    tex += `\\end{figure}\n`;

    if (fuente) {
        // FIX: Reducir espacio antes de fuente para pegarla más a la figura
        tex += `\\vspace{-4pt}\n`;
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
                    // Para tablas largas: usar tabladoradoLargo (sin caption, va en longtable)
                    texInicio = `\\begin{tabladoradoLargo}\n`;
                    texFin = `\\end{tabladoradoLargo}\n`;
                } else {
                    // FIX: Para tablas cortas: usar tabladoradoCorto (mismo estilo que longtable)
                    texInicio = `\\begin{tabladoradoCorto}\n`;
                    texInicio += `  \\caption{${escaparLatex(titulo)}}\n`;
                    texInicio += `  \\label{tab:${generarLabel(titulo)}}\n`;
                    texFin = `\\end{tabladoradoCorto}\n`;
                }
                texInicio += resultado.contenido;
            } else {
                log(`    ⚠️ No se encontró la hoja: "${nombreHoja}"`);
                // FIX: Cachear lista de hojas para evitar llamadas repetidas
                if (!this._hojasDisponiblesCache) {
                    this._hojasDisponiblesCache = ss.getSheets().map(s => s.getName()).join(', ');
                }
                log(`    💡 Hojas disponibles: ${this._hojasDisponiblesCache}`);
                // No inyectamos una tabla de error al PDF; dejamos el diagnóstico en comentarios del .tex.
                tex += `  % ERROR: No se encontró la hoja "${nombreHoja}"\n`;
                tex += `  % Hojas disponibles: ${this._hojasDisponiblesCache}\n`;
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
        // FIX: Fallback: usar tabladoradoCorto para tablas simples (estilo consistente)
        texInicio = `\\begin{tabladoradoCorto}\n  \\caption{${escaparLatex(titulo)}}\n  \\label{tab:${generarLabel(titulo)}}\n`;
        texFin = `\\end{tabladoradoCorto}\n`;
    }
    if (tex === '') {
        tex = texInicio + texFin;
    }

    if (fuente) {
        // FIX: Reducir espacio antes de fuente para pegarla más a la tabla
        tex += `\\vspace{-4pt}\n`;
        tex += `\\fuente{${procesarTextoFuente(fuente)}}\n`;
    }

    tex += `\n`;
    return tex;
}

/**
 * Procesa un array 2D de datos (desde Google Sheets) y genera tabla LaTeX
 * Si la tabla tiene muchas columnas, la divide automáticamente
 */
function procesarDatosArray(datos, tituloTabla, forzarLongtable = false) {
    if (!datos || datos.length === 0) {
        return { tipo: 'tabular', contenido: `  \\begin{tabular}{lc}\n    % Sin datos\n  \\end{tabular}\n` };
    }

    const numCols = datos[0].length;
    // Máximo de columnas por tabla (incluyendo la primera).
    // Requisito: permitir hasta 14 columnas además de la primera (total 15) antes de dividir por columnas.
    const MAX_COLS_POR_TABLA = 15;
    const MAX_FILAS_COMPACTA = 15; // Umbral para usar tabular en tablas cortas (reducido)
    const MAX_FILAS_POR_PARTE = 35; // Si hay demasiadas filas, dividir por partes

    // Si la tabla cabe en una sola parte
    if (numCols <= MAX_COLS_POR_TABLA) {
        const numFilas = Math.max(0, datos.length - 1);

        // Si es una tabla pequeña y no se fuerza longtable, usar tabular
        if (numFilas <= MAX_FILAS_COMPACTA && !forzarLongtable) {
            return { tipo: 'tabular', contenido: generarTablaCompacta(datos) };
        }

        // Para tablas medianas o si se fuerza longtable
        if (numFilas > MAX_FILAS_POR_PARTE) {
            return { tipo: 'longtable', contenido: dividirTablaPorFilas(datos, MAX_FILAS_POR_PARTE, tituloTabla) };
        }
        return { tipo: 'longtable', contenido: generarTablaSimple(datos, tituloTabla) };
    }

    // Dividir tabla en múltiples partes (siempre longtable)
    return { tipo: 'longtable', contenido: dividirTabla(datos, MAX_COLS_POR_TABLA, tituloTabla) };
}

// ================================
// SENER: Tablas largas (xltabular)
// ================================

// Ajusta el ancho de la primera columna (definido en sener2025.cls)
const SENER_LONGTABLE_FIRSTCOL_WIDTH = '0.34\\textwidth';

function senerLongtablePreamble() {
    return `  \\setlength{\\SENERLongTableFirstColWidth}{${SENER_LONGTABLE_FIRSTCOL_WIDTH}}\n`;
}

function senerLongtableSpec(numCols) {
    // Primera columna: Q (ancha + bold), resto: Z (X) para auto-fit
    return 'Q' + 'Z'.repeat(Math.max(0, numCols - 1));
}

function senerLongtableHeaderRow(celdasEncabezadoProcesadas) {
    // Primera columna normal; resto con encabezado vertical
    return celdasEncabezadoProcesadas
        .map((c, idx) => idx === 0
            ? `\\encabezadodorado{${c}}`
            : `\\encabezadodorado{\\SENERVHeader{${c}}}`)
        .join(' & ');
}

/**
 * Genera una tabla simple sin división
 */
function generarTablaSimple(datos, tituloTabla) {
    const numCols = datos[0].length;

    // Calcular especificación de columnas para xltabular
    // Primera columna: Q (ancha + bold), resto: Z (X) para distribuir equitativamente
    const especCols = senerLongtableSpec(numCols);

    // Usar xltabular para permitir saltos de página automáticos y auto-fit de columnas
    let tex = senerLongtablePreamble();
    tex += `  \\begin{xltabular}{\\textwidth}{${especCols}}\n`;
    if (tituloTabla) {
        tex += `    \\caption{${escaparLatex(tituloTabla)}}\\label{tab:${generarLabel(tituloTabla)}}\\\\\n`;
    }

    // Encabezado para la primera página con fondo dorado
    tex += `    \\toprule\n`;
    const encabezados = senerLongtableHeaderRow(procesarCeldasFila(datos[0], true, true));
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
        const celdas = procesarCeldasFila(datos[i], false, true);
        tex += `    ${celdas.join(' & ')} \\\\\n`;
    }

    tex += `  \\end{xltabular}\n`;
    return tex;
}

/**
 * FIX: Genera una tabla compacta usando tabular (para tabladoradoCorto)
 * Ahora con estilo dorado + texto gris + alineación izquierda
 */
function generarTablaCompacta(datos) {
    const numCols = datos[0].length;
    // FIX: Usar tipos de columna X con texto gris y alineación izquierda para auto-fit
    const especCols = 'V' + ('v'.repeat(numCols - 1));
    let tex = `  \\begin{tabularx}{\\textwidth}{${especCols}}\n`;
    tex += `    \\toprule\n`;
    // Encabezados con fondo dorado
    const encabezados = procesarCeldasFila(datos[0], true, false).map(c => `\\encabezadodorado{${c}}`).join(' & ');
    tex += `    \\rowcolor{gobmxDorado} ${encabezados} \\\\\n`;
    tex += `    \\midrule\n`;

    for (let i = 1; i < datos.length; i++) {
        const celdas = procesarCeldasFila(datos[i], false, false);
        tex += `    ${celdas.join(' & ')} \\\\\n`;
    }

    tex += `    \\bottomrule\n`;
    tex += `  \\end{tabularx}\n`;
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

        // FIX: Usar clearpage en continuaciones de tablas para evitar errores de glue
        if (parte > 1) {
            tex += `\n  \\clearpage\n`;
            tex += `  {\\small\\textit{Continuación Tabla. ${escaparLatex(tituloTabla || '')}}}\n`;
            tex += `  \\vspace{0.15em}\n\n`;
        }

        // Generar esta parte de la tabla
        const colsEnEstaParte = [0].concat(Array.from({ length: colFin - colInicio }, (_, i) => colInicio + i));
        const numColsTabla = colsEnEstaParte.length;

        // Calcular especificación de columnas para xltabular
        const especCols = senerLongtableSpec(numColsTabla);

        // Usar xltabular para permitir saltos de página y auto-fit
        tex += senerLongtablePreamble();
        tex += `  \\begin{xltabular}{\\textwidth}{${especCols}}\n`;
        if (tituloTabla && parte === 1) {
            tex += `    \\caption{${escaparLatex(tituloTabla)}}\\label{tab:${generarLabel(tituloTabla)}}\\\\\n`;
        }

        // Extraer encabezados de esta parte con fondo dorado
        const celdasEncabezado = colsEnEstaParte.map(colIdx => datos[0][colIdx]);
        const encabezados = senerLongtableHeaderRow(procesarCeldasFila(celdasEncabezado, true, true));

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
            const celdas = procesarCeldasFila(celdasParte, false, true);
            tex += `    ${celdas.join(' & ')} \\\\\n`;
        }

        tex += `  \\end{xltabular}\n`;

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
    // EspecCols con auto-fit distribuido
    const especCols = senerLongtableSpec(numCols);
    let tex = '';
    let inicio = 1; // Saltar encabezado
    let parte = 1;
    while (inicio < datos.length) {
        const fin = Math.min(inicio + maxFilasParte, datos.length);
        tex += senerLongtablePreamble();
        tex += `  \\begin{xltabular}{\\textwidth}{${especCols}}\n`;
        if (tituloTabla && parte === 1) {
            tex += `    \\caption{${escaparLatex(tituloTabla)}}\\label{tab:${generarLabel(tituloTabla)}}\\\\\n`;
        }
        tex += `    \\toprule\n`;
        const encabezados = senerLongtableHeaderRow(procesarCeldasFila(datos[0], true, true));
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
            const celdas = procesarCeldasFila(datos[i], false, true);
            tex += `    ${celdas.join(' & ')} \\\\\n`;
        }
        tex += `  \\end{xltabular}\n`;
        if (fin < datos.length) {
            // FIX: Usar clearpage en continuaciones de tablas para evitar errores de glue
            tex += `\n  \\clearpage\n  {\\small\\textit{Continuación Tabla. ${escaparLatex(tituloTabla || '')}}}\n\n`;
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
 * @param {boolean} esTablaLarga - Si es tabla larga (para aplicar sangría en la primera columna)
 */
function procesarCeldasFila(fila, esEncabezado = false, esTablaLarga = false) {
    return fila.map((c, idx) => {
        if (c === null || c === undefined || c === '') return '';

        // Si es número, redondear a máximo 4 decimales
        if (typeof c === 'number') {
            const nf = Intl.NumberFormat('en-US', { maximumFractionDigits: 4, useGrouping: true });
            const n = escaparLatex(nf.format(c));
            return (esTablaLarga && !esEncabezado) ? `\\SENERNum{${n}}` : n;
        }

        // Si es string que parece número, intentar redondear
        const textoNum = c.toString().trim();
        // Acepta: 123, -123, 1,234, 1,234.56, 123.45
        const pareceNumero = /^-?\d{1,3}(?:,\d{3})*(?:\.\d+)?$|^-?\d+(?:\.\d+)?$/.test(textoNum);
        if (pareceNumero) {
            const sinComas = textoNum.replace(/,/g, '');
            const num = parseFloat(sinComas);
            if (!isNaN(num)) {
                const nf = Intl.NumberFormat('en-US', { maximumFractionDigits: 4, useGrouping: true });
                const n = escaparLatex(nf.format(num));
                return (esTablaLarga && !esEncabezado) ? `\\SENERNum{${n}}` : n;
            }
        }

        // Detectar y separar notas ANTES de escapar
        const textoOriginal = c.toString();
        const resultado = estilizarNotas(textoOriginal);

        let textoFinal;
        if (resultado.tieneNotas) {
            // Escapar el texto base
            const textoBaseEscapado = escaparLatex(resultado.textoBase);

            // Color blanco para encabezados (fondo dorado), negro para cuerpo (antes gris)
            const colorNota = esEncabezado ? 'white' : 'black';

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

        // FIX: Si es tabla larga y es la primera columna, procesar sangría si hay espacios iniciales
        if (esTablaLarga && idx === 0 && !esEncabezado) {
            const matchEspacios = textoOriginal.match(/^(\s+)/);
            if (matchEspacios) {
                const numEspacios = matchEspacios[1].length;
                // 1 espacio = \quad (~1em), más espacios = más sangría
                const sangria = (numEspacios === 1) ? '\\quad ' : '\\hspace{' + (numEspacios * 0.45) + 'em} ';
                textoFinal = sangria + textoFinal.trimStart();
            }
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
    // Necesario para que el vínculo del índice apunte a la sección correcta
    // cuando usamos secciones sin numeración (\\section*).
    tex += `\\phantomsection\n`;
    tex += `\\addcontentsline{toc}{section}{Glosario}\n\n`;

    // Ordenar alfabéticamente
    glosario.sort((a, b) => {
        const termA = (a['Termino'] || '').toString().toLowerCase();
        const termB = (b['Termino'] || '').toString().toLowerCase();
        return termA.localeCompare(termB);
    });

    glosario.forEach(entrada => {
        const termino = (entrada['Termino'] || '').toString().trim();
        const definicion = (entrada['Definicion'] || '').toString().trim();
        if (termino && definicion) {
            // FIX: Limpiar saltos de línea al final para evitar errores con las llaves de LaTeX
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
    // Necesario para que el vínculo del índice apunte a la sección correcta
    // cuando usamos secciones sin numeración (\\section*).
    tex += `\\phantomsection\n`;
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


/**
 * Función de prueba para validar la normalización de saltos
 * Ejecutar desde el editor de Google Apps Script para verificar
 */
function probarNormalizacionSaltos() {
    console.log('=== PRUEBAS DE NORMALIZACIÓN DE SALTOS ===');

    // Caso 1: Salto al inicio (problemático)
    const caso1 = '\nObjetivo: detectar errores...';
    const resultado1 = normalizarSaltosLatex(caso1);
    console.log('Caso 1 (salto inicial):');
    console.log('Entrada:', JSON.stringify(caso1));
    console.log('Salida:', JSON.stringify(resultado1));
    console.log('✓ No inicia con \\\\:', !resultado1.startsWith('\\\\'));

    // Caso 2: Múltiples saltos
    const caso2 = 'Primera línea\\n\\nSegunda línea\\nTercera línea';
    const resultado2 = normalizarSaltosLatex(caso2);
    console.log('\nCaso 2 (múltiples saltos):');
    console.log('Entrada:', JSON.stringify(caso2));
    console.log('Salida:', JSON.stringify(resultado2));

    // Caso 3: Recuadro con contenido multilínea
    const caso3 = '[[recuadro:Título]]\\nPrimera línea\\nSegunda línea\\n\\nNuevo párrafo[[/recuadro]]';
    const resultado3 = procesarConEtiquetas(caso3);
    console.log('\nCaso 3 (recuadro multilínea):');
    console.log('Entrada:', JSON.stringify(caso3));
    console.log('Salida:', JSON.stringify(resultado3));
    console.log('✓ Contiene \\begin{recuadro}:', resultado3.includes('\\begin{recuadro}'));
    console.log('✓ No contiene [[recuadro:', !resultado3.includes('[[recuadro:'));

    // Caso 4: Ecuación con texto
    const caso4 = 'La fórmula es $E=mc^2$ donde\\nE es energía';
    const resultado4 = procesarConEtiquetas(caso4);
    console.log('\nCaso 4 (ecuación con salto):');
    console.log('Entrada:', JSON.stringify(caso4));
    console.log('Salida:', JSON.stringify(resultado4));
    console.log('✓ Preserva ecuación:', resultado4.includes('$E=mc^2$'));

    console.log('\n=== PRUEBAS COMPLETADAS ===');
    return 'Todas las pruebas ejecutadas. Revisa la consola para resultados.';
}
/**
 * Función de prueba para validar las correcciones del script
 * Ejecutar desde el editor de Google Apps Script para verificar
 */
function probarCorreccionesScript() {
    console.log('=== PRUEBAS DE CORRECCIONES DEL SCRIPT ===');

    // Prueba 1: Footnote con caracteres especiales
    console.log('\n1. Prueba de footnote con caracteres especiales:');
    const textoFootnote = 'Nota con símbolos como % y & que deben escaparse.';
    const footnoteCorregida = escaparFootnote(textoFootnote);
    console.log('Entrada:', JSON.stringify(textoFootnote));
    console.log('Salida:', JSON.stringify(footnoteCorregida));
    console.log('✓ Contiene \\%:', footnoteCorregida.includes('\\%'));
    console.log('✓ Contiene \\&:', footnoteCorregida.includes('\\&'));

    // Prueba 2: Procesamiento de etiqueta [[nota:...]]
    console.log('\n2. Prueba de etiqueta [[nota:...]] con caracteres especiales:');
    const textoConNota = 'Texto normal [[nota:Nota con % y & especiales]] más texto.';
    const notaProcesada = procesarConEtiquetas(textoConNota);
    console.log('Entrada:', JSON.stringify(textoConNota));
    console.log('Salida:', JSON.stringify(notaProcesada));
    console.log('✓ Contiene \\footnote:', notaProcesada.includes('\\footnote'));
    console.log('✓ No contiene [[nota:', !notaProcesada.includes('[[nota:'));
    console.log('✓ Caracteres escapados:', notaProcesada.includes('\\%') && notaProcesada.includes('\\&'));

    // Prueba 3: Normalización sin \par
    console.log('\n3. Prueba de normalización sin \\par:');
    const textoConSaltos = 'Primera línea\\n\\nSegunda línea\\nTercera línea';
    const normalizado = normalizarSaltosLatex(textoConSaltos);
    console.log('Entrada:', JSON.stringify(textoConSaltos));
    console.log('Salida:', JSON.stringify(normalizado));
    console.log('✓ NO contiene \\par:', !normalizado.includes('\\par'));
    console.log('✓ Contiene doble salto:', normalizado.includes('\n\n'));

    // Prueba 4: Validación de comandos mal escapados
    console.log('\n4. Prueba de validación de comandos mal escapados:');
    const textoConComandoMalEscapado = 'Texto con \\textbackslash{}par y \\textbackslash{}begin{test}';
    const validado = validarYCorregirLatex(textoConComandoMalEscapado);
    console.log('Entrada:', JSON.stringify(textoConComandoMalEscapado));
    console.log('Salida:', JSON.stringify(validado));
    console.log('✓ NO contiene \\textbackslash{}par:', !validado.includes('\\textbackslash{}par'));
    console.log('✓ Contiene líneas en blanco:', validado.includes('\n\n'));

    // Prueba 5: Procesamiento completo sin comandos mal escapados
    console.log('\n5. Prueba de procesamiento completo:');
    const textoCompleto = 'Objetivo: detectar errores\\n\\nEste texto tiene párrafos separados.';
    const procesadoCompleto = procesarConEtiquetas(textoCompleto);
    console.log('Entrada:', JSON.stringify(textoCompleto));
    console.log('Salida:', JSON.stringify(procesadoCompleto));
    console.log('✓ NO contiene \\textbackslash{}par:', !procesadoCompleto.includes('\\textbackslash{}par'));
    console.log('✓ NO contiene \\par literal:', !procesadoCompleto.includes('\\par'));

    // Prueba 6: Fuente con [[nota:...]] (debe producir \footnote dentro de \fuente{...})
    console.log('\n6. Prueba de procesarTextoFuente con [[nota:...]]:');
    const fuenteConNota = 'INEGI [[nota:Nota en fuente con % y &]]';
    const fuenteProcesada = procesarTextoFuente(fuenteConNota);
    console.log('Entrada:', JSON.stringify(fuenteConNota));
    console.log('Salida:', JSON.stringify(fuenteProcesada));
    console.log('✓ Contiene \\footnote:', fuenteProcesada.includes('\\footnote'));
    console.log('✓ No contiene [[nota:', !fuenteProcesada.includes('[[nota:'));
    console.log('✓ Caracteres escapados:', fuenteProcesada.includes('\\%') && fuenteProcesada.includes('\\&'));

    console.log('\n=== PRUEBAS COMPLETADAS ===');
    console.log('Revisa los resultados arriba para verificar que todas las correcciones funcionan.');

    return 'Pruebas ejecutadas. Revisa la consola para resultados detallados.';
}