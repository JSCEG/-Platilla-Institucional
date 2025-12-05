/**
 * Constantes de configuración
 * Cambia esto por el ID de la carpeta de Google Drive donde quieres guardar los .tex
 */
const CARPETA_SALIDA_ID = '1NnO4B8EJCx6VNrmDxWwwW3KsHCTID_c2';

/**
 * Crea el menú en la interfaz de Google Sheets
 */
function onOpen() {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('SENER')
        .addItem('Generar .tex de este documento', 'generarLatex')
        .addToUi();
}

/**
 * Función principal para generar el archivo LaTeX
 */
function generarLatex() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ui = SpreadsheetApp.getUi();

    // 1. Obtener datos de la hoja "Documentos"
    const hojaDocs = ss.getSheetByName('Documentos');
    if (!hojaDocs) {
        ui.alert('Error: No se encuentra la hoja "Documentos".');
        return;
    }

    // Asumimos que el usuario tiene seleccionado el documento que quiere generar
    // o tomamos el primero si no hay selección específica. 
    // Para este ejemplo, tomamos la fila activa.
    const filaActiva = hojaDocs.getActiveCell().getRow();

    // Validar que estemos en una fila de datos (asumiendo fila 1 headers)
    if (filaActiva < 2) {
        ui.alert('Por favor, selecciona una fila de documento válida en la hoja "Documentos".');
        return;
    }

    // Mapeo de columnas (ajusta los índices según tu estructura real)
    const datosDoc = obtenerDatosFila(hojaDocs, filaActiva);
    const docId = datosDoc['ID'];

    if (!docId) {
        ui.alert('Error: La fila seleccionada no tiene un ID de documento.');
        return;
    }

    // 2. Leer Secciones, Figuras, Tablas y Bibliografía filtrando por docId
    // 2. Leer Secciones, Figuras, Tablas y Bibliografía filtrando por docId
    const secciones = obtenerRegistros(ss, 'Secciones', docId);
    // DESHABILITADO TEMPORALMENTE
    const figuras = []; // obtenerRegistros(ss, 'Figuras', docId);
    const tablas = []; // obtenerRegistros(ss, 'Tablas', docId);
    const bibliografia = []; // obtenerRegistros(ss, 'Bibliografia', docId);

    // Ordenar secciones por orden
    // Ordenar secciones por orden
    secciones.sort((a, b) => {
        const oa = parseFloat(a.Orden) || 0;
        const ob = parseFloat(b.Orden) || 0;
        return oa - ob;
    });

    // 3. Construir el contenido LaTeX
    let tex = '';
    let hayTablasUsadas = false;
    let hayFigurasUsadas = false;

    // --- Preámbulo y Metadatos ---
    tex += `\\documentclass{sener2025}\n\n`;

    // Agregar recurso de bibliografía si existe
    if (bibliografia.length > 0) {
        tex += `\\addbibresource{referencias.bib}\n\n`;
    }

    tex += `% --- Metadatos ---\n`;
    tex += `\\title{${escaparLatex(datosDoc['Titulo'])}}\n`;
    if (datosDoc['Subtitulo']) tex += `\\subtitle{${escaparLatex(datosDoc['Subtitulo'])}}\n`;
    tex += `\\author{${escaparLatex(datosDoc['Autor'])}}\n`;
    // Formateo amigable de la fecha
    const fechaRaw = datosDoc['Fecha'];
    let fechaFormateada = '';

    if (fechaRaw instanceof Date) {
        const meses = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ];
        fechaFormateada = `${fechaRaw.getDate()} de ${meses[fechaRaw.getMonth()]} de ${fechaRaw.getFullYear()}`;
    } else if (fechaRaw) {
        // Por si la celda vino como texto
        fechaFormateada = fechaRaw.toString();
    }

    tex += `\\date{${escaparLatex(fechaFormateada)}}\n`;
    tex += `\\institucion{${escaparLatex(datosDoc['Institucion'])}}\n`;
    tex += `\\unidad{${escaparLatex(datosDoc['Unidad'])}}\n`;
    tex += `\\setDocumentoCorto{${escaparLatex((datosDoc['DocumentoCorto'] || '').toString().trim())}}\n`;
    tex += `\\palabrasclave{${escaparLatex((datosDoc['PalabrasClave'] || '').toString().trim())}}\n`;
    tex += `\\version{${escaparLatex((datosDoc['Version'] || '').toString().trim())}}\n`;

    tex += `\n\\begin{document}\n\n`;

    // --- Portada ---
    tex += `\\portadafondo\n\n`;

    // --- Tabla de Contenidos ---
    tex += `\\tableofcontents\n\\newpage\n\n`;
    tex += `###LISTAS_PLACEHOLDER###`;

    // --- Resumen Ejecutivo ---
    if (datosDoc['ResumenEjecutivo']) {
        tex += `\\begin{resumenejecutivo}\n`;
        tex += `${escaparLatex(datosDoc['ResumenEjecutivo'])}\n`;
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
    let anexosIniciados = false;
    let contadorPortadas = 0;
    let contenidoDirectorio = '';
    let contenidoContraportada = '';

    secciones.forEach(seccion => {
        // 1. Manejo de Niveles de Título
        const nivel = seccion['Nivel'] ? seccion['Nivel'].toString().toLowerCase() : 'seccion';
        const titulo = escaparLatex(seccion['Titulo']);
        // 2. Procesamiento del Contenido (Listas y Bloques)
        const contenidoRaw = seccion['Contenido'] ? seccion['Contenido'].toString() : '';

        // Detectar inicio de Anexos
        if (nivel.includes('anexo') && !anexosIniciados) {
            tex += `\\appendix\n`;
            anexosIniciados = true;
        }

        // --- NIVELES ESPECIALES ---

        // A. Portada de Sección
        if (nivel === 'portada') {
            contadorPortadas++;
            tex += `\\portadaseccion{${contadorPortadas}}{${titulo}}{${escaparLatex(contenidoRaw)}}\n\n`;
            return;
        }

        // B. Directorio (Smart Formatting)
        if (nivel === 'directorio') {
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
            contenidoDirectorio = dirTex;
            return;
        }

        // C. Datos Finales (Contraportada)
        if (nivel.includes('datos finales') || nivel.includes('datosfinales') || nivel === 'contraportada') {
            const lines = contenidoRaw.split('\n');
            let contraTex = '';

            for (let i = 0; i < lines.length; i++) {
                const l = lines[i].trim();
                const esUltima = (i === lines.length - 1);
                const siguienteEsVacia = (i < lines.length - 1) && (lines[i + 1].trim() === '');

                if (l === '') {
                    // Línea vacía: agrega espacio vertical, salvo si es la última
                    if (!esUltima) {
                        contraTex += `\\\\[0.5cm]\n`;
                    }
                } else {
                    // Línea con texto
                    contraTex += escaparTextoConEtiquetas(l);

                    // Agregar salto de línea si NO es la última Y la siguiente NO es vacía
                    // (Si la siguiente es vacía, el salto lo pondrá la iteración de la línea vacía como \\[0.5cm])
                    if (!esUltima && !siguienteEsVacia) {
                        contraTex += `\\\\\n`;
                    }
                }
            }
            contenidoContraportada = contraTex;
            return;
        }

        if (nivel === 'subseccion' || nivel === 'subanexo') {
            tex += `\\subsection{${titulo}}\n\n`;
        } else if (
            nivel === 'subsubseccion' ||
            nivel === 'subsubsección' ||
            nivel.includes('subsub')
        ) {
            tex += `\\subsubsection{${titulo}}\n\n`;
        } else if (nivel.includes('parrafo') || nivel.includes('párrafo')) {
            tex += `\\paragraph{${titulo}}\n\n`;
        } else {
            // Default a sección principal (o Anexo nivel 1)
            tex += `\\section{${titulo}}\n\n`;
        }

        // Paso A: Detectar y procesar listas (bullets)
        const lineas = contenidoRaw.split('\n');
        let enLista = false;
        let contenidoProcesado = '';

        // Variables para bloques
        let enBloque = false;
        let tipoBloque = '';
        let tituloBloque = '';
        let contenidoBloque = '';

        lineas.forEach(linea => {
            const lineaTrim = linea.trim();

            // 1. Detectar INICIO de bloque
            const inicioBloqueMatch = lineaTrim.match(/^\[\[(ejemplo|caja|alerta|info|destacado)(?::\s*(.*))?\]\]$/i);
            if (inicioBloqueMatch) {
                if (enLista) { contenidoProcesado += '\\end{itemize}\n'; enLista = false; }

                enBloque = true;
                tipoBloque = inicioBloqueMatch[1].toLowerCase();
                tituloBloque = inicioBloqueMatch[2] || ''; // Título opcional
                return; // Saltamos a la siguiente línea
            }

            // 2. Detectar FIN de bloque
            const finBloqueMatch = lineaTrim.match(/^\[\[\/(ejemplo|caja|alerta|info|destacado)\]\]$/i);
            if (finBloqueMatch) {
                // Procesar el contenido acumulado del bloque (recursivamente para listas internas)
                let bloqueTex = '';

                // Procesar listas DENTRO del bloque
                const lineasBloque = contenidoBloque.split('\n');
                let enListaBloque = false;

                lineasBloque.forEach(lBloque => {
                    const esItem = lBloque.trim().match(/^[-*]\s+(.*)/);
                    if (esItem) {
                        if (!enListaBloque) { bloqueTex += '\\begin{itemize}\n'; enListaBloque = true; }
                        bloqueTex += `  \\item ${escaparTextoConEtiquetas(esItem[1])}\n`;
                    } else {
                        if (enListaBloque) { bloqueTex += '\\end{itemize}\n'; enListaBloque = false; }
                        bloqueTex += `${escaparTextoConEtiquetas(lBloque)}\n`;
                    }
                });
                if (enListaBloque) { bloqueTex += '\\end{itemize}\n'; }

                // Generar el entorno LaTeX según el tipo
                // Generar el entorno LaTeX según el tipo
                const tituloSafe = escaparLatex(tituloBloque);
                const opts = tituloSafe ? `[title={${tituloSafe}}]` : '';

                if (tipoBloque === 'ejemplo') {
                    contenidoProcesado += `\\begin{ejemplo}${opts}\n${bloqueTex}\\end{ejemplo}\n`;
                } else if (tipoBloque === 'caja' || tipoBloque === 'recuadro') {
                    contenidoProcesado += `\\begin{recuadro}${opts}\n${bloqueTex}\\end{recuadro}\n`;
                } else if (tipoBloque === 'alerta') {
                    contenidoProcesado += `\\begin{calloutWarning}${opts}\n${bloqueTex}\\end{calloutWarning}\n`;
                } else if (tipoBloque === 'info') {
                    contenidoProcesado += `\\begin{calloutTip}${opts}\n${bloqueTex}\\end{calloutTip}\n`;
                } else if (tipoBloque === 'destacado') {
                    contenidoProcesado += `\\begin{destacado}\n${bloqueTex}\\end{destacado}\n`;
                }

                // Resetear estado bloque
                enBloque = false;
                contenidoBloque = '';
                return;
            }

            // 3. Si estamos DENTRO de un bloque, acumulamos contenido
            if (enBloque) {
                contenidoBloque += linea + '\n';
                return;
            }

            // 4. Procesamiento normal (fuera de bloques)
            const esItemLista = lineaTrim.match(/^[-*]\s+(.*)/);

            if (esItemLista) {
                if (!enLista) {
                    contenidoProcesado += '\\begin{itemize}\n';
                    enLista = true;
                }
                contenidoProcesado += `  \\item ${escaparTextoConEtiquetas(esItemLista[1])}\n`;
            } else {
                if (enLista) {
                    contenidoProcesado += '\\end{itemize}\n';
                    enLista = false;
                }

                // Procesar Tablas y Figuras incrustadas
                // Procesar Tablas y Figuras incrustadas
                if (lineaTrim.startsWith('[[tabla:')) {
                    contenidoProcesado += `% TABLA OMITIDA TEMPORALMENTE: ${lineaTrim}\n`;
                } else if (lineaTrim.startsWith('[[figura:')) {
                    contenidoProcesado += `% FIGURA OMITIDA TEMPORALMENTE: ${lineaTrim}\n`;
                } else {
                    contenidoProcesado += `${escaparTextoConEtiquetas(linea)}\n`;
                }
            }
        });

        if (enLista) {
            contenidoProcesado += '\\end{itemize}\n';
        }

        tex += contenidoProcesado + '\n\n';
    });

    // --- Directorio y Contraportada (Al final) ---
    if (contenidoDirectorio) {
        tex += `\\paginacreditos{\n${contenidoDirectorio}\n}\n`;
    }

    // --- Bibliografía ---
    if (bibliografia.length > 0) {
        tex += `\\printbibliography\n\n`;
    }

    if (contenidoContraportada) {
        tex += `\\contraportada{\n${contenidoContraportada}\n}\n`;
    }

    tex += `\n\\end{document}\n`;

    // Reemplazar placeholder de listas
    let listasTex = '';
    if (hayTablasUsadas) {
        listasTex += `\\listatablas\n\\newpage\n\n`;
    }
    if (hayFigurasUsadas) {
        listasTex += `\\listafiguras\n\\newpage\n\n`;
    }
    tex = tex.replace('###LISTAS_PLACEHOLDER###', listasTex);

    // 4. Guardar archivo .tex en Drive
    try {
        const carpeta = DriveApp.getFolderById(CARPETA_SALIDA_ID);
        const nombreBase = datosDoc['DocumentoCorto'] || 'documento_generado';

        // Crear archivo .tex
        const archivosExistentes = carpeta.getFilesByName(nombreBase + '.tex');
        if (archivosExistentes.hasNext()) {
            archivosExistentes.next().setTrashed(true);
        }
        carpeta.createFile(nombreBase + '.tex', tex, MimeType.PLAIN_TEXT);

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

            const bibExistentes = carpeta.getFilesByName('referencias.bib');
            if (bibExistentes.hasNext()) {
                bibExistentes.next().setTrashed(true);
            }
            carpeta.createFile('referencias.bib', bibContent, MimeType.PLAIN_TEXT);
        }

        ui.alert(`¡Éxito! Archivos generados en la carpeta: ${carpeta.getName()}`);
    } catch (e) {
        ui.alert(`Error al guardar archivos: ${e.toString()}`);
        console.error(e);
    }
}

