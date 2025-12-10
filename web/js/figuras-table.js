/**
 * SENER LaTeX Editor - Tabla de Figuras Responsiva
 * Manejo de tabla editable con funcionalidades mobile-first
 */

// Estado de la tabla de figuras
const figurasTable = {
    data: [],
    editingCell: null,
    isMobile: false
};

/**
 * Inicializar tabla de figuras
 */
function initFigurasTable() {
    // Verificar que la API esté disponible ANTES de permitir cualquier operación
    if (!api || !api.urls || !api.urls.FIGURAS) {
        showApiError();
        return;
    }

    checkMobileView();
    setupFigurasTableListeners();

    // Si ya hay figuras cargadas desde el editor, usarlas (evita sobrescribir con los datos de demo)
    if (typeof editor !== 'undefined' && editor.documento?.figuras?.length) {
        figurasTable.data = editor.documento.figuras.map((figura, idx) => {
            const seccion = figura.SeccionOrden || figura.Seccion || figura.SeccionID || figura.SeccionId || figura.seccion || 0;
            const orden = figura.OrdenFigura || figura.Orden || figura.OrdenFig || figura.orden || 0;
            const titulo = figura.Caption || figura.Titulo || 'Sin titulo';
            const ruta = figura.RutaArchivo || figura.Ruta || figura.RutaImagen || figura.ruta || '';
            const fuente = figura.Fuente || figura.fuente || 'No especificado';

            return {
                id: `${seccion}-${orden}-${idx}`,
                seccion: seccion || 0,
                orden: orden || 0,
                titulo,
                ruta,
                fuente
            };
        });
        renderContent();
    } else {
        loadFiguras();
    }

    // Listener para cambios de tamano de ventana
    window.addEventListener('resize', debounce(checkMobileView, 250));

    console.log('Tabla de figuras inicializada con API de Google Sheets');
}

/**
 * Mostrar error cuando la API no está disponible
 */
function showApiError() {
    const container = document.querySelector('.figuras-table-container') || document.getElementById('figuras-tbody')?.parentElement;
    if (container) {
        container.innerHTML = `
            <div class="alert alert-danger text-center p-4">
                <i class="fas fa-exclamation-triangle fa-3x mb-3 text-danger"></i>
                <h5>API de Google Sheets No Disponible</h5>
                <p class="mb-3">
                    Esta aplicación requiere conexión con Google Sheets para funcionar.<br>
                    No se pueden realizar operaciones sin la API configurada.
                </p>
                <div class="mb-3">
                    <strong>Posibles causas:</strong>
                    <ul class="list-unstyled mt-2">
                        <li>• URL de API no configurada en config.js</li>
                        <li>• Google Apps Script no desplegado</li>
                        <li>• Problemas de conectividad</li>
                    </ul>
                </div>
                <a href="debug-api-figuras.html" class="btn btn-primary">
                    <i class="fas fa-bug me-1"></i>
                    Diagnosticar Problema
                </a>
            </div>
        `;
    }
    
    // Deshabilitar botón de nueva figura
    const btnNuevaFigura = document.getElementById('btn-nueva-figura');
    if (btnNuevaFigura) {
        btnNuevaFigura.disabled = true;
        btnNuevaFigura.title = 'API no disponible';
        btnNuevaFigura.innerHTML = '<i class="fas fa-exclamation-triangle me-1"></i>API No Disponible';
    }
    
    console.error('❌ API de Google Sheets no disponible - Funcionalidad deshabilitada');
}

/**
 * Verificar si estamos en vista móvil
 */
function checkMobileView() {
    const isMobileNow = window.innerWidth <= 576;
    
    if (isMobileNow !== figurasTable.isMobile) {
        figurasTable.isMobile = isMobileNow;
        toggleMobileView();
    }
}

/**
 * Alternar entre vista de tabla y cards móviles
 */
function toggleMobileView() {
    const tableView = document.getElementById('figuras-table-view');
    const mobileView = document.getElementById('figuras-mobile-view');
    
    if (figurasTable.isMobile) {
        tableView.classList.add('d-none');
        mobileView.classList.remove('d-none');
        renderMobileCards();
    } else {
        tableView.classList.remove('d-none');
        mobileView.classList.add('d-none');
        renderTable();
    }
}

