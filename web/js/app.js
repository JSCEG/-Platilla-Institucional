/**
 * SENER LaTeX Editor - Aplicación Principal
 */

// Estado global
const app = {
    documentos: [],
    documentoActual: null,
    loading: false
};

/**
 * Inicializar aplicación
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando SENER LaTeX Editor...');
    
    // Simular carga inicial
    await simulateLoading();
    
    // Ocultar preloader
    hidePreloader();
    
    // Cargar documentos
    await cargarDocumentos();
    
    // Event listeners
    setupEventListeners();
});

/**
 * Simular carga (para demo)
 */
function simulateLoading() {
    return new Promise(resolve => {
        setTimeout(resolve, 1500);
    });
}

/**
 * Ocultar preloader
 */
function hidePreloader() {
    const preloader = document.getElementById('preloader');
    preloader.classList.add('hidden');
    
    setTimeout(() => {
        preloader.style.display = 'none';
    }, 500);
}

/**
 * Cargar lista de documentos
 */
async function cargarDocumentos() {
    try {
        showLoading();
        
        // Intentar cargar desde Google Sheets público
        let documentos;
        
        try {
            documentos = await cargarHojaCSV('Documentos');
            console.log('📄 Documentos RAW desde Google Sheets:', documentos.length);
            console.log('Documentos:', documentos);
            
            // Filtrar documentos válidos
            documentos = documentos.filter(doc => {
                // Debe tener ID y Título
                return doc.ID && doc.ID.trim() !== '' && 
                       doc.Titulo && doc.Titulo.trim() !== '';
            });
            
            // Eliminar duplicados por ID
            const idsVistos = new Set();
            documentos = documentos.filter(doc => {
                if (idsVistos.has(doc.ID)) {
                    console.warn('⚠️ Documento duplicado ignorado:', doc.ID);
                    return false;
                }
                idsVistos.add(doc.ID);
                return true;
            });
            
            console.log('✅ Documentos válidos:', documentos.length);
            
        } catch (error) {
            console.warn('⚠️ No se pudo conectar con Google Sheets, usando datos de ejemplo');
            documentos = getDatosEjemplo();
        }
        
        app.documentos = documentos;
        renderDocumentos(documentos);
        
    } catch (error) {
        console.error('Error al cargar documentos:', error);
        mostrarError('No se pudieron cargar los documentos');
    } finally {
        hideLoading();
    }
}

/**
 * Renderizar lista de documentos
 */
function renderDocumentos(documentos) {
    const container = document.getElementById('documentos-lista');
    
    if (documentos.length === 0) {
        container.innerHTML = `
            <div class="text-center mt-4">
                <i class="fas fa-folder-open" style="font-size: 4rem; color: var(--color-gobmx-gris);"></i>
                <p class="mt-2" style="color: var(--color-text-secondary);">
                    No hay documentos disponibles. Crea uno nuevo para comenzar.
                </p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = documentos.map(doc => {
        // Extraer solo los primeros 150 caracteres del subtítulo si existe
        const subtitulo = doc.Subtitulo ? 
            (doc.Subtitulo.length > 150 ? doc.Subtitulo.substring(0, 150) + '...' : doc.Subtitulo) : 
            '';
        
        return `
            <div class="documento-card" data-id="${doc.ID}">
                <div class="documento-card-header">
                    <i class="fas fa-file-pdf documento-icon"></i>
                    <div class="documento-info">
                        <div class="documento-id">${doc.ID}</div>
                        <h3 class="documento-titulo">${doc.Titulo || 'Sin título'}</h3>
                        ${subtitulo ? `<p class="documento-subtitulo">${subtitulo}</p>` : ''}
                    </div>
                </div>
                
                <div class="documento-meta">
                    <div class="documento-meta-item">
                        <i class="fas fa-user"></i>
                        <span>${doc.Autor || 'Sin autor'}</span>
                    </div>
                    <div class="documento-meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${formatearFecha(doc.Fecha)}</span>
                    </div>
                    <div class="documento-meta-item">
                        <i class="fas fa-building"></i>
                        <span>${doc.Unidad || doc.Institucion || 'SENER'}</span>
                    </div>
                </div>
                
                <div class="documento-actions">
                    <button class="btn btn-primary btn-small" onclick="editarDocumento('${doc.ID}')">
                        <i class="fas fa-edit"></i>
                        Editar
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="verPreview('${doc.ID}')">
                        <i class="fas fa-eye"></i>
                        Preview
                    </button>
                    <button class="btn btn-outline btn-small" onclick="generarTex('${doc.ID}')">
                        <i class="fas fa-file-code"></i>
                        Generar .tex
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Editar documento
 */
function editarDocumento(docId) {
    console.log('Editando documento:', docId);
    window.location.href = `editor.html?id=${docId}`;
}

/**
 * Ver preview
 */
function verPreview(docId) {
    console.log('Ver preview:', docId);
    // Aquí se mostraría un modal con el preview
    alert('Función de preview en desarrollo');
}

/**
 * Generar .tex
 */
async function generarTex(docId) {
    try {
        showLoading('Generando archivo .tex...');
        
        // En producción, llamaría a la API
        // const resultado = await api.generarTex(docId);
        
        // Simular generación
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        mostrarExito('Archivo .tex generado correctamente');
        
    } catch (error) {
        console.error('Error al generar .tex:', error);
        mostrarError('No se pudo generar el archivo .tex');
    } finally {
        hideLoading();
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Botón nuevo documento
    document.getElementById('btn-nuevo-documento')?.addEventListener('click', () => {
        console.log('Crear nuevo documento');
        window.location.href = 'editor.html?nuevo=true';
    });
    
    // Botón ayuda
    document.getElementById('btn-ayuda')?.addEventListener('click', () => {
        window.open('https://github.com/tu-repo/docs', '_blank');
    });
}

/**
 * Utilidades
 */
function showLoading(mensaje = 'Cargando...') {
    // Implementar loading overlay
    console.log('Loading:', mensaje);
}

function hideLoading() {
    // Ocultar loading overlay
    console.log('Loading hidden');
}

function mostrarExito(mensaje) {
    alert('✅ ' + mensaje);
}

function mostrarError(mensaje) {
    alert('❌ ' + mensaje);
}

function formatearFecha(fecha) {
    if (!fecha) return 'Sin fecha';
    if (typeof fecha === 'string') return fecha;
    
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    return `${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
}

/**
 * Datos de ejemplo (para demo)
 */
function getDatosEjemplo() {
    return [
        {
            ID: 'D01',
            Titulo: 'Informe de Energía 2025',
            Subtitulo: 'Análisis del sector energético mexicano',
            Autor: 'Secretaría de Energía',
            Fecha: new Date(2025, 11, 8),
            UltimaModificacion: 'Hace 2 horas',
            PortadaRuta: 'img/portada.png',
            ContraportadaRuta: 'img/contraportada.png'
        },
        {
            ID: 'D02',
            Titulo: 'Reporte de Energías Renovables',
            Subtitulo: 'Avances y perspectivas 2025',
            Autor: 'Dirección General de Energías Limpias',
            Fecha: new Date(2025, 10, 15),
            UltimaModificacion: 'Hace 3 días'
        },
        {
            ID: 'D03',
            Titulo: 'Balance Nacional de Energía',
            Subtitulo: 'Datos preliminares 2024',
            Autor: 'Subsecretaría de Planeación',
            Fecha: new Date(2025, 9, 20),
            UltimaModificacion: 'Hace 1 semana'
        }
    ];
}
