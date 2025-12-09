/**
 * SENER LaTeX Editor - Editor de Documento
 */

// Estado del editor
const editor = {
    docId: null,
    documento: null,
    cambiosPendientes: false,
    autoguardadoInterval: null
};

/**
 * Inicializar editor
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando Editor...');
    
    // Obtener ID del documento desde URL
    const urlParams = new URLSearchParams(window.location.search);
    editor.docId = urlParams.get('id');
    
    if (!editor.docId) {
        alert('❌ No se especificó un documento');
        window.location.href = 'index.html';
        return;
    }
    
    // Cargar documento
    await cargarDocumento();
    
    // Ocultar preloader
    hidePreloader();
    
    // Setup event listeners
    setupEventListeners();
    
    // Iniciar autoguardado
    iniciarAutoguardado();
});

/**
 * Cargar documento desde Google Sheets público
 */
async function cargarDocumento() {
    try {
        showLoading('Cargando documento desde Google Sheets...');
        
        // Cargar todos los datos del Google Sheets público
        const datos = await cargarTodosDatos();
        
        // Buscar el documento por ID
        const docMetadata = datos.documentos.find(doc => doc.ID === editor.docId);
        
        if (!docMetadata) {
            throw new Error(`No se encontró el documento con ID: ${editor.docId}`);
        }
        
        // Filtrar secciones, tablas y figuras de este documento
        const documento = {
            metadata: docMetadata,
            secciones: datos.secciones.filter(s => s.DocumentoID === editor.docId),
            tablas: datos.tablas.filter(t => t.DocumentoID === editor.docId),
            figuras: datos.figuras.filter(f => f.DocumentoID === editor.docId),
            bibliografia: datos.bibliografia.filter(b => b.DocumentoID === editor.docId),
            siglas: datos.siglas.filter(s => s.DocumentoID === editor.docId),
            glosario: datos.glosario.filter(g => g.DocumentoID === editor.docId)
        };
        
        console.log('✅ Documento cargado:', documento);
        
        editor.documento = documento;
        
        // Renderizar datos
        renderMetadatos(documento.metadata);
        renderSecciones(documento.secciones);
        renderTablas(documento.tablas);
        renderFiguras(documento.figuras);
        
        // Actualizar título del header
        document.getElementById('documento-titulo').textContent = 
            documento.metadata.Titulo || 'Sin título';
        
        console.log('📄 Documento cargado:', documento);
        
    } catch (error) {
        console.error('Error al cargar documento:', error);
        alert('❌ No se pudo cargar el documento');
        window.location.href = 'index.html';
    } finally {
        hideLoading();
    }
}

/**
 * Renderizar metadatos en el formulario
 */
function renderMetadatos(metadata) {
    console.log('📋 Renderizando metadatos:', metadata);
    
    document.getElementById('input-id').value = metadata.ID || '';
    document.getElementById('input-titulo').value = metadata.Titulo || '';
    document.getElementById('input-subtitulo').value = metadata.Subtitulo || '';
    document.getElementById('input-autor').value = metadata.Autor || '';
    
    // Fecha - manejar diferentes formatos
    if (metadata.Fecha) {
        try {
            let fechaISO;
            if (metadata.Fecha instanceof Date) {
                fechaISO = metadata.Fecha.toISOString().split('T')[0];
            } else if (typeof metadata.Fecha === 'string') {
                // Intentar parsear la fecha
                const fecha = new Date(metadata.Fecha);
                if (!isNaN(fecha.getTime())) {
                    fechaISO = fecha.toISOString().split('T')[0];
                }
            }
            if (fechaISO) {
                document.getElementById('input-fecha').value = fechaISO;
            }
        } catch (error) {
            console.warn('Error al parsear fecha:', error);
        }
    }
    
    document.getElementById('input-institucion').value = metadata.Institucion || '';
    document.getElementById('input-unidad').value = metadata.Unidad || '';
    document.getElementById('input-documento-corto').value = metadata.DocumentoCorto || '';
    document.getElementById('input-version').value = metadata.Version || '';
    document.getElementById('input-palabras-clave').value = metadata.PalabrasClave || '';
    document.getElementById('input-portada-ruta').value = metadata.PortadaRuta || '';
    document.getElementById('input-contraportada-ruta').value = metadata.ContraportadaRuta || '';
    document.getElementById('input-resumen').value = metadata.ResumenEjecutivo || '';
    document.getElementById('input-datos-clave').value = metadata.DatosClave || '';
    
    // Marcar campos requeridos visualmente
    marcarCamposRequeridos();
}

/**
 * Marcar campos requeridos visualmente
 */
