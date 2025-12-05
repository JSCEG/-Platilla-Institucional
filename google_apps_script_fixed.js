/**
 * SENER LaTeX Generator - Google Apps Script
 * Genera archivos .tex desde Google Sheets para el template institucional
 * 
 * CONFIGURACIÓN REQUERIDA:
 * 1. Cambia CARPETA_SALIDA_ID por tu ID de carpeta de Drive
 * 2. Estructura de hojas requerida:
 *    - Documentos: ID, Titulo, Subtitulo, Autor, Fecha, Institucion, Unidad, DocumentoCorto, PalabrasClave, Version, ResumenEjecutivo, DatosClave
 *    - Secciones: ID (docId), Orden, Nivel, Titulo, Contenido
 *    - Bibliografia (opcional): ID (docId), Tipo, Clave, Autor, Titulo, Anio, Editorial, Url
 */

const CARPETA_SALIDA_ID = '1NnO4B8EJCx6VNrmDxWwwW3KsHCTID_c2';

/**
 * Crea el menú en la interfaz de Google Sheets
 */
function onOpen() {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('SENER')
        .addItem('Generar .tex de este documento', 'generarLatex')
        .addItem('Ver log de errores', 'mostrarLog')
        .addToUi();
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
    ui.alert('Log de ejecución', logMensajes.join('\n'), ui.ButtonSet.OK);
    logMensajes = [];
}

/**
 * Función principal para generar el archivo LaTeX
 */
function generarLatex() {
    logMensajes = [];
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ui = SpreadsheetApp.getUi();

    try {
        log('Iniciando generación de LaTeX...');

        // 1. Obtener datos de la hoja "Documentos"
        const hojaDocs = ss.getSheetByName('Documentos');
        if (!hojaDocs) {
            ui.alert('Error: No se encuentra la hoja "Documentos".');
            return;
        }

        const filaActiva = hojaDocs.getActiveCell().getRow();
        if (filaActiva < 2) {
            ui.alert('Por favor, selecciona una fila de documento válida en la hoja "Documentos".');
            return;
        }

        const datosDoc = obtenerDatosFila(hojaDocs, filaActiva);
        const docId = datosDoc['ID'];

        if (!docId) {
            ui.alert('Error: La fila seleccionada no tiene un ID de documento.');
            return;
        }

        log(`Procesando documento ID: ${docId}`);

        // 2. Leer Secciones y Bibliografía
        const secciones = obtenerRegistros(ss, 'Secciones', docId);
        const bibliografia = obtenerRegistros(ss, 'Bibliografia', docId);

        log(`Secciones encontradas: ${secciones.length}`);
        log(`Referencias bibliográficas: ${bibliografia.length}`);

        // Ordenar secciones por orden
        secciones.sort((a, b) => {
            const oa = parseFloat(a.Orden) || 0;
            const ob = parseFloat(b.Orden) || 0;
            return oa - ob;
        });

        // 3. Construir el contenido LaTeX
        const tex = construirLatex(datosDoc, secciones, bibliografia);

        // 4. Guardar archivos en Drive
        guardarArchivos(datosDoc, tex, bibliografia);

        ui.alert(`¡Éxito! Archivos generados correctamente.\n\nRevisa el log para más detalles.`);
        mostrarLog();

    } catch (e) {
        ui.alert(`Error: ${e.toString()}\n\nStack: ${e.stack}`);
        log(`ERROR: ${e.toString()}`);
        log(`Stack: ${e.stack}`);
    }
}

/**
 * Construye el documento LaTeX completo
 */
function construirLatex(datosDoc, secciones, bibliografia) {
    let tex = '';

    // --- Preámbulo ---
    tex += `\\documentclass{sener2025}\n\n`;

    if (bibliografia.length > 0) {
        tex += `\\addbibresource{referencias.bib}\n\n`;
    }

    // --- Metadatos ---
    tex += `% --- Metadatos ---\n`;
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
    tex += `\\portadafondo\n\n`;

    // --- Tabla de Contenidos ---
    tex += `\\tableofcontents\n\\newpage\n\n`;

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
        const items = textoDatos.split(/[\n;]/);
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
    const resultado = procesarSecciones(secciones);
    tex += resultado.contenido;

    // --- Directorio ---
    if (resultado.directorio) {
        tex += `\\paginacreditos{\n${resultado.directorio}\n}\n`;
    }

    // --- Bibliografía ---
    if (bibliografia.length > 0) {
        tex += `\\printbibliography\n\n`;
    }

    // --- Contraportada ---
    if (resultado.contraportada) {
        tex += `\\contraportada{\n${resultado.contraportada}\n}\n`;
    }

    tex += `\n\\end{document}\n`;

    return tex;
}

/**
 * Procesa todas las secciones del documento
 */
function procesarSecciones(secciones) {
    let contenido = '';
    let directorio = '';
    let contraportada = '';
    let anexosIniciados = false;
    let contadorPortadas = 0;

    secciones.forEach((seccion, index) => {
        const nivel = (seccion['Nivel'] || 'seccion').toString().toLowerCase();
        const titulo = seccion['Titulo'] || '';
        const contenidoRaw = (seccion['Contenido'] || '').toString();

        log(`Procesando sección ${index + 1}: ${nivel} - ${titulo}`);

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
    
    if (nivel === 'subseccion' || nivel === 'subanexo') {
        return `\\subsection{${tituloEscapado}}\n\n`;
    } else if (nivel === 'subsubseccion' || nivel === 'subsubsección' || nivel.includes('subsub')) {
        return `\\subsubsection{${tituloEscapado}}\n\n`;
    } else if (nivel.includes('parrafo') || nivel.includes('párrafo')) {
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
        const esItemLista = lineaTrim.match(/^[-*]\s+(.*)/);

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
                resultado += `% TABLA PENDIENTE: ${lineaTrim}\n`;
            } else if (lineaTrim.startsWith('[[figura:')) {
                resultado += `% FIGURA PENDIENTE: ${lineaTrim}\n`;
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
    log(`Archivo ${nombreBase}.tex creado`);

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
        log(`Archivo referencias.bib creado con ${bibliografia.length} referencias`);
    }
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Obtiene todos los registros de una hoja que coincidan con docId
 */
function obtenerRegistros(ss, nombreHoja, docId) {
    const hoja = ss.getSheetByName(nombreHoja);
    if (!hoja) {
        log(`Advertencia: No se encuentra la hoja "${nombreHoja}"`);
        return [];
    }

    const datos = hoja.getDataRange().getValues();
    if (datos.length < 2) {
        log(`Advertencia: La hoja "${nombreHoja}" está vacía`);
        return [];
    }

    const headers = datos[0];
    const registros = [];

    for (let i = 1; i < datos.length; i++) {
        const fila = datos[i];
        // Comparación flexible (== en lugar de ===)
        if (fila[0] == docId) {
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
