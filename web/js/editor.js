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
    
    // Si es nuevo documento, generar ID
    const esNuevo = urlParams.get('nuevo') === 'true';
    if (esNuevo) {
        editor.docId = 'SENER-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-3);
        console.log('📝 Creando nuevo documento con ID:', editor.docId);
    }

    if (!editor.docId) {
        mostrarError('No se especificó un documento válido');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }

    try {
        // Cargar documento
        await cargarDocumento();

        // Ocultar preloader
        hidePreloader();

        // Verificar elementos críticos antes de configurar
        verificarElementosEditor();
        
        // Setup event listeners con manejo de errores
        try {
            console.log('🔧 Iniciando configuración de event listeners...');
            setupEditorEventListeners();
            console.log('✅ Event listeners configurados exitosamente');
        } catch (error) {
            console.error('❌ Error al configurar event listeners:', error);
            mostrarError('Error al configurar la navegación de tabs');
        }

        // Iniciar autoguardado
        try {
            iniciarAutoguardado();
            console.log('✅ Autoguardado iniciado');
        } catch (error) {
            console.error('❌ Error al iniciar autoguardado:', error);
        }
        
        console.log('✅ Editor inicializado correctamente');
        
    } catch (error) {
        console.error('❌ Error al inicializar editor:', error);
        mostrarError('Error al inicializar el editor');
        
        // Redirigir al index después de un momento
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }
});

/**
 * Cargar documento desde Google Sheets público o datos de ejemplo
 */