/**
 * Configurar event listeners
 */
function setupFigurasTableListeners() {
    // Botón nueva figura
    document.getElementById('btn-nueva-figura').addEventListener('click', addNewFigura);
    
    // Click fuera para cancelar edición
    document.addEventListener('click', (e) => {
        if (figurasTable.editingCell && !e.target.closest('.editable-cell')) {
            cancelEdit();
        }
    });
    
    // Escape para cancelar edición
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && figurasTable.editingCell) {
            cancelEdit();
        }
    });
}

/**
 * Cargar figuras desde la API
 */
async function loadFiguras() {
    showLoading(true);
    
    try {
        // Simular carga de datos (reemplazar con API real)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Datos de ejemplo
        figurasTable.data = [
            {
                id: 1,
                seccion: 2,
                orden: 1,
                titulo: 'Evolución de la capacidad instalada de energía renovable',
                ruta: 'img/graficos/figura_2_1.png',
                fuente: 'SENER, 2024'
            },
            {
                id: 2,
                seccion: 3,
                orden: 1,
                titulo: 'Distribución regional de proyectos eólicos',
                ruta: 'img/graficos/figura_3_1.png',
                fuente: 'CFE, 2024'
            }
        ];
        
        renderContent();
        
    } catch (error) {
        console.error('Error cargando figuras:', error);
        showError('Error al cargar las figuras');
    } finally {
        showLoading(false);
    }
}

/**
 * Renderizar contenido según vista actual
 */
function renderContent() {
    if (figurasTable.data.length === 0) {
        showEmptyState();
    } else {
        hideEmptyState();
        if (figurasTable.isMobile) {
            renderMobileCards();
        } else {
            renderTable();
        }
    }
}

/**
 * Renderizar tabla para desktop
 */
function renderTable() {
    const tbody = document.getElementById('figuras-tbody');
    tbody.innerHTML = '';
    
    figurasTable.data.forEach(figura => {
        const row = createTableRow(figura);
        tbody.appendChild(row);
    });
}

/**
 * Crear fila de tabla
 */
function createTableRow(figura) {
    const row = document.createElement('tr');
    row.dataset.figuraId = figura.id;
    
    row.innerHTML = `
        <td class="text-center">
            <span class="badge bg-primary">
                <i class="fas fa-image me-1"></i>
                ${figura.seccion}.${figura.orden}
            </span>
        </td>
        <td>
            <div class="editable-cell" data-field="titulo" data-id="${figura.id}">
                <span class="cell-content">
                    <i class="fas fa-file-alt me-2 text-muted" style="font-size: 0.8rem;"></i>
                    ${figura.titulo}
                </span>
            </div>
        </td>
        <td>
            <div class="editable-cell" data-field="ruta" data-id="${figura.id}">
                <span class="cell-content">
                    <i class="fas fa-folder me-1 text-info"></i>
                    <code class="text-muted">${figura.ruta}</code>
                </span>
            </div>
        </td>
        <td class="col-fuente">
            <div class="editable-cell" data-field="fuente" data-id="${figura.id}">
                <span class="cell-content">
                    <i class="fas fa-quote-left me-1 text-success" style="font-size: 0.7rem;"></i>
                    ${figura.fuente}
                </span>
            </div>
        </td>
        <td>
            <div class="table-actions">
                <button class="btn-table-action btn-edit" onclick="editFigura(${figura.id})" 
                        data-bs-toggle="tooltip" title="Editar figura completa">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-table-action btn-delete" onclick="deleteFigura(${figura.id})"
                        data-bs-toggle="tooltip" title="Eliminar figura">
                    <i class="fas fa-trash-alt"></i>
                </button>
                <button class="btn-table-action" onclick="previewFigura(${figura.id})"
                        data-bs-toggle="tooltip" title="Vista previa">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        </td>
    `;
    
    // Agregar listeners para edición inline
    const editableCells = row.querySelectorAll('.editable-cell');
    editableCells.forEach(cell => {
        cell.addEventListener('click', () => startInlineEdit(cell));
    });
    
    return row;
}

/**
 * Renderizar cards para móvil
 */
function renderMobileCards() {
    const container = document.getElementById('figuras-cards-container');
    container.innerHTML = '';
    
    figurasTable.data.forEach(figura => {
        const card = createMobileCard(figura);
        container.appendChild(card);
    });
}