/**
 * Helper para leer todos los datos de una hoja y convertirlos en array de objetos
 */
function obtenerRegistros(ss, nombreHoja, docId) {
    const hoja = ss.getSheetByName(nombreHoja);
    if (!hoja) return [];

    const datos = hoja.getDataRange().getValues();
    const headers = datos[0];
    const registros = [];

    for (let i = 1; i < datos.length; i++) {
        const fila = datos[i];
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
 * Helper para obtener datos de una fila específica como objeto
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
 * Convierte un array 2D (de un rango) en un cuerpo de tabla LaTeX
 */
function procesarTablaArray(valores) {
    if (!valores || valores.length === 0) return '';

    const numCols = valores[0].length;
    let latexTabla = `  \\begin{tabular}{${'l'.repeat(numCols)}}\n`;
    latexTabla += `    \\toprule\n`;

    valores.forEach((fila, index) => {
        const celdas = fila.map(c => escaparLatex(c));
        latexTabla += `    ${celdas.join(' & ')} \\\\\n`;
        if (index === 0) latexTabla += `    \\midrule\n`;
    });

    latexTabla += `    \\bottomrule\n`;
    latexTabla += `  \\end{tabular}\n`;
    return latexTabla;
}

/**
 * Convierte un string CSV simple en un cuerpo de tabla LaTeX
 */
function procesarTablaCSV(csv) {
    const lineas = csv.trim().split('\n');
    if (lineas.length === 0) return '';

    const numCols = lineas[0].split(',').length;
    let latexTabla = `  \\begin{tabular}{${'l'.repeat(numCols)}}\n`;
    latexTabla += `    \\toprule\n`;

    lineas.forEach((linea, index) => {
        const celdas = linea.split(',').map(c => escaparLatex(c.trim()));
        latexTabla += `    ${celdas.join(' & ')} \\\\\n`;
        if (index === 0) latexTabla += `    \\midrule\n`;
    });

    latexTabla += `    \\bottomrule\n`;
    latexTabla += `  \\end{tabular}\n`;
    return latexTabla;
}

/**
 * Escapa texto LaTeX pero procesa etiquetas especiales [[...]]
 * Soporta: [[nota:]], [[cita:]], [[destacado:]], [[ecuacion:]], [[math:]], [[dorado:]], [[guinda:]]
 */
function escaparTextoConEtiquetas(texto) {
    if (!texto) return '';
    let str = texto.toString();

    // 1. Extraer Ecuaciones (Bloque e Inline) para NO escaparlas
    const ecuaciones = [];
    // [[ecuacion:...]] -> \begin{equation} ... \end{equation}
    str = str.replace(/\[\[ecuacion:([\s\S]*?)\]\]/g, function (match, contenido) {
        ecuaciones.push(`\\begin{equation}\n${contenido}\n\\end{equation}`);
        return `ZEQPLACEHOLDER${ecuaciones.length - 1}Z`;
    });
    // [[math:...]] -> $ ... $
    str = str.replace(/\[\[math:([\s\S]*?)\]\]/g, function (match, contenido) {
        ecuaciones.push(`$${contenido}$`);
        return `ZEQPLACEHOLDER${ecuaciones.length - 1}Z`;
    });

    // 2. Proteger etiquetas de texto (Notas, Citas, Destacado, Colores)
    // Usamos marcadores sin caracteres especiales (como # o _) que escaparLatex rompería

    // 2a. Extraer CITAS para NO escaparlas (las claves de cita no deben tener caracteres escapados)
    const citas = [];
    str = str.replace(/\[\[cita:([\s\S]*?)\]\]/g, function (match, contenido) {
        const clave = contenido.toString().trim(); // <<< aquí quitamos espacios
        citas.push(`\\cite{${clave}}`);
        return `ZCITEPOLDER${citas.length - 1}Z`;
    });

    str = str
        .replace(/\[\[nota:([\s\S]*?)\]\]/g, 'ZFOOTNOTESTARTZ$1ZFOOTNOTEENDZ')
        .replace(/\[\[destacado:([\s\S]*?)\]\]/g, 'ZDESTACADOSTARTZ$1ZDESTACADOENDZ')
        .replace(/\[\[dorado:([\s\S]*?)\]\]/g, 'ZGOLDSTARTZ$1ZGOLDENDZ')
        .replace(/\[\[guinda:([\s\S]*?)\]\]/g, 'ZGUINDASTARTZ$1ZGUINDAENDZ');

    // 3. Escapar LaTeX general
    str = escaparLatex(str);

    // 4. Restaurar etiquetas de texto
    str = str
        .replace(/ZFOOTNOTESTARTZ/g, '\\footnote{')
        .replace(/ZFOOTNOTEENDZ/g, '}')
        .replace(/ZDESTACADOSTARTZ/g, '\\begin{destacado}\n')
        .replace(/ZDESTACADOENDZ/g, '\n\\end{destacado}')
        .replace(/ZGOLDSTARTZ/g, '\\textbf{\\textcolor{gobmxDorado}{')
        .replace(/ZGOLDENDZ/g, '}}')
        .replace(/ZGUINDASTARTZ/g, '\\textbf{\\textcolor{gobmxGuinda}{')
        .replace(/ZGUINDAENDZ/g, '}}');

    // 4b. Restaurar Citas
    str = str.replace(/ZCITEPOLDER(\d+)Z/g, function (match, index) {
        return citas[parseInt(index)];
    });

    // 5. Restaurar Ecuaciones
    str = str.replace(/ZEQPLACEHOLDER(\d+)Z/g, function (match, index) {
        return ecuaciones[parseInt(index)];
    });

    return str;
}