async function cargarDocumento() {
    try {
        showLoading('Cargando documento...');

        let documento = null;

        // Intentar cargar desde Google Sheets si está disponible
        try {
            if (typeof cargarTodosDatos === 'function') {
                console.log('📥 Intentando cargar desde Google Sheets...');
                const datos = await cargarTodosDatos();
                
                console.log('📊 Datos recibidos:', {
                    documentos: datos.documentos?.length || 0,
                    secciones: datos.secciones?.length || 0,
                    figuras: datos.figuras?.length || 0
                });

                const normalizeId = (val) => (val || '').toString().trim().toUpperCase();
                const getDocId = (item = {}) => {
                    // Prefer campos conocidos
                    const direct = item.DocumentoID || item.DocumentoId || item.Documento || item.DocID;
                    if (direct) return normalizeId(direct);

                    // Buscar cualquier key que contenga "doc" e "id" (por si el header viene con espacios)
                    const key = Object.keys(item).find(k => {
                        const nk = k.toLowerCase().replace(/[^a-z0-9]/g, '');
                        return nk.includes('doc') && nk.includes('id');
                    });
                    if (key) return normalizeId(item[key]);

                    return '';
                };
                const targetId = normalizeId(editor.docId);

                // Buscar el documento por ID (tolerando espacios/casos)
                const docMetadata = datos.documentos?.find(doc => {
                    return normalizeId(doc.ID) === targetId || getDocId(doc) === targetId;
                });
                
                if (docMetadata) {
                    // Filtrar secciones, tablas y figuras de este documento (tolerando variantes de campo)
                    const matchDoc = (item) => getDocId(item) === targetId;

                    documento = {
                        metadata: docMetadata,
                        secciones: (datos.secciones || []).filter(matchDoc),
                        tablas: (datos.tablas || []).filter(matchDoc),
                        figuras: (datos.figuras || []).filter(matchDoc),
                        bibliografia: (datos.bibliografia || []).filter(matchDoc),
                        siglas: (datos.siglas || []).filter(matchDoc),
                        glosario: (datos.glosario || []).filter(matchDoc)
                    };
                    console.log('✅ Documento encontrado en Google Sheets:', docMetadata.Titulo);
                } else {
                    console.warn(`⚠️ Documento con ID "${editor.docId}" no encontrado en Google Sheets`);
                    console.log('📋 IDs disponibles:', datos.documentos?.map(d => d.ID) || []);
                }
            } else {
                console.warn('⚠️ Función cargarTodosDatos no disponible');
            }
        } catch (error) {
            console.warn('⚠️ Error al cargar desde Google Sheets:', error.message);
            console.error('Stack trace:', error);
        }

        // Si no se pudo cargar desde Google Sheets, usar datos de ejemplo
        if (!documento) {
            console.log('📋 Documento no encontrado en Google Sheets, usando datos de ejemplo');
            documento = crearDocumentoEjemplo(editor.docId);
            
            // Mostrar notificación más específica
            mostrarNotificacion(`Documento "${editor.docId}" no encontrado. Mostrando plantilla de ejemplo.`, 'warning');
        }

        editor.documento = documento;

        // Renderizar datos
        renderMetadatos(documento.metadata);
        renderSecciones(documento.secciones);
        renderTablas(documento.tablas);
        renderFiguras(documento.figuras);
        renderBibliografia(documento.bibliografia);
        renderSiglas(documento.siglas);
        renderGlosario(documento.glosario);

        // Actualizar título del header
        document.getElementById('documento-titulo').textContent =
            documento.metadata.Titulo || 'Sin título';

        console.log('📄 Documento cargado exitosamente:', documento);

    } catch (error) {
        console.error('❌ Error crítico al cargar documento:', error);
        
        // Como último recurso, crear documento básico
        const documentoBasico = crearDocumentoBasico(editor.docId);
        editor.documento = documentoBasico;
        
        renderMetadatos(documentoBasico.metadata);
        renderSecciones(documentoBasico.secciones);
        renderTablas(documentoBasico.tablas);
        renderFiguras(documentoBasico.figuras);
        renderBibliografia(documentoBasico.bibliografia);
        renderSiglas(documentoBasico.siglas);
        renderGlosario(documentoBasico.glosario);
        
        document.getElementById('documento-titulo').textContent = documentoBasico.metadata.Titulo;
        
        mostrarError('Error al cargar documento. Mostrando plantilla básica.');
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
            input.addEventListener('blur', function () {
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
 * Renderizar figuras - Compatible con nueva tabla responsiva
 */
function renderFiguras(figuras) {
    // Buscar elementos de la nueva estructura
    const tbody = document.getElementById('figuras-tbody');
    const emptyState = document.getElementById('figuras-empty-state');
    const tableContainer = document.querySelector('.figuras-table-container');
    
    // Si no encuentra los elementos nuevos, usar fallback
    if (!tbody) {
        console.warn('⚠️ Elemento figuras-tbody no encontrado, usando renderizado básico');
        return;
    }

    if (!figuras || figuras.length === 0) {
        // Mostrar estado vacío
        if (emptyState) {
            emptyState.classList.remove('d-none');
        }
        if (tableContainer) {
            tableContainer.classList.add('d-none');
        }
        tbody.innerHTML = '';
        return;
    }

    // Ocultar estado vacío y mostrar tabla
    if (emptyState) {
        emptyState.classList.add('d-none');
    }
    if (tableContainer) {
        tableContainer.classList.remove('d-none');
    }

    // Renderizar filas de la tabla
    tbody.innerHTML = figuras.map(figura => {
        const seccion = figura.SeccionOrden || '1';
        const orden = figura.OrdenFigura || '1';
        const titulo = figura.Caption || figura.Titulo || 'Sin título';
        const ruta = figura.RutaArchivo || figura.Ruta || 'No especificado';
        const fuente = figura.Fuente || 'No especificado';
        
        return `
            <tr>
                <td class="text-center">
                    <span class="badge bg-primary">
                        <i class="fas fa-image me-1"></i>
                        ${seccion}.${orden}
                    </span>
                </td>
                <td>
                    <div class="editable-cell" data-field="titulo" data-id="${seccion}-${orden}">
                        <span class="cell-content">
                            <i class="fas fa-file-alt me-2 text-muted" style="font-size: 0.8rem;"></i>
                            ${titulo}
                        </span>
                    </div>
                </td>
                <td>
                    <div class="editable-cell" data-field="ruta" data-id="${seccion}-${orden}">
                        <span class="cell-content">
                            <i class="fas fa-folder me-1 text-info"></i>
                            <code class="text-muted">${ruta}</code>
                        </span>
                    </div>
                </td>
                <td class="col-fuente">
                    <div class="editable-cell" data-field="fuente" data-id="${seccion}-${orden}">
                        <span class="cell-content">
                            <i class="fas fa-quote-left me-1 text-success" style="font-size: 0.7rem;"></i>
                            ${fuente}
                        </span>
                    </div>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-table-action btn-edit" onclick="editarFigura('${seccion}-${orden}')" 
                                data-bs-toggle="tooltip" title="Editar figura completa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-table-action btn-delete" onclick="eliminarFigura('${seccion}-${orden}')"
                                data-bs-toggle="tooltip" title="Eliminar figura">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                        <button class="btn-table-action" onclick="previewFigura('${seccion}-${orden}')"
                                data-bs-toggle="tooltip" title="Vista previa">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // Inicializar tooltips si Bootstrap está disponible
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = tbody.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltipTriggerList.forEach(tooltipTriggerEl => {
            new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
}

/**
 * Renderizar bibliografía (Vista Tabla)
 */
function renderBibliografia(bibliografia) {
    const container = document.getElementById('bibliografia-lista');
    const tbody = container.querySelector('tbody');

    if (!bibliografia || bibliografia.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <i class="fas fa-book" style="font-size: 2rem;"></i>
                    <p>No hay referencias. Agrega una nueva para comenzar.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = bibliografia.map(item => `
        <tr>
            <td><strong>${item.Clave}</strong></td>
            <td>${item.Tipo || 'misc'}</td>
            <td>${item.Anio || 's/f'}</td>
            <td>
                <strong>${item.Autor || 'Autor desconocido'}</strong>. 
                <em>${item.Titulo || 'Sin título'}</em>.
                ${item.Editorial ? item.Editorial : ''}
            </td>
            <td class="col-actions">
                <button class="btn-icon" onclick="editarBibliografia('${item.Clave}')" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" onclick="eliminarBibliografia('${item.Clave}')" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Renderizar siglas (Vista Tabla)
 */
function renderSiglas(siglas) {
    const container = document.getElementById('siglas-lista');
    const tbody = container.querySelector('tbody');

    if (!siglas || siglas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="empty-state">
                    <i class="fas fa-font" style="font-size: 2rem;"></i>
                    <p>No hay siglas. Agrega una nueva para comenzar.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = siglas.map(item => `
        <tr>
            <td><strong>${item.Sigla}</strong></td>
            <td>${item.Descripcion || ''}</td>
            <td class="col-actions">
                <button class="btn-icon" onclick="editarSigla('${item.Sigla}')" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" onclick="eliminarSigla('${item.Sigla}')" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Renderizar glosario (Vista Tabla)
 */
function renderGlosario(glosario) {
    const container = document.getElementById('glosario-lista');
    const tbody = container.querySelector('tbody');

    if (!glosario || glosario.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="empty-state">
                    <i class="fas fa-spell-check" style="font-size: 2rem;"></i>
                    <p>No hay términos en el glosario.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = glosario.map(item => `
        <tr>
            <td><strong>${item.Termino}</strong></td>
            <td>${item.Definicion || ''}</td>
            <td class="col-actions">
                <button class="btn-icon" onclick="editarGlosario('${item.Termino}')" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" onclick="eliminarGlosario('${item.Termino}')" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Verificar que los elementos críticos del editor existan
 */
function verificarElementosEditor() {
    console.log('🔍 Verificando elementos del editor...');
    
    const elementosCriticos = [
        'documento-titulo',
        'btn-guardar',
        'btn-generar',
        'tab-metadatos',
        'tab-secciones',
        'tab-tablas',
        'tab-figuras',
        'tab-bibliografia',
        'tab-siglas',
        'tab-glosario'
    ];
    
    const tabs = [
        'metadatos',
        'secciones',
        'tablas',
        'figuras',
        'bibliografia',
        'siglas',
        'glosario'
    ];
    
    let errores = [];
    
    // Verificar elementos por ID
    elementosCriticos.forEach(id => {
        const elemento = document.getElementById(id);
        if (!elemento) {
            errores.push(`Elemento faltante: ${id}`);
        } else {
            console.log(`✅ ${id}: encontrado`);
        }
    });
    
    // Verificar tabs
    tabs.forEach(tabName => {
        const tabButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (!tabButton) {
            errores.push(`Tab button faltante: ${tabName}`);
        } else {
            console.log(`✅ Tab ${tabName}: encontrado`);
        }
    });
    
    if (errores.length > 0) {
        console.error('❌ Elementos faltantes:', errores);
        mostrarError(`Elementos faltantes en el editor: ${errores.length} problemas encontrados`);
    } else {
        console.log('✅ Todos los elementos críticos encontrados');
    }
    
    return errores.length === 0;
}

/**
 * Setup event listeners
 */
function setupEditorEventListeners() {
    console.log('🔧 Configurando event listeners...');
    
    // Tabs - con verificación robusta
    const tabs = document.querySelectorAll('.editor-tab');
    console.log(`📋 Encontrados ${tabs.length} tabs`);
    
    tabs.forEach((tab, index) => {
        const tabName = tab.dataset.tab;
        console.log(`🏷️ Configurando tab ${index + 1}: ${tabName}`);
        
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            console.log(`🖱️ Click en tab: ${tabName}`);
            switchTab(tabName);
        });
    });

    // Botón guardar
    const btnGuardar = document.getElementById('btn-guardar');
    if (btnGuardar) {
        btnGuardar.addEventListener('click', guardarCambios);
        console.log('✅ Botón guardar configurado');
    }

    // Botón generar .tex
    const btnGenerar = document.getElementById('btn-generar');
    if (btnGenerar) {
        btnGenerar.addEventListener('click', generarTex);
        console.log('✅ Botón generar configurado');
    }

    // Detectar cambios en formularios
    const formControls = document.querySelectorAll('.form-control');
    console.log(`📝 Configurando ${formControls.length} form controls`);
    
    formControls.forEach(input => {
        input.addEventListener('input', () => {
            editor.cambiosPendientes = true;
        });
    });

    // Botones de nueva entidad
    const btnNuevaSeccion = document.getElementById('btn-nueva-seccion');
    if (btnNuevaSeccion) {
        btnNuevaSeccion.addEventListener('click', () => {
            mostrarNotificacion('Función en desarrollo: Nueva Sección', 'info');
        });
    }

    const btnNuevaTabla = document.getElementById('btn-nueva-tabla');
    if (btnNuevaTabla) {
        btnNuevaTabla.addEventListener('click', () => {
            mostrarNotificacion('Función en desarrollo: Nueva Tabla', 'info');
        });
    }

    const btnNuevaFigura = document.getElementById('btn-nueva-figura');
    if (btnNuevaFigura) {
        btnNuevaFigura.addEventListener('click', () => {
            mostrarNotificacion('Función en desarrollo: Nueva Figura', 'info');
        });
    }

    const btnNuevaBibliografia = document.getElementById('btn-nueva-bibliografia');
    if (btnNuevaBibliografia) {
        btnNuevaBibliografia.addEventListener('click', () => {
            mostrarNotificacion('Función en desarrollo: Nueva Bibliografía', 'info');
        });
    }
    
    console.log('✅ Event listeners configurados correctamente');
}

/**
 * Cambiar de tab
 */
function switchTab(tabName) {
    try {
        console.log(`🔄 Cambiando a tab: ${tabName}`);
        
        // Verificar que el tab existe
        const targetTab = document.querySelector(`[data-tab="${tabName}"]`);
        const targetContent = document.getElementById(`tab-${tabName}`);
        
        if (!targetTab) {
            console.error(`❌ Tab no encontrado: ${tabName}`);
            mostrarError(`Tab "${tabName}" no encontrado`);
            return;
        }
        
        if (!targetContent) {
            console.error(`❌ Contenido de tab no encontrado: tab-${tabName}`);
            mostrarError(`Contenido del tab "${tabName}" no encontrado`);
            return;
        }

        // Remover clase active de todos los tabs
        document.querySelectorAll('.editor-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Agregar clase active al tab seleccionado
        targetTab.classList.add('active');
        console.log(`✅ Tab activado: ${tabName}`);

        // Remover clase active de todo el contenido
        document.querySelectorAll('.editor-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Agregar clase active al contenido seleccionado
        targetContent.classList.add('active');
        console.log(`✅ Contenido activado: tab-${tabName}`);
        
        // Trigger refresh de componentes específicos si es necesario
        if (tabName === 'figuras' && typeof initFigurasTable === 'function') {
            // Re-inicializar tabla de figuras si existe
            setTimeout(() => {
                try {
                    initFigurasTable();
                } catch (error) {
                    console.warn('⚠️ Error al re-inicializar tabla de figuras:', error);
                }
            }, 100);
        }
        
        console.log(`🎯 Tab switch completado: ${tabName}`);
        
    } catch (error) {
        console.error('❌ Error en switchTab:', error);
        mostrarError(`Error al cambiar de tab: ${error.message}`);
    }
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
        
        // Buscar y eliminar la figura del array
        if (editor.documento && editor.documento.figuras) {
            const [seccion, orden] = id.split('-');
            editor.documento.figuras = editor.documento.figuras.filter(f => 
                !(f.SeccionOrden === seccion && f.OrdenFigura === orden)
            );
            
            // Re-renderizar
            renderFiguras(editor.documento.figuras);
            editor.cambiosPendientes = true;
            
            mostrarExito('Figura eliminada correctamente');
        }
    }
}

/**
 * Vista previa de figura
 */
function previewFigura(id) {
    console.log('Vista previa figura:', id);
    
    if (!editor.documento || !editor.documento.figuras) {
        mostrarError('No hay datos de figuras disponibles');
        return;
    }
    
    const [seccion, orden] = id.split('-');
    const figura = editor.documento.figuras.find(f => 
        f.SeccionOrden === seccion && f.OrdenFigura === orden
    );
    
    if (!figura) {
        mostrarError('Figura no encontrada');
        return;
    }
    
    const titulo = figura.Caption || figura.Titulo || 'Sin título';
    const ruta = figura.RutaArchivo || figura.Ruta || '';
    const fuente = figura.Fuente || 'No especificado';
    
    // Crear modal de vista previa
    const modalHtml = `
        <div class="modal fade" id="preview-figura-modal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-eye me-2"></i>
                            Vista Previa - Figura ${seccion}.${orden}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <div class="mb-3">
                            <img src="../${ruta}" alt="${titulo}" 
                                 class="img-fluid rounded shadow" 
                                 style="max-height: 400px;"
                                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBubyBlbmNvbnRyYWRhPC90ZXh0Pjwvc3ZnPg=='">
                        </div>
                        <h6 class="text-primary">${titulo}</h6>
                        <p class="text-muted mb-1">
                            <i class="fas fa-folder me-1"></i>
                            <code>${ruta}</code>
                        </p>
                        <p class="text-muted">
                            <i class="fas fa-quote-left me-1"></i>
                            <em>Fuente: ${fuente}</em>
                        </p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-1"></i>
                            Cerrar
                        </button>
                        <button type="button" class="btn btn-primary" onclick="editarFigura('${id}'); bootstrap.Modal.getInstance(document.getElementById('preview-figura-modal')).hide();">
                            <i class="fas fa-edit me-1"></i>
                            Editar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remover modal anterior si existe
    const existingModal = document.getElementById('preview-figura-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Agregar nuevo modal
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Mostrar modal
    if (typeof bootstrap !== 'undefined') {
        const modal = new bootstrap.Modal(document.getElementById('preview-figura-modal'));
        modal.show();
        
        // Limpiar modal al cerrar
        document.getElementById('preview-figura-modal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    } else {
        // Fallback sin Bootstrap
        alert(`Figura ${seccion}.${orden}: ${titulo}\nRuta: ${ruta}\nFuente: ${fuente}`);
    }
}


// ==========================================
// Módulos de Edición (Bibliografía, Siglas, Glosario)
// ==========================================

// --- UTILIDADES MODAL ---
function abrirModal(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex'); // Asumiendo que usamos flex para centrar
    }
}

function cerrarModal(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// Cerrar modal al hacer clic fuera
window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.add('hidden');
        event.target.classList.remove('flex');
    }
}


// --- BIBLIOGRAFÍA ---

function editarBibliografia(clave) {
    const item = editor.documento.bibliografia.find(b => b.Clave === clave);
    if (!item) return;

    // Poblar formulario
    document.getElementById('bib-clave').value = item.Clave || '';
    document.getElementById('bib-tipo').value = item.Tipo || 'misc';
    document.getElementById('bib-titulo').value = item.Titulo || '';
    document.getElementById('bib-autor').value = item.Autor || '';
    document.getElementById('bib-anio').value = item.Anio || '';
    document.getElementById('bib-editorial').value = item.Editorial || '';
    document.getElementById('bib-url').value = item.Url || '';

    abrirModal('modal-bibliografia');
}

function guardarModalBibliografia() {
    const clave = document.getElementById('bib-clave').value;

    // Buscar índice
    const index = editor.documento.bibliografia.findIndex(b => b.Clave === clave);
    if (index === -1) return; // O manejar creación nueva si fuera el caso

    // Actualizar objeto
    editor.documento.bibliografia[index] = {
        ...editor.documento.bibliografia[index],
        Tipo: document.getElementById('bib-tipo').value,
        Titulo: document.getElementById('bib-titulo').value,
        Autor: document.getElementById('bib-autor').value,
        Anio: document.getElementById('bib-anio').value,
        Editorial: document.getElementById('bib-editorial').value,
        Url: document.getElementById('bib-url').value
    };

    editor.cambiosPendientes = true;
    renderBibliografia(editor.documento.bibliografia);
    cerrarModal('modal-bibliografia');
    mostrarExito('Referencia actualizada localmente');
}

function eliminarBibliografia(clave) {
    if (confirm(`¿Estás seguro de eliminar la referencia "${clave}"?`)) {
        editor.documento.bibliografia = editor.documento.bibliografia.filter(b => b.Clave !== clave);
        editor.cambiosPendientes = true;
        renderBibliografia(editor.documento.bibliografia);
    }
}


// --- SIGLAS ---

function editarSigla(siglaId) {
    const item = editor.documento.siglas.find(s => s.Sigla === siglaId);
    if (!item) return;

    // Guardar el ID original para poder actualizar después
    document.getElementById('sigla-id').value = item.Sigla || '';
    document.getElementById('sigla-id').readOnly = false; // Permitir editar el nombre
    document.getElementById('sigla-id').dataset.originalId = item.Sigla; // Guardar ID original
    document.getElementById('sigla-descripcion').value = item.Descripcion || '';

    // Marcar como modo edición
    document.getElementById('modal-siglas').dataset.mode = 'edit';
    document.querySelector('#modal-siglas .modal-title').textContent = 'Editar Sigla';

    abrirModal('modal-siglas');
}

function nuevaSigla() {
    // Limpiar formulario
    document.getElementById('sigla-id').value = '';
    document.getElementById('sigla-id').readOnly = false; // Permitir editar ID en modo creación
    document.getElementById('sigla-descripcion').value = '';

    // Marcar como modo creación
    document.getElementById('modal-siglas').dataset.mode = 'create';
    document.querySelector('#modal-siglas .modal-title').textContent = 'Nueva Sigla';

    abrirModal('modal-siglas');
}

async function guardarModalSiglas() {
    const id = document.getElementById('sigla-id').value.trim();
    const descripcion = document.getElementById('sigla-descripcion').value.trim();
    const mode = document.getElementById('modal-siglas').dataset.mode || 'edit';

    if (!id) {
        mostrarError('La sigla no puede estar vacía');
        return;
    }

    try {
        showLoading(mode === 'create' ? 'Creando sigla...' : 'Guardando cambios...');

        let resultado;

        if (mode === 'create') {
            // Crear nueva sigla
            resultado = await api.crearSigla(editor.docId, id, descripcion);

            if (resultado.status === 'success') {
                // Agregar localmente
                editor.documento.siglas.push({
                    DocumentoID: editor.docId,
                    Sigla: id,
                    Descripcion: descripcion
                });

                renderSiglas(editor.documento.siglas);
                cerrarModal('modal-siglas');
                mostrarExito('✅ Sigla creada correctamente');
            } else {
                throw new Error(resultado.message || 'Error al crear sigla');
            }
        } else {
            // Actualizar sigla existente
            const originalId = document.getElementById('sigla-id').dataset.originalId || id;
            const index = editor.documento.siglas.findIndex(s => s.Sigla === originalId);

            if (index === -1) {
                throw new Error('Sigla no encontrada');
            }

            // Si el nombre cambió, necesitamos eliminar la vieja y crear una nueva
            if (originalId !== id) {
                // Eliminar la vieja
                await api.eliminarSigla(editor.docId, originalId);
                // Crear la nueva
                resultado = await api.crearSigla(editor.docId, id, descripcion);

                if (resultado.status === 'success') {
                    // Actualizar localmente
                    editor.documento.siglas[index] = {
                        DocumentoID: editor.docId,
                        Sigla: id,
                        Descripcion: descripcion
                    };
                    renderSiglas(editor.documento.siglas);
                    cerrarModal('modal-siglas');
                    mostrarExito('✅ Sigla actualizada correctamente');
                } else {
                    throw new Error(resultado.message || 'Error al actualizar sigla');
                }
            } else {
                // Solo actualizar descripción
                resultado = await api.guardarSigla(editor.docId, id, descripcion);

                if (resultado.status === 'success') {
                    editor.documento.siglas[index].Descripcion = descripcion;
                    renderSiglas(editor.documento.siglas);
                    cerrarModal('modal-siglas');
                    mostrarExito('✅ Sigla actualizada correctamente');
                } else {
                    throw new Error(resultado.message || 'Error al actualizar sigla');
                }
            }
        }

    } catch (error) {
        console.error('Error al guardar sigla:', error);
        mostrarError('❌ Error: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function eliminarSigla(id) {
    // Configurar modal de confirmación
    document.getElementById('confirmar-mensaje').textContent =
        `¿Estás seguro de eliminar la sigla "${id}"? Esta acción no se puede deshacer.`;

    // Configurar el botón de confirmar
    const btnConfirmar = document.getElementById('btn-confirmar-accion');

    // Limpiar listeners anteriores clonando el botón
    const nuevoBtn = btnConfirmar.cloneNode(true);
    btnConfirmar.parentNode.replaceChild(nuevoBtn, btnConfirmar);

    // Agregar nuevo listener
    nuevoBtn.addEventListener('click', async () => {
        cerrarModal('modal-confirmar');

        try {
            showLoading('Eliminando sigla...');

            const resultado = await api.eliminarSigla(editor.docId, id);

            if (resultado.status === 'success') {
                // Eliminar localmente
                editor.documento.siglas = editor.documento.siglas.filter(s => s.Sigla !== id);
                renderSiglas(editor.documento.siglas);
                mostrarExito('✅ Sigla eliminada correctamente');
            } else {
                throw new Error(resultado.message || 'Error al eliminar sigla');
            }

        } catch (error) {
            console.error('Error al eliminar sigla:', error);
            mostrarError('❌ Error: ' + error.message);
        } finally {
            hideLoading();
        }
    });

    // Abrir modal de confirmación
    abrirModal('modal-confirmar');
}


// --- GLOSARIO ---

function editarGlosario(termino) {
    const item = editor.documento.glosario.find(g => g.Termino === termino);
    if (!item) return;

    document.getElementById('glosario-termino').value = item.Termino || '';
    document.getElementById('glosario-termino').readOnly = true;
    document.getElementById('glosario-definicion').value = item.Definicion || '';

    abrirModal('modal-glosario');
}

function guardarModalGlosario() {
    const termino = document.getElementById('glosario-termino').value;
    const index = editor.documento.glosario.findIndex(g => g.Termino === termino);

    if (index === -1) return;

    editor.documento.glosario[index] = {
        ...editor.documento.glosario[index],
        Definicion: document.getElementById('glosario-definicion').value
    };

    editor.cambiosPendientes = true;
    renderGlosario(editor.documento.glosario);
    cerrarModal('modal-glosario');
    mostrarExito('Término actualizado localmente');
}

function eliminarGlosario(termino) {
    if (confirm(`¿Eliminar término "${termino}"?`)) {
        editor.documento.glosario = editor.documento.glosario.filter(g => g.Termino !== termino);
        editor.cambiosPendientes = true;
        renderGlosario(editor.documento.glosario);
    }
}

/**
 * Utilidades
 */
function hidePreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('hidden');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }
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
            background: rgba(0,0,0,0.7);
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
    // Intentar usar el sistema de toasts de Bootstrap si está disponible
    if (typeof showSuccess === 'function' && tipo === 'success') {
        showSuccess(mensaje);
        return;
    }
    if (typeof showError === 'function' && tipo === 'error') {
        showError(mensaje);
        return;
    }
    if (typeof showInfo === 'function' && (tipo === 'info' || tipo === 'warning')) {
        showInfo(mensaje);
        return;
    }

    // Fallback: crear notificación personalizada
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
    if (tipo === 'warning') {
        notif.style.color = '#000';
    }

    // Icono según tipo
    const iconos = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };

    notif.innerHTML = `${iconos[tipo] || ''} ${mensaje}`;

    document.body.appendChild(notif);

    // Auto-cerrar después de 4 segundos (más tiempo para warnings)
    const duracion = tipo === 'warning' ? 5000 : 3000;
    setTimeout(() => {
        notif.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, duracion);
}

// Agregar estilos de animación
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Event listener para botón Nueva Sigla
const btnNuevaSigla = document.getElementById('btn-nueva-sigla');
if (btnNuevaSigla) {
    btnNuevaSigla.addEventListener('click', nuevaSigla);
}

/**
 * Crear documento de ejemplo basado en ID
 */
function crearDocumentoEjemplo(docId) {
    // Datos base según el ID (coinciden con Google Sheets)
    const ejemplos = {
        'D01': {
            metadata: {
                ID: 'D01',
                Titulo: 'Informe Institucional de Energía 2025',
                Subtitulo: 'Avances, retos y Dirección General',
                Autor: 'Secretaría de Energía',
                Institucion: 'Secretaría de Energía',
                Unidad: 'Unidad de Planeación Energética',
                Fecha: '2025-12-08',
                DocumentoCorto: 'InformeEnergia25',
                Version: '1.0',
                PalabrasClave: 'energía, transición energética',
                PortadaRuta: 'img/portada.png',
                ContraportadaRuta: 'img/contraportada.png',
                ResumenEjecutivo: 'Este informe también presenta capacidad renovable en el sector energético mexicano...'
            }
        },
        'D02': {
            metadata: {
                ID: 'D02',
                Titulo: 'Reporte de Energías Renovables',
                Subtitulo: 'Avances y perspectivas 2025',
                Autor: 'Dirección General de Energías Limpias',
                Institucion: 'SENER',
                Unidad: 'Dirección General de Energías Limpias',
                Fecha: '2025-11-15',
                DocumentoCorto: 'ReporteRenovables2025',
                Version: '1.0',
                PalabrasClave: 'energías renovables, solar, eólica',
                ResumenEjecutivo: 'Reporte sobre los avances en energías renovables en México...'
            }
        },
        'D03': {
            metadata: {
                ID: 'D03',
                Titulo: 'Balance Nacional de Energía',
                Subtitulo: 'Datos preliminares 2024',
                Autor: 'Subsecretaría de Planeación',
                Institucion: 'SENER',
                Unidad: 'Dirección General de Planeación Energética',
                Fecha: '2025-10-20',
                DocumentoCorto: 'BalanceEnergia2024',
                Version: '1.0',
                ResumenEjecutivo: 'Balance energético nacional con datos preliminares...'
            }
        }
    };

    // Usar ejemplo específico o crear uno genérico
    const ejemplo = ejemplos[docId] || {
        metadata: {
            ID: docId,
            Titulo: `Documento ${docId}`,
            Subtitulo: 'Documento de ejemplo generado automáticamente',
            Autor: 'Secretaría de Energía',
            Institucion: 'SENER',
            Fecha: new Date().toISOString().split('T')[0],
            DocumentoCorto: docId.toLowerCase().replace(/[^a-z0-9]/g, '_'),
            Version: '1.0',
            ResumenEjecutivo: 'Este es un documento de ejemplo creado automáticamente.'
        }
    };

    return {
        metadata: ejemplo.metadata,
        secciones: [
            {
                DocumentoID: docId,
                Orden: '1',
                Titulo: 'Introducción',
                Nivel: 'Sección',
                Contenido: 'Contenido de introducción...'
            },
            {
                DocumentoID: docId,
                Orden: '2',
                Titulo: 'Desarrollo',
                Nivel: 'Sección',
                Contenido: 'Contenido de desarrollo...'
            }
        ],
        tablas: [],
        figuras: [
            {
                DocumentoID: docId,
                SeccionOrden: '2',
                OrdenFigura: '1',
                Caption: 'Figura de ejemplo',
                RutaArchivo: 'img/graficos/ejemplo.png',
                Fuente: 'SENER, 2025'
            }
        ],
        bibliografia: [
            {
                DocumentoID: docId,
                Clave: 'SENER2025',
                Tipo: 'report',
                Titulo: 'Informe Energético Nacional',
                Autor: 'SENER',
                Anio: '2025',
                Editorial: 'Secretaría de Energía'
            }
        ],
        siglas: [
            {
                DocumentoID: docId,
                Sigla: 'SENER',
                Descripcion: 'Secretaría de Energía'
            },
            {
                DocumentoID: docId,
                Sigla: 'CFE',
                Descripcion: 'Comisión Federal de Electricidad'
            }
        ],
        glosario: [
            {
                DocumentoID: docId,
                Termino: 'Energía renovable',
                Definicion: 'Energía obtenida de fuentes naturales virtualmente inagotables'
            }
        ]
    };
}

/**
 * Crear documento básico para casos de emergencia
 */
function crearDocumentoBasico(docId) {
    return {
        metadata: {
            ID: docId,
            Titulo: 'Nuevo Documento',
            Subtitulo: '',
            Autor: 'Usuario',
            Institucion: 'SENER',
            Fecha: new Date().toISOString().split('T')[0],
            DocumentoCorto: 'nuevo_documento',
            Version: '1.0',
            ResumenEjecutivo: ''
        },
        secciones: [],
        tablas: [],
        figuras: [],
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