/**
 * Crear card móvil
 */
function createMobileCard(figura) {
    const card = document.createElement('div');
    card.className = 'figura-card-mobile';
    card.dataset.figuraId = figura.id;
    
    card.innerHTML = `
        <div class="card-header">
            <span class="badge bg-primary">
                <i class="fas fa-image me-1"></i>
                Figura ${figura.seccion}.${figura.orden}
            </span>
            <div class="table-actions">
                <button class="btn-table-action btn-edit" onclick="editFigura(${figura.id})" 
                        data-bs-toggle="tooltip" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-table-action btn-delete" onclick="deleteFigura(${figura.id})"
                        data-bs-toggle="tooltip" title="Eliminar">
                    <i class="fas fa-trash-alt"></i>
                </button>
                <button class="btn-table-action" onclick="previewFigura(${figura.id})"
                        data-bs-toggle="tooltip" title="Vista previa">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        </div>
        <div class="card-field">
            <span class="label">
                <i class="fas fa-file-alt me-1 text-muted"></i>
                Título:
            </span>
            <span class="editable-cell" data-field="titulo" data-id="${figura.id}">
                ${figura.titulo}
            </span>
        </div>
        <div class="card-field">
            <span class="label">
                <i class="fas fa-folder me-1 text-info"></i>
                Ruta:
            </span>
            <span class="editable-cell" data-field="ruta" data-id="${figura.id}">
                <code class="text-muted">${figura.ruta}</code>
            </span>
        </div>
        <div class="card-field">
            <span class="label">
                <i class="fas fa-quote-left me-1 text-success"></i>
                Fuente:
            </span>
            <span class="editable-cell" data-field="fuente" data-id="${figura.id}">
                ${figura.fuente}
            </span>
        </div>
    `;
    
    // Agregar listeners para edición inline
    const editableCells = card.querySelectorAll('.editable-cell');
    editableCells.forEach(cell => {
        cell.addEventListener('click', () => startInlineEdit(cell));
    });
    
    return card;
}

/**
 * Iniciar edición inline
 */
