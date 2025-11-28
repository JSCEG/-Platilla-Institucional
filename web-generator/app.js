// Configuración
let config = {
    sheetId: localStorage.getItem('sheetId') || '',
    apiKey: localStorage.getItem('apiKey') || '',
    templateUrl: 'https://raw.githubusercontent.com/JSCEG/-Platilla-Institucional/main/sener2025.cls'
};

// Guardar configuración
function guardarConfig() {
    config.sheetId = document.getElementById('sheetId').value;
    config.apiKey = document.getElementById('apiKey').value;
    localStorage.setItem('sheetId', config.sheetId);
    localStorage.setItem('apiKey', config.apiKey);
    alert('✅ Configuración guardada');
}

// Cargar documentos desde Google Sheets
async function cargarDocumentos() {
    if (!config.sheetId || !config.apiKey) {
        alert('⚠️ Por favor configura el ID del Sheet y la API Key primero');
        return;
    }

    try {
        const metadata = await leerHoja('Metadata');
        const lista = document.getElementById('documentos-lista');
        lista.innerHTML = `
            <div class="documento-card">
                <h3>${metadata.Título || 'Sin título'}</h3>
                <p><strong>Autor:</strong> ${metadata.Autor || 'N/A'}</p>
                <p><strong>Fecha:</strong> ${metadata.Fecha || 'N/A'}</p>
                <p><strong>Institución:</strong> ${metadata.Institución || 'N/A'}</p>
                <span class="badge badge-completo">Listo</span>
                <div style="margin-top: 15px;">
                    <button onclick="previsualizarDocumento()" class="btn-primary">👁️ Previsualizar</button>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al cargar documentos: ' + error.message);
    }
}

// Leer hoja de Google Sheets
async function leerHoja(nombreHoja) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${config.sheetId}/values/${nombreHoja}!A:Z?key=${config.apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('No se pudo leer la hoja. Verifica que el Sheet sea público.');
    }

    const data = await response.json();
    const rows = data.values;

    if (nombreHoja === 'Metadata') {
        const obj = {};
        rows.forEach(row => {
            if (row[0] && row[1]) {
                obj[row[0]] = row[1];
            }
        });
        return obj;
    }

    const headers = rows[0];
    return rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, i) => {
            obj[header] = row[i] || '';
        });
        return obj;
    });
}

// Previsualizar documento
async function previsualizarDocumento() {
    try {
        const latexCode = await generarLatexDesdeSheets();
        document.getElementById('preview').style.display = 'block';
        document.getElementById('preview-content').textContent = latexCode;
        document.getElementById('preview').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        alert('❌ Error al generar preview: ' + error.message);
    }
}

// Generar código LaTeX desde Google Sheets
async function generarLatexDesdeSheets() {
    const metadata = await leerHoja('Metadata');
    const secciones = await leerHoja('Secciones');
    const contenido = await leerHoja('Contenido');
    const tablas = await leerHoja('Tablas');

    let latex = '\\documentclass{sener2025}\n\n';
    latex += `\\title{${metadata.Título || ''}}\n`;
    latex += `\\author{${metadata.Autor || ''}}\n`;
    latex += `\\date{${metadata.Fecha || ''}}\n\n`;
    latex += '\\begin{document}\n\n';
    latex += '\\portadafondo\n\n';
    latex += '\\tableofcontents\n';
    latex += '\\clearpage\n\n';

    for (const seccion of secciones) {
        if (seccion.TienePortada === 'SI') {
            latex += `\\portadaseccion{${seccion.Número}}{${seccion.Título}}{${seccion.Subtítulo || ''}}\n\n`;
        }

        latex += `\\section{${seccion.Título}}\n\n`;

        const contenidoSeccion = contenido.filter(c => c.Sección === seccion.Número);
        for (const item of contenidoSeccion) {
            if (item.Tipo === 'parrafo') {
                latex += `${item.Contenido}\n\n`;
            } else if (item.Tipo === 'subseccion') {
                latex += `\\subsection{${item.Contenido}}\n\n`;
            }
        }

        const tablasSeccion = tablas.filter(t => t.Sección === seccion.Número);
        for (const tabla of tablasSeccion) {
            latex += await generarTablaLatex(tabla);
        }
    }

    latex += '\\end{document}';
    return latex;
}

// Generar código LaTeX para una tabla
async function generarTablaLatex(tabla) {
    const datos = await leerHoja(`Tabla_${tabla.ID}_Datos`);
    if (!datos || datos.length === 0) return '';

    const headers = Object.keys(datos[0]);
    const estilo = tabla.Estilo || 'guinda';

    let latex = `\\begin{tabla${estilo}}\n`;
    latex += `  \\caption{${tabla.Caption}}\n`;
    latex += `  \\begin{tabular}{${'l'.repeat(headers.length)}}\n`;
    latex += '    \\toprule\n';

    headers.forEach((h, i) => {
        latex += h;
        if (i < headers.length - 1) latex += ' & ';
    });
    latex += ' \\\\\n    \\midrule\n';

    datos.forEach(row => {
        headers.forEach((h, i) => {
            latex += row[h];
            if (i < headers.length - 1) latex += ' & ';
        });
        latex += ' \\\\\n';
    });

    latex += '    \\bottomrule\n';
    latex += '  \\end{tabular}\n';
    latex += `\\end{tabla${estilo}}\n\n`;

    return latex;
}

// Descargar código LaTeX
async function descargarLatex() {
    try {
        const latexCode = await generarLatexDesdeSheets();
        const blob = new Blob([latexCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'documento.tex';
        a.click();
    } catch (error) {
        alert('❌ Error: ' + error.message);
    }
}

// Generar PDF
async function generarPDF() {
    alert('⚠️ La generación de PDF requiere un servidor. Por ahora, descarga el código LaTeX y compílalo localmente.');
}

// Verificar versión del template
async function verificarTemplateVersion() {
    try {
        const response = await fetch(config.templateUrl);
        const content = await response.text();
        const match = content.match(/% Version: (.+)/);
        const version = match ? match[1] : 'Última versión de GitHub';
        document.getElementById('template-version').textContent = version;
    } catch (error) {
        document.getElementById('template-version').textContent = 'Error al verificar';
    }
}

// Actualizar template
async function actualizarTemplate() {
    await verificarTemplateVersion();
    alert('✅ Template actualizado desde GitHub');
}

// Mostrar/ocultar ayuda
function mostrarAyuda() {
    document.getElementById('modal-ayuda').style.display = 'flex';
}

function cerrarAyuda() {
    document.getElementById('modal-ayuda').style.display = 'none';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('sheetId').value = config.sheetId;
    document.getElementById('apiKey').value = config.apiKey;
    verificarTemplateVersion();

    document.getElementById('btnGuardar').addEventListener('click', guardarConfig);
    document.getElementById('btnCargar').addEventListener('click', cargarDocumentos);
    document.getElementById('btnGenerarPDF').addEventListener('click', generarPDF);
    document.getElementById('btnDescargarLatex').addEventListener('click', descargarLatex);
    document.getElementById('btnActualizarTemplate').addEventListener('click', actualizarTemplate);
    document.getElementById('btnAyuda').addEventListener('click', (e) => {
        e.preventDefault();
        mostrarAyuda();
    });
    document.getElementById('btnCerrarAyuda').addEventListener('click', cerrarAyuda);
});

// Hacer funciones globales
window.previsualizarDocumento = previsualizarDocumento;