function marcarCamposRequeridos() {
    const camposRequeridos = ['input-titulo', 'input-autor'];
    
    camposRequeridos.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('blur', function() {
                if (!this.value.trim()) {
                    this.style.borderColor = '#dc3545';
                } else {
                    this.style.borderColor = '';
                }
            });
        }
    });
}

/**
 * Renderizar secciones
 */
function renderSecciones(secciones) {
    const container = document.getElementById('secciones-lista');
    
    if (!secciones || secciones.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-list"></i>
                <p>No hay secciones. Crea una nueva para comenzar.</p>
            </div>
        `;
        return;
    }
    
    // Ordenar por orden
    secciones.sort((a, b) => parseFloat(a.Orden) - parseFloat(b.Orden));
    
    container.innerHTML = secciones.map(seccion => {
        const nivelClass = getNivelClass(seccion.Nivel);
        return `
            <div class="seccion-item ${nivelClass}" data-orden="${seccion.Orden}">
                <div class="seccion-header">
                    <div class="seccion-info">
                        <div class="seccion-orden">${seccion.Orden}</div>
                        <h4 class="seccion-titulo">${seccion.Titulo}</h4>
                        <div class="seccion-nivel">${seccion.Nivel}</div>
                    </div>
                    <div class="seccion-actions">
                        <button class="btn-icon" onclick="editarSeccion('${seccion.Orden}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" onclick="eliminarSeccion('${seccion.Orden}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Obtener clase CSS según nivel de sección
 */
function getNivelClass(nivel) {
    const nivelLower = (nivel || '').toLowerCase();
    if (nivelLower.includes('subsub')) return 'nivel-subsubseccion';
    if (nivelLower.includes('sub')) return 'nivel-subseccion';
    return 'nivel-seccion';
}

/**
 * Renderizar tablas
 */
function renderTablas(tablas) {
    const container = document.getElementById('tablas-lista');
    
    if (!tablas || tablas.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-table"></i>
                <p>No hay tablas. Crea una nueva para comenzar.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = tablas.map(tabla => `
        <div class="item-card">
            <div class="item-card-header">
                <h4 class="item-card-title">${tabla.Titulo}</h4>
                <div class="item-card-actions">
                    <button class="btn-icon" onclick="editarTabla('${tabla.SeccionOrden}-${tabla.OrdenTabla}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="eliminarTabla('${tabla.SeccionOrden}-${tabla.OrdenTabla}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="item-card-meta">
                Sección: ${tabla.SeccionOrden} | Orden: ${tabla.OrdenTabla}
            </div>
            <div class="item-card-meta">
                Datos: ${tabla.DatosCSV || 'No especificado'}
            </div>
        </div>
    `).join('');
}

/**
 * Renderizar figuras
 */
function renderFiguras(figuras) {
    const container = document.getElementById('figuras-lista');
    
    if (!figuras || figuras.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-image"></i>
                <p>No hay figuras. Agrega una nueva para comenzar.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = figuras.map(figura => `
        <div class="item-card">
            <div class="item-card-header">
                <h4 class="item-card-title">${figura.Caption}</h4>
                <div class="item-card-actions">
                    <button class="btn-icon" onclick="editarFigura('${figura.SeccionOrden}-${figura.OrdenFigura}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="eliminarFigura('${figura.SeccionOrden}-${figura.OrdenFigura}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="item-card-meta">
                Sección: ${figura.SeccionOrden} | Orden: ${figura.OrdenFigura}
            </div>
            <div class="item-card-meta">
                Archivo: ${figura.RutaArchivo || 'No especificado'}
            </div>
        </div>
    `).join('');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Tabs
    document.querySelectorAll('.editor-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchTab(tabName);
        });
    });
    
    // Botón guardar
    document.getElementById('btn-guardar').addEventListener('click', guardarCambios);
    
    // Botón generar .tex
    document.getElementById('btn-generar').addEventListener('click', generarTex);
    
    // Detectar cambios en formularios
    document.querySelectorAll('.form-control').forEach(input => {
        input.addEventListener('input', () => {
            editor.cambiosPendientes = true;
        });
    });
    
    // Botones de nueva entidad
    document.getElementById('btn-nueva-seccion')?.addEventListener('click', () => {
        alert('Función en desarrollo: Nueva Sección');
    });
    
    document.getElementById('btn-nueva-tabla')?.addEventListener('click', () => {
        alert('Función en desarrollo: Nueva Tabla');
    });
    
    document.getElementById('btn-nueva-figura')?.addEventListener('click', () => {
        alert('Función en desarrollo: Nueva Figura');
    });
}

/**
 * Cambiar de tab
 */
function switchTab(tabName) {
    // Actualizar tabs
    document.querySelectorAll('.editor-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Actualizar contenido
    document.querySelectorAll('.editor-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

/**
 * Guardar cambios
 */
async function guardarCambios() {
    try {
        showLoading('Guardando cambios...');
        
        // Validar campos requeridos
        const titulo = document.getElementById('input-titulo').value.trim();
        const autor = document.getElementById('input-autor').value.trim();
        
        if (!titulo) {
            mostrarError('El título es obligatorio');
            hideLoading();
            return;
        }
        
        if (!autor) {
            mostrarError('El autor es obligatorio');
            hideLoading();
            return;
        }
        
        // Recopilar datos del formulario
        const metadata = {
            ID: document.getElementById('input-id').value,
            Titulo: titulo,
            Subtitulo: document.getElementById('input-subtitulo').value.trim(),
            Autor: autor,
            Fecha: document.getElementById('input-fecha').value,
            Institucion: document.getElementById('input-institucion').value.trim(),
            Unidad: document.getElementById('input-unidad').value.trim(),
            DocumentoCorto: document.getElementById('input-documento-corto').value.trim(),
            Version: document.getElementById('input-version').value.trim(),
            PalabrasClave: document.getElementById('input-palabras-clave').value.trim(),
            PortadaRuta: document.getElementById('input-portada-ruta').value.trim(),
            ContraportadaRuta: document.getElementById('input-contraportada-ruta').value.trim(),
            ResumenEjecutivo: document.getElementById('input-resumen').value.trim(),
            DatosClave: document.getElementById('input-datos-clave').value.trim()
        };
        
        console.log('📝 Guardando metadatos:', metadata);
        
        // Por ahora solo guardamos localmente (sin backend)
        editor.documento.metadata = metadata;
        editor.cambiosPendientes = false;
        
        mostrarExito('✅ Cambios guardados localmente. Nota: Para guardar en Google Sheets necesitas configurar el backend.');
        
        // TODO: Cuando tengas backend, descomentar esto:
        // const resultado = await api.guardarDocumento(editor.docId, { metadata });
        // if (resultado.success) {
        //     editor.cambiosPendientes = false;
        //     mostrarExito('Cambios guardados correctamente');
        // } else {
        //     throw new Error(resultado.message || 'Error al guardar');
        // }
        
    } catch (error) {
        console.error('Error al guardar:', error);
        mostrarError('No se pudieron guardar los cambios: ' + error.message);
    } finally {
        hideLoading();
    }
}

/**
 * Generar .tex
 */
async function generarTex() {
    try {
        showLoading('Generando archivo .tex...');
        
        // Llamar a la API
        const resultado = await api.generarTex(editor.docId);
        
        if (resultado.success) {
            // Descargar el archivo
            descargarArchivo(resultado.contenido, resultado.nombreArchivo);
            mostrarExito('Archivo .tex generado correctamente');
        } else {
            throw new Error(resultado.message || 'Error al generar');
        }
        
    } catch (error) {
        console.error('Error al generar .tex:', error);
        mostrarError('No se pudo generar el archivo .tex: ' + error.message);
    } finally {
        hideLoading();
    }
}

/**
 * Descargar archivo de texto
 */
function descargarArchivo(contenido, nombreArchivo) {
    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Iniciar autoguardado
 */
function iniciarAutoguardado() {
    editor.autoguardadoInterval = setInterval(() => {
        if (editor.cambiosPendientes) {
            console.log('💾 Autoguardando...');
            guardarCambios();
        }
    }, 30000); // Cada 30 segundos
}

/**
 * Funciones de edición (placeholder)
 */
function editarSeccion(orden) {
    console.log('Editar sección:', orden);
    alert('Función en desarrollo: Editar Sección');
}

function eliminarSeccion(orden) {
    if (confirm('¿Estás seguro de eliminar esta sección?')) {
        console.log('Eliminar sección:', orden);
        alert('Función en desarrollo: Eliminar Sección');
    }
}

function editarTabla(id) {
    console.log('Editar tabla:', id);
    alert('Función en desarrollo: Editar Tabla');
}

function eliminarTabla(id) {
    if (confirm('¿Estás seguro de eliminar esta tabla?')) {
        console.log('Eliminar tabla:', id);
        alert('Función en desarrollo: Eliminar Tabla');
    }
}

function editarFigura(id) {
    console.log('Editar figura:', id);
    alert('Función en desarrollo: Editar Figura');
}

function eliminarFigura(id) {
    if (confirm('¿Estás seguro de eliminar esta figura?')) {
        console.log('Eliminar figura:', id);
        alert('Función en desarrollo: Eliminar Figura');
    }
}

/**
 * Utilidades
 */
function hidePreloader() {
    const preloader = document.getElementById('preloader');
    preloader.classList.add('hidden');
    setTimeout(() => {
        preloader.style.display = 'none';
    }, 500);
}

function showLoading(mensaje = 'Cargando...') {
    console.log('⏳ Loading:', mensaje);
    
    // Crear overlay si no existe
    let overlay = document.getElementById('loading-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        
        overlay.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 10px; text-align: center;">
                <div class="spinner" style="margin: 0 auto 15px;"></div>
                <p style="margin: 0; color: #621132; font-weight: 600;">${mensaje}</p>
            </div>
        `;
        
        document.body.appendChild(overlay);
    } else {
        overlay.querySelector('p').textContent = mensaje;
        overlay.style.display = 'flex';
    }
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function mostrarExito(mensaje) {
    console.log('✅', mensaje);
    mostrarNotificacion(mensaje, 'success');
}

function mostrarError(mensaje) {
    console.error('❌', mensaje);
    mostrarNotificacion(mensaje, 'error');
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear notificación
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    // Colores según tipo
    const colores = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8',
        warning: '#ffc107'
    };
    
    notif.style.background = colores[tipo] || colores.info;
    
    // Icono según tipo
    const iconos = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };
    
    notif.innerHTML = `${iconos[tipo] || ''} ${mensaje}`;
    
    document.body.appendChild(notif);
    
    // Auto-cerrar después de 3 segundos
    setTimeout(() => {
        notif.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// Agregar estilos de animación
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Datos de ejemplo (para demo)
 */
function getDatosDocumentoEjemplo() {
    return {
        metadata: {
            ID: 'D01',
            Titulo: 'Informe de Energía 2025',
            Subtitulo: 'Análisis del sector energético mexicano',
            Autor: 'Secretaría de Energía',
            Fecha: new Date(2025, 11, 8),
            Institucion: 'Secretaría de Energía',
            Unidad: 'Unidad de Planeación Energética',
            DocumentoCorto: 'InformeEnergia25',
            Version: '1.0',
            PalabrasClave: 'energía, renovables, México, transición energética',
            PortadaRuta: 'img/portada.png',
            ContraportadaRuta: 'img/contraportada.png',
            ResumenEjecutivo: 'El sistema energético mexicano enfrenta un proceso de transformación profunda...',
            DatosClave: 'Incremento del 15% en capacidad renovable; Reducción de 10% en emisiones; Inversión de $50,000 MDP'
        },
        secciones: [
            {
                Orden: '1',
                Nivel: 'Seccion',
                Titulo: 'Contexto general del sistema energético mexicano',
                Contenido: 'El sistema energético mexicano...'
            },
            {
                Orden: '1.1',
                Nivel: 'Subseccion',
                Titulo: 'Evolución de la capacidad de generación eléctrica',
                Contenido: 'Durante el periodo 2020-2025...'
            },
            {
                Orden: '1.1.1',
                Nivel: 'Subsubseccion',
                Titulo: 'Integración de energías renovables',
                Contenido: 'La integración de fuentes renovables...'
            },
            {
                Orden: '2',
                Nivel: 'Seccion',
                Titulo: 'Análisis de resultados',
                Contenido: 'Los resultados obtenidos...'
            }
        ],
        tablas: [
            {
                SeccionOrden: '1',
                OrdenTabla: '1',
                Titulo: 'Capacidad instalada por tecnología',
                Fuente: 'Elaboración propia',
                DatosCSV: 'Datos_Tablas!A1:E5'
            },
            {
                SeccionOrden: '2',
                OrdenTabla: '1',
                Titulo: 'Consumo final de energía por sector',
                Fuente: 'SIE-SENER',
                DatosCSV: 'Datos_Tablas!A7:C13'
            }
        ],
        figuras: [
            {
                SeccionOrden: '1',
                OrdenFigura: '1',
                RutaArchivo: 'img/grafica1.png',
                Caption: 'Evolución de la capacidad instalada',
                Fuente: 'Elaboración propia'
            }
        ],
        bibliografia: [],
        siglas: [],
        glosario: []
    };
}

// Limpiar al salir
window.addEventListener('beforeunload', (e) => {
    if (editor.cambiosPendientes) {
        e.preventDefault();
        e.returnValue = '¿Estás seguro? Tienes cambios sin guardar.';
    }
    
    // Limpiar autoguardado
    if (editor.autoguardadoInterval) {
        clearInterval(editor.autoguardadoInterval);
    }
});