function startInlineEdit(cell) {
    // Verificar que la API esté disponible antes de permitir edición
    if (!api || !api.urls || !api.urls.FIGURAS) {
        showError('No se puede editar: API de Google Sheets no disponible');
        return;
    }

    if (figurasTable.editingCell) {
        cancelEdit();
    }
    
    figurasTable.editingCell = cell;
    const currentValue = cell.textContent.trim();
    
    cell.classList.add('editing');
    cell.innerHTML = `
        <input type="text" class="editable-input" value="${currentValue}">
        <div class="edit-actions mt-1">
            <button class="btn-table-action btn-save" onclick="saveEdit()">
                <i class="fas fa-check"></i>
            </button>
            <button class="btn-table-action btn-cancel" onclick="cancelEdit()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    const input = cell.querySelector('.editable-input');
    input.focus();
    input.select();
    
    // Enter para guardar, Escape para cancelar
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveEdit();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelEdit();
        }
    });
}

/**
 * Guardar edición
 */
async function saveEdit() {
    if (!figurasTable.editingCell) return;
    
    const cell = figurasTable.editingCell;
    const input = cell.querySelector('.editable-input');
    const newValue = input.value.trim();
    const figuraId = cell.dataset.id;
    const field = cell.dataset.field;
    
    if (!newValue) {
        showError('El campo no puede estar vacío');
        return;
    }
    
    try {
        // Mostrar loading
        cell.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        
        // Buscar la figura en los datos del editor
        let figura = null;
        let figuraIndex = -1;
        
        if (typeof editor !== 'undefined' && editor.documento?.figuras) {
            // Buscar por ID compuesto (seccion-orden)
            const [seccion, orden] = figuraId.split('-');
            figuraIndex = editor.documento.figuras.findIndex(f => {
                const fSeccion = f.SeccionOrden || f.Seccion || f.SeccionID || f.SeccionId || f.seccion || '0';
                const fOrden = f.OrdenFigura || f.Orden || f.OrdenFig || f.orden || '0';
                return fSeccion.toString() === seccion && fOrden.toString() === orden;
            });
            
            if (figuraIndex >= 0) {
                figura = editor.documento.figuras[figuraIndex];
            }
        } else {
            // Buscar en datos locales de la tabla
            figura = figurasTable.data.find(f => f.id === figuraId);
            if (figura) {
                figuraIndex = figurasTable.data.indexOf(figura);
            }
        }
        
        if (!figura) {
            throw new Error('Figura no encontrada');
        }
        
        // SOLO guardar en Google Sheets - NO guardado local
        if (!api || !api.urls || !api.urls.FIGURAS) {
            throw new Error('API de Google Sheets no disponible. No se puede guardar sin conexión.');
        }
        
        // Preparar datos actualizados para la API
        const figuraParaAPI = {};
        
        // Obtener datos actuales de la figura desde el editor
        if (typeof editor !== 'undefined' && editor.documento?.figuras && figuraIndex >= 0) {
            const figuraOriginal = editor.documento.figuras[figuraIndex];
            figuraParaAPI.SeccionOrden = figuraOriginal.SeccionOrden || figuraOriginal.Seccion || '1';
            figuraParaAPI.OrdenFigura = figuraOriginal.OrdenFigura || figuraOriginal.Orden || '1';
            figuraParaAPI.Caption = figuraOriginal.Caption || figuraOriginal.Titulo || '';
            figuraParaAPI.RutaArchivo = figuraOriginal.RutaArchivo || figuraOriginal.Ruta || '';
            figuraParaAPI.Fuente = figuraOriginal.Fuente || '';
        } else {
            // Usar datos de la tabla local
            const [seccion, orden] = figuraId.split('-');
            figuraParaAPI.SeccionOrden = seccion;
            figuraParaAPI.OrdenFigura = orden;
            figuraParaAPI.Caption = figura.titulo || '';
            figuraParaAPI.RutaArchivo = figura.ruta || '';
            figuraParaAPI.Fuente = figura.fuente || '';
        }
        
        // Actualizar el campo específico
        const campoMapeado = mapearCampoFigura(field);
        figuraParaAPI[campoMapeado] = newValue;
        
        console.log('🔄 Guardando SOLO en Google Sheets:', {
            docId: editor.docId || 'D01',
            figuraId: figuraId,
            figura: figuraParaAPI
        });
        
        // Llamar a la API - OBLIGATORIO
        const resultado = await api.actualizarFigura(
            editor.docId || 'D01', 
            figuraId, 
            figuraParaAPI
        );
        
        console.log('📥 Respuesta de API:', resultado);
        
        if (!resultado || resultado.status !== 'success') {
            throw new Error(resultado?.message || 'Error al guardar en Google Sheets');
        }
        
        console.log('✅ Figura guardada exitosamente en Google Sheets');
        
        // Solo actualizar datos locales DESPUÉS de confirmar que se guardó en Google Sheets
        if (typeof editor !== 'undefined' && editor.documento?.figuras && figuraIndex >= 0) {
            const campoMapeado = mapearCampoFigura(field);
            editor.documento.figuras[figuraIndex][campoMapeado] = newValue;
            editor.cambiosPendientes = false; // Ya se guardó en Google Sheets
        }
        
        if (figurasTable.data && figura) {
            figura[field] = newValue;
        }
        
        // Mostrar éxito
        cell.classList.remove('editing');
        cell.classList.add('save-success');
        
        // Restaurar contenido
        if (field === 'ruta') {
            cell.innerHTML = `<span class="cell-content"><i class="fas fa-folder me-1 text-info"></i><code class="text-muted">${newValue}</code></span>`;
        } else if (field === 'fuente') {
            cell.innerHTML = `<span class="cell-content"><i class="fas fa-quote-left me-1 text-success" style="font-size: 0.7rem;"></i>${newValue}</span>`;
        } else {
            cell.innerHTML = `<span class="cell-content"><i class="fas fa-file-alt me-2 text-muted" style="font-size: 0.8rem;"></i>${newValue}</span>`;
        }
        
        showSuccess('✅ Campo guardado en Google Sheets');
        
        // Limpiar animación
        setTimeout(() => {
            cell.classList.remove('save-success');
        }, 1000);
        
    } catch (error) {
        console.error('Error guardando:', error);
        cell.classList.add('save-error');
        showError('Error al guardar el campo: ' + error.message);
        
        setTimeout(() => {
            cell.classList.remove('save-error');
            cancelEdit();
        }, 1000);
    } finally {
        figurasTable.editingCell = null;
    }
}

/**
 * Mapear campos de la interfaz a campos del modelo de datos
 */
function mapearCampoFigura(campoInterfaz) {
    const mapeo = {
        'titulo': 'Caption',
        'ruta': 'RutaArchivo', 
        'fuente': 'Fuente'
    };
    return mapeo[campoInterfaz] || campoInterfaz;
}

/**
 * Cancelar edición
 */
function cancelEdit() {
    if (!figurasTable.editingCell) return;
    
    const cell = figurasTable.editingCell;
    const figuraId = parseInt(cell.dataset.id);
    const field = cell.dataset.field;
    
    // Restaurar valor original
    const figura = figurasTable.data.find(f => f.id === figuraId);
    if (figura) {
        cell.classList.remove('editing');
        
        if (field === 'ruta') {
            cell.innerHTML = `<span class="cell-content"><i class="fas fa-image me-1 text-muted"></i>${figura[field]}</span>`;
        } else {
            cell.innerHTML = `<span class="cell-content">${figura[field]}</span>`;
        }
    }
    
    figurasTable.editingCell = null;
}

/**
 * Agregar nueva figura
 */
async function addNewFigura() {
    try {
        showLoading('Creando nueva figura...');
        
        // Calcular siguiente orden - permitir secciones jerárquicas
        let seccionActual = '1'; // Por defecto sección 1
        
        // Si hay figuras existentes, sugerir la siguiente sección disponible
        if (figurasTable.data.length > 0) {
            // Obtener todas las secciones existentes
            const seccionesExistentes = [...new Set(figurasTable.data.map(f => f.seccion.toString()))];
            seccionesExistentes.sort((a, b) => {
                // Ordenar secciones numéricamente (1, 1.1, 1.2, 2, 2.1, etc.)
                const aParts = a.split('.').map(Number);
                const bParts = b.split('.').map(Number);
                for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
                    const aVal = aParts[i] || 0;
                    const bVal = bParts[i] || 0;
                    if (aVal !== bVal) return aVal - bVal;
                }
                return 0;
            });
            
            // Sugerir la última sección + 1
            const ultimaSeccion = seccionesExistentes[seccionesExistentes.length - 1];
            const ultimaSeccionNum = parseFloat(ultimaSeccion);
            seccionActual = (Math.floor(ultimaSeccionNum) + 1).toString();
        }
        
        const figurasEnSeccion = figurasTable.data.filter(f => f.seccion.toString() === seccionActual);
        const siguienteOrden = figurasEnSeccion.length + 1;
        
        // Mostrar modal para configurar la nueva figura
        const modalResult = await mostrarModalNuevaFigura(seccionActual, siguienteOrden);
        if (!modalResult) {
            return; // Usuario canceló
        }
        
        const newFigura = {
            id: `${modalResult.seccion}-${modalResult.orden}`,
            seccion: modalResult.seccion,
            orden: modalResult.orden,
            titulo: modalResult.titulo,
            ruta: modalResult.ruta,
            fuente: modalResult.fuente
        };
        
        // SOLO crear en Google Sheets - NO creación local
        if (!api || !api.urls || !api.urls.FIGURAS) {
            throw new Error('API de Google Sheets no disponible. No se puede crear figuras sin conexión.');
        }
        
        const figuraParaAPI = {
            SeccionOrden: seccionActual.toString(),
            OrdenFigura: siguienteOrden.toString(),
            Caption: newFigura.titulo,
            RutaArchivo: newFigura.ruta,
            Fuente: newFigura.fuente
        };
        
        console.log('🔄 Creando figura SOLO en Google Sheets:', {
            docId: editor.docId || 'D01',
            figura: figuraParaAPI
        });
        
        // Llamar a la API - OBLIGATORIO
        const resultado = await api.crearFigura(
            editor.docId || 'D01', 
            figuraParaAPI
        );
        
        console.log('📥 Respuesta de creación:', resultado);
        
        if (!resultado || resultado.status !== 'success') {
            throw new Error(resultado?.message || 'Error al crear figura en Google Sheets');
        }
        
        console.log('✅ Figura creada exitosamente en Google Sheets');
        
        // Solo actualizar datos locales DESPUÉS de confirmar que se creó en Google Sheets
        figurasTable.data.push(newFigura);
        
        // Agregar al editor si está disponible
        if (typeof editor !== 'undefined' && editor.documento) {
            if (!editor.documento.figuras) {
                editor.documento.figuras = [];
            }
            
            editor.documento.figuras.push({
                DocumentoID: editor.docId || 'D01',
                SeccionOrden: seccionActual.toString(),
                OrdenFigura: siguienteOrden.toString(),
                Caption: newFigura.titulo,
                RutaArchivo: newFigura.ruta,
                Fuente: newFigura.fuente
            });
            
            editor.cambiosPendientes = false; // Ya se guardó en Google Sheets
        }
        
        renderContent();
        showSuccess('✅ Nueva figura creada en Google Sheets');
        
    } catch (error) {
        console.error('Error al crear figura:', error);
        showError('Error al crear nueva figura: ' + error.message);
    } finally {
        hideLoading();
    }
}

/**
 * Editar figura (abrir modal)
 */
function editFigura(id) {
    const figura = figurasTable.data.find(f => f.id === id);
    if (figura) {
        // Aquí se abriría el modal de edición completa
        // Por ahora solo mostramos info
        showInfo(`Editando figura: ${figura.titulo}`);
    }
}

/**
 * Vista previa de figura
 */
function previewFigura(id) {
    const figura = figurasTable.data.find(f => f.id === id);
    if (figura) {
        // Crear modal de vista previa
        const modalHtml = `
            <div class="modal fade" id="preview-modal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-eye me-2"></i>
                                Vista Previa - Figura ${figura.seccion}.${figura.orden}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-center">
                            <div class="mb-3">
                                <img src="../${figura.ruta}" alt="${figura.titulo}" 
                                     class="img-fluid rounded shadow" 
                                     style="max-height: 400px;"
                                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBubyBlbmNvbnRyYWRhPC90ZXh0Pjwvc3ZnPg=='">
                            </div>
                            <h6 class="text-primary">${figura.titulo}</h6>
                            <p class="text-muted mb-1">
                                <i class="fas fa-folder me-1"></i>
                                <code>${figura.ruta}</code>
                            </p>
                            <p class="text-muted">
                                <i class="fas fa-quote-left me-1"></i>
                                <em>Fuente: ${figura.fuente}</em>
                            </p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times me-1"></i>
                                Cerrar
                            </button>
                            <button type="button" class="btn btn-primary" onclick="editFigura(${figura.id}); bootstrap.Modal.getInstance(document.getElementById('preview-modal')).hide();">
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
    }
}

