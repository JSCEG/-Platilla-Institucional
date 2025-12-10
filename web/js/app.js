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
        showLoading('Cargando documentos...');
        
        // Intentar cargar desde Google Sheets público
        let documentos = [];
        
        try {
            // Solo intentar cargar si estamos en un entorno que lo permita
            if (typeof cargarHojaCSV === 'function') {
                documentos = await cargarHojaCSV('Documentos');
                console.log('📄 Documentos RAW desde Google Sheets:', documentos.length);
                
                // Filtrar documentos válidos
                documentos = documentos.filter(doc => {
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
                
                console.log('✅ Documentos válidos desde Google Sheets:', documentos.length);
            }
            
        } catch (error) {
            console.warn('⚠️ No se pudo conectar con Google Sheets:', error.message);
            documentos = [];
        }
        
        // Si no hay documentos de Google Sheets, usar datos de ejemplo
        if (documentos.length === 0) {
            console.log('📋 Usando datos de ejemplo');
            documentos = getDatosEjemplo();
            
            // Mostrar notificación informativa
            if (typeof showInfo === 'function') {
                showInfo('Modo demo: Mostrando documentos de ejemplo');
            }
        }
        
        app.documentos = documentos;
        renderDocumentos(documentos);
        
    } catch (error) {
        console.error('❌ Error crítico al cargar documentos:', error);
        
        // Como último recurso, usar datos de ejemplo
        app.documentos = getDatosEjemplo();
        renderDocumentos(app.documentos);
        
        if (typeof showError === 'function') {
            showError('Error al cargar documentos. Mostrando datos de ejemplo.');
        }
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
    try {
        console.log('📝 Editando documento:', docId);
        
        // Verificar que el documento existe
        const documento = app.documentos.find(doc => doc.ID === docId);
        if (!documento) {
            mostrarError('Documento no encontrado');
            return;
        }
        
        // Mostrar loading
        showLoading('Cargando editor...');
        
        // Navegar al editor
        window.location.href = `editor.html?id=${encodeURIComponent(docId)}`;
        
    } catch (error) {
        console.error('❌ Error al abrir editor:', error);
        mostrarError('No se pudo abrir el editor');
        hideLoading();
    }
}

/**
 * Ver preview
 */
function verPreview(docId) {
    try {
        console.log('👁️ Ver preview:', docId);
        
        // Buscar el documento
        const documento = app.documentos.find(doc => doc.ID === docId);
        if (!documento) {
            mostrarError('Documento no encontrado');
            return;
        }
        
        // Crear modal de preview
        const modalHtml = `
            <div class="modal fade" id="preview-modal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-eye me-2"></i>
                                Vista Previa - ${documento.Titulo}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-8">
                                    <h6 class="text-primary mb-3">
                                        <i class="fas fa-file-alt me-1"></i>
                                        ${documento.Titulo}
                                    </h6>
                                    ${documento.Subtitulo ? `<p class="text-muted mb-3">${documento.Subtitulo}</p>` : ''}
                                    
                                    <div class="preview-content bg-light p-3 rounded">
                                        <p><strong>Documento ID:</strong> ${documento.ID}</p>
                                        <p><strong>Autor:</strong> ${documento.Autor || 'No especificado'}</p>
                                        <p><strong>Fecha:</strong> ${formatearFecha(documento.Fecha)}</p>
                                        <p><strong>Institución:</strong> ${documento.Institucion || documento.Unidad || 'SENER'}</p>
                                        
                                        <hr>
                                        <h6>Contenido del documento:</h6>
                                        <p class="text-muted">
                                            Este documento contiene información del sector energético mexicano.
                                            Para ver el contenido completo, abra el editor.
                                        </p>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="text-center">
                                        <div class="bg-secondary rounded p-4 mb-3" style="height: 200px; display: flex; align-items: center; justify-content: center;">
                                            <div class="text-white">
                                                <i class="fas fa-file-pdf" style="font-size: 3rem;"></i>
                                                <p class="mt-2 mb-0">Vista previa</p>
                                                <small>PDF no disponible</small>
                                            </div>
                                        </div>
                                        <small class="text-muted">
                                            La vista previa completa estará disponible después de generar el PDF
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times me-1"></i>
                                Cerrar
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="generarTex('${docId}'); bootstrap.Modal.getInstance(document.getElementById('preview-modal')).hide();">
                                <i class="fas fa-file-code me-1"></i>
                                Generar .tex
                            </button>
                            <button type="button" class="btn btn-primary" onclick="editarDocumento('${docId}'); bootstrap.Modal.getInstance(document.getElementById('preview-modal')).hide();">
                                <i class="fas fa-edit me-1"></i>
                                Editar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remover modal anterior si existe
        const existingModal = document.getElementById('preview-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Agregar nuevo modal
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('preview-modal'));
        modal.show();
        
        // Limpiar modal al cerrar
        document.getElementById('preview-modal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
        
    } catch (error) {
        console.error('❌ Error al mostrar preview:', error);
        mostrarError('No se pudo mostrar la vista previa');
    }
}

/**
 * Generar .tex
 */
async function generarTex(docId) {
    try {
        console.log('📄 Generando .tex para documento:', docId);
        
        // Verificar que el documento existe
        const documento = app.documentos.find(doc => doc.ID === docId);
        if (!documento) {
            mostrarError('Documento no encontrado');
            return;
        }
        
        showLoading('Generando archivo LaTeX...');
        
        // Intentar usar la API si está disponible
        if (typeof api !== 'undefined' && api.generarTex) {
            try {
                const resultado = await api.generarTex(docId);
                
                if (resultado.success) {
                    // Crear y descargar archivo
                    const blob = new Blob([resultado.contenido], { type: 'text/plain' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = resultado.nombreArchivo || `${docId}.tex`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    
                    mostrarExito('Archivo .tex generado y descargado');
                } else {
                    throw new Error(resultado.message || 'Error en la generación');
                }
            } catch (apiError) {
                console.warn('⚠️ API no disponible, usando generación simulada');
                await generarTexSimulado(documento);
            }
        } else {
            // Modo demo
            await generarTexSimulado(documento);
        }
        
    } catch (error) {
        console.error('❌ Error al generar .tex:', error);
        mostrarError('No se pudo generar el archivo .tex');
    } finally {
        hideLoading();
    }
}

/**
 * Generar .tex simulado para demo
 */
async function generarTexSimulado(documento) {
    // Simular tiempo de generación
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Crear contenido LaTeX básico
    const contenidoTex = `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[spanish]{babel}
\\usepackage{graphicx}
\\usepackage{geometry}

\\title{${documento.Titulo || 'Documento SENER'}}
\\author{${documento.Autor || 'Secretaría de Energía'}}
\\date{${formatearFecha(documento.Fecha)}}

\\begin{document}

\\maketitle

\\section{Introducción}
${documento.Subtitulo ? documento.Subtitulo : 'Contenido del documento generado automáticamente.'}

\\section{Desarrollo}
Este documento fue generado automáticamente por el Editor LaTeX de SENER.

\\section{Conclusiones}
Documento generado en modo demo.

\\end{document}`;

    // Crear y descargar archivo
    const blob = new Blob([contenidoTex], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documento.ID || 'documento'}.tex`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    mostrarExito('Archivo .tex generado (modo demo)');
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
    const loadingDiv = document.getElementById('loading-documentos');
    if (loadingDiv) {
        loadingDiv.classList.remove('d-none');
        const textElement = loadingDiv.querySelector('p');
        if (textElement) {
            textElement.textContent = mensaje;
        }
    }
    console.log('Loading:', mensaje);
}

function hideLoading() {
    const loadingDiv = document.getElementById('loading-documentos');
    if (loadingDiv) {
        loadingDiv.classList.add('d-none');
    }
    console.log('Loading hidden');
}

function mostrarExito(mensaje) {
    if (typeof showSuccess === 'function') {
        showSuccess(mensaje);
    } else {
        alert('✅ ' + mensaje);
    }
}

function mostrarError(mensaje) {
    if (typeof showError === 'function') {
        showError(mensaje);
    } else {
        alert('❌ ' + mensaje);
    }
}

function formatearFecha(fecha) {
    if (!fecha) return 'Sin fecha';
    if (typeof fecha === 'string') return fecha;
    
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    return `${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
}

/**
 * Datos de ejemplo (para demo) - IDs que coinciden con Google Sheets
 */
function getDatosEjemplo() {
    return [
        {
            ID: 'D01',
            Titulo: 'Informe Institucional de Energía 2025',
            Subtitulo: 'Avances, retos y Dirección General',
            Autor: 'Secretaría de Energía',
            Institucion: 'Secretaría de Energía',
            Unidad: 'Unidad de Planeación Energética',
            Fecha: new Date(2025, 11, 8),
            UltimaModificacion: 'Hace 2 horas',
            DocumentoCorto: 'InformeEnergia25',
            Version: '1.0',
            PalabrasClave: 'energía, transición energética',
            ResumenEjecutivo: 'Este informe también presenta capacidad renovable en img/figura_gráficos.png/contraportada.png',
            PortadaRuta: 'img/portada.png',
            ContraportadaRuta: 'img/contraportada.png'
        },
        {
            ID: 'D02',
            Titulo: 'Reporte de Energías Renovables',
            Subtitulo: 'Avances y perspectivas 2025',
            Autor: 'Dirección General de Energías Limpias',
            Institucion: 'SENER',
            Unidad: 'Dirección General de Energías Limpias',
            Fecha: new Date(2025, 10, 15),
            UltimaModificacion: 'Hace 3 días',
            DocumentoCorto: 'ReporteRenovables2025',
            Version: '1.0'
        },
        {
            ID: 'D03',
            Titulo: 'Balance Nacional de Energía',
            Subtitulo: 'Datos preliminares 2024',
            Autor: 'Subsecretaría de Planeación',
            Institucion: 'SENER',
            Unidad: 'Dirección General de Planeación Energética',
            Fecha: new Date(2025, 9, 20),
            UltimaModificacion: 'Hace 1 semana',
            DocumentoCorto: 'BalanceEnergia2024',
            Version: '1.0'
        },
        {
            ID: 'D04',
            Titulo: 'Estrategia de Transición Energética',
            Subtitulo: 'Hoja de ruta hacia 2050',
            Autor: 'Comité de Transición Energética',
            Institucion: 'SENER',
            Unidad: 'Subsecretaría de Planeación',
            Fecha: new Date(2025, 8, 10),
            UltimaModificacion: 'Hace 2 semanas',
            DocumentoCorto: 'EstrategiaTransicion2050',
            Version: '1.0'
        },
        {
            ID: 'D05',
            Titulo: 'Diagnóstico del Sector Petrolero',
            Subtitulo: 'Análisis de producción y refinación',
            Autor: 'Dirección de Hidrocarburos',
            Institucion: 'SENER',
            Unidad: 'Dirección de Estudios Petroleros',
            Fecha: new Date(2025, 7, 25),
            UltimaModificacion: 'Hace 3 semanas',
            DocumentoCorto: 'DiagnosticoPetrolero2025',
            Version: '1.0'
        }
    ];
}