/**
 * Eliminar figura
 */
function deleteFigura(id) {
    const figura = figurasTable.data.find(f => f.id === id);
    const figuraName = figura ? figura.titulo : 'esta figura';
    const [seccion, orden] = id.split('-');
    
    confirmAction(
        `¿Está seguro de que desea eliminar la figura ${seccion}.${orden}?\n\n"${figuraName}"\n\nEsta acción no se puede deshacer y se eliminará permanentemente de Google Sheets.`,
        async () => {
            try {
                showLoading('Eliminando figura...');
                
                // SOLO eliminar de Google Sheets - NO eliminación local sin confirmación
                if (!api || !api.urls || !api.urls.FIGURAS) {
                    throw new Error('API de Google Sheets no disponible. No se puede eliminar figuras sin conexión.');
                }
                
                console.log('🔄 Eliminando figura SOLO de Google Sheets:', {
                    docId: editor.docId || 'D01',
                    figuraId: id
                });
                
                // Llamar a la API - OBLIGATORIO
                const resultado = await api.eliminarFigura(
                    editor.docId || 'D01', 
                    id
                );
                
                console.log('📥 Respuesta de eliminación:', resultado);
                
                if (!resultado || resultado.status !== 'success') {
                    throw new Error(resultado?.message || 'Error al eliminar figura de Google Sheets');
                }
                
                console.log('✅ Figura eliminada exitosamente de Google Sheets');
                
                // Solo eliminar datos locales DESPUÉS de confirmar que se eliminó de Google Sheets
                figurasTable.data = figurasTable.data.filter(f => f.id !== id);
                
                if (typeof editor !== 'undefined' && editor.documento?.figuras) {
                    const [seccion, orden] = id.split('-');
                    editor.documento.figuras = editor.documento.figuras.filter(f => {
                        const fSeccion = f.SeccionOrden || f.Seccion || f.SeccionID || f.SeccionId || f.seccion || '0';
                        const fOrden = f.OrdenFigura || f.Orden || f.OrdenFig || f.orden || '0';
                        return !(fSeccion.toString() === seccion && fOrden.toString() === orden);
                    });
                    editor.cambiosPendientes = false; // Ya se eliminó de Google Sheets
                }
                
                renderContent();
                showSuccess('✅ Figura eliminada de Google Sheets');
                
            } catch (error) {
                console.error('Error al eliminar figura:', error);
                showError('Error al eliminar figura: ' + error.message);
            } finally {
                hideLoading();
            }
        },
        'Eliminar Figura'
    );
}

/**
 * Mostrar/ocultar loading
 */
function showLoading(show) {
    const loading = document.getElementById('figuras-loading');
    const container = document.querySelector('.figuras-table-container');
    
    if (show) {
        loading.classList.remove('d-none');
        container.classList.add('d-none');
    } else {
        loading.classList.add('d-none');
        container.classList.remove('d-none');
    }
}

/**
 * Mostrar/ocultar estado vacío
 */
function showEmptyState() {
    document.getElementById('figuras-empty-state').classList.remove('d-none');
    document.querySelector('.figuras-table-container').classList.add('d-none');
}

function hideEmptyState() {
    document.getElementById('figuras-empty-state').classList.add('d-none');
    document.querySelector('.figuras-table-container').classList.remove('d-none');
}

/**
 * Utilidad debounce
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Mostrar modal para configurar nueva figura
 */
function mostrarModalNuevaFigura(seccionSugerida, ordenSugerido) {
    return new Promise((resolve) => {
        const modalHtml = `
            <div class="modal fade" id="nueva-figura-modal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-plus me-2"></i>
                                Nueva Figura
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="nueva-figura-form">
                                <div class="mb-3">
                                    <label for="figura-seccion" class="form-label">
                                        <i class="fas fa-list-ol me-1"></i>
                                        Sección
                                    </label>
                                    <input type="text" class="form-control" id="figura-seccion" 
                                           value="${seccionSugerida}" placeholder="Ej: 1, 2.1, 3.2.1">
                                    <div class="form-text">
                                        Puede usar numeración jerárquica: 1, 1.1, 1.2, 2, 2.1, etc.
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="figura-orden" class="form-label">
                                        <i class="fas fa-sort-numeric-up me-1"></i>
                                        Orden en la Sección
                                    </label>
                                    <input type="number" class="form-control" id="figura-orden" 
                                           value="${ordenSugerido}" min="1">
                                </div>
                                
                                <div class="mb-3">
                                    <label for="figura-titulo" class="form-label">
                                        <i class="fas fa-heading me-1"></i>
                                        Título de la Figura
                                    </label>
                                    <input type="text" class="form-control" id="figura-titulo" 
                                           value="Nueva figura" placeholder="Título descriptivo">
                                </div>
                                
                                <div class="mb-3">
                                    <label for="figura-ruta" class="form-label">
                                        <i class="fas fa-folder me-1"></i>
                                        Ruta del Archivo
                                    </label>
                                    <input type="text" class="form-control" id="figura-ruta" 
                                           value="img/graficos/nueva_figura.png" 
                                           placeholder="img/graficos/archivo.png">
                                </div>
                                
                                <div class="mb-3">
                                    <label for="figura-fuente" class="form-label">
                                        <i class="fas fa-quote-left me-1"></i>
                                        Fuente
                                    </label>
                                    <input type="text" class="form-control" id="figura-fuente" 
                                           value="Elaboración propia" placeholder="Fuente de la figura">
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times me-1"></i>
                                Cancelar
                            </button>
                            <button type="button" class="btn btn-primary" id="crear-figura-btn">
                                <i class="fas fa-plus me-1"></i>
                                Crear Figura
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remover modal anterior si existe
        const existingModal = document.getElementById('nueva-figura-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Agregar nuevo modal
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Configurar eventos
        document.getElementById('crear-figura-btn').addEventListener('click', () => {
            const seccion = document.getElementById('figura-seccion').value.trim();
            const orden = parseInt(document.getElementById('figura-orden').value);
            const titulo = document.getElementById('figura-titulo').value.trim();
            const ruta = document.getElementById('figura-ruta').value.trim();
            const fuente = document.getElementById('figura-fuente').value.trim();
            
            // Validaciones
            if (!seccion) {
                showError('La sección es obligatoria');
                return;
            }
            if (!orden || orden < 1) {
                showError('El orden debe ser un número mayor a 0');
                return;
            }
            if (!titulo) {
                showError('El título es obligatorio');
                return;
            }
            if (!ruta) {
                showError('La ruta del archivo es obligatoria');
                return;
            }
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('nueva-figura-modal'));
            modal.hide();
            
            resolve({
                seccion,
                orden,
                titulo,
                ruta,
                fuente: fuente || 'No especificado'
            });
        });
        
        // Manejar cancelación
        document.getElementById('nueva-figura-modal').addEventListener('hidden.bs.modal', function() {
            this.remove();
            resolve(null); // Usuario canceló
        });
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('nueva-figura-modal'));
        modal.show();
        
        // Focus en el primer campo
        setTimeout(() => {
            document.getElementById('figura-seccion').focus();
        }, 500);
    });
}

/**
 * Función para confirmar acciones (si no existe globalmente)
 */
function confirmAction(mensaje, callback, titulo = 'Confirmar') {
    if (typeof bootstrap !== 'undefined') {
        // Crear modal de confirmación con Bootstrap
        const modalHtml = `
            <div class="modal fade" id="confirm-modal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${titulo}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>${mensaje}</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-danger" id="confirm-action-btn">Confirmar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remover modal anterior si existe
        const existingModal = document.getElementById('confirm-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Agregar nuevo modal
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Configurar evento de confirmación
        document.getElementById('confirm-action-btn').addEventListener('click', () => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('confirm-modal'));
            modal.hide();
            callback();
        });
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('confirm-modal'));
        modal.show();
        
        // Limpiar modal al cerrar
        document.getElementById('confirm-modal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    } else {
        // Fallback con confirm nativo
        if (confirm(mensaje)) {
            callback();
        }
    }
}

/**
 * Funciones de notificación si no existen globalmente
 */
function showLoading(mensaje = 'Cargando...') {
    if (typeof window.showLoading === 'function') {
        window.showLoading(mensaje);
    } else {
        console.log('⏳', mensaje);
    }
}

function hideLoading() {
    if (typeof window.hideLoading === 'function') {
        window.hideLoading();
    } else {
        console.log('✅ Loading hidden');
    }
}

function showSuccess(mensaje) {
    if (typeof window.showSuccess === 'function') {
        window.showSuccess(mensaje);
    } else if (typeof mostrarExito === 'function') {
        mostrarExito(mensaje);
    } else {
        console.log('✅', mensaje);
        alert('✅ ' + mensaje);
    }
}

function showError(mensaje) {
    if (typeof window.showError === 'function') {
        window.showError(mensaje);
    } else if (typeof mostrarError === 'function') {
        mostrarError(mensaje);
    } else {
        console.error('❌', mensaje);
        alert('❌ ' + mensaje);
    }
}

function showWarning(mensaje) {
    if (typeof window.showWarning === 'function') {
        window.showWarning(mensaje);
    } else if (typeof mostrarNotificacion === 'function') {
        mostrarNotificacion(mensaje, 'warning');
    } else {
        console.warn('⚠️', mensaje);
        alert('⚠️ ' + mensaje);
    }
}

function showInfo(mensaje) {
    if (typeof window.showInfo === 'function') {
        window.showInfo(mensaje);
    } else if (typeof mostrarNotificacion === 'function') {
        mostrarNotificacion(mensaje, 'info');
    } else {
        console.log('ℹ️', mensaje);
        alert('ℹ️ ' + mensaje);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Solo inicializar si estamos en la página del editor
    if (document.getElementById('figuras-tbody')) {
        initFigurasTable();
    }
});

console.log('📊 Módulo de tabla de figuras cargado');
