/**
 * ============================================================================
 * MÓDULO FIGURAS - CON CRUD COMPLETO
 * ============================================================================
 * Sistema para gestionar figuras con operaciones crear/leer/actualizar/eliminar
 */

// Configuración
const FIGURAS_API_URL = 'https://script.google.com/macros/s/AKfycbx83R7-iJxqJsdXDCytkpKfwHov5wVzGqIlKQBIM2OziDFY9Hq_JflEW6rqPyzCuo179w/exec';

// Estado
let figurasData = [];
let isLoading = false;
let figuraEditando = null;

/**
 * Inicializar módulo de figuras
 */
function initFiguras() {
    console.log('📸 Inicializando módulo de figuras con CRUD...');
    setupEventListeners();
    cargarFiguras();
}

/**
 * Configurar event listeners
 */
function setupEventListeners() {
    const btnNueva = document.getElementById('btn-nueva-figura');
    if (btnNueva) {
        btnNueva.addEventListener('click', mostrarModalNuevaFigura);
    }
    
    // Validación en tiempo real para evitar duplicados
    setupValidacionTiempoReal();
}

/**
 * Configurar validación en tiempo real
 */
function setupValidacionTiempoReal() {
    const seccionInput = document.getElementById('figura-seccion-orden');
    const ordenInput = document.getElementById('figura-orden');
    
    if (seccionInput && ordenInput) {
        const validarDuplicado = () => {
            const seccion = seccionInput.value.trim();
            const orden = ordenInput.value.trim();
            
            if (seccion && orden) {
                const figuraId = `${seccion}-${orden}`;
                const figuraExistente = figurasData.find(f => f.id === figuraId);
                
                // Solo mostrar error si existe y no estamos editando esa misma figura
                if (figuraExistente && figuraEditando !== figuraId) {
                    seccionInput.classList.add('is-invalid');
                    ordenInput.classList.add('is-invalid');
                    
                    // Sugerir siguiente número disponible
                    const siguienteNumero = obtenerSiguienteNumeroDisponible(seccion);
                    const tituloExistente = figuraExistente.Caption || 'Sin título';
                    
                    mostrarMensajeValidacion(
                        `⚠️ Figura ${seccion}.${orden} ya existe: "${tituloExistente}"<br>` +
                        `💡 Prueba con ${seccion}.${siguienteNumero} (siguiente disponible)`
                    );
                } else {
                    seccionInput.classList.remove('is-invalid');
                    ordenInput.classList.remove('is-invalid');
                    ocultarMensajeValidacion();
                }
            }
        };
        
        seccionInput.addEventListener('input', validarDuplicado);
        ordenInput.addEventListener('input', validarDuplicado);
    }
    
    // Validación en tiempo real para el campo de ruta
    const rutaInput = document.getElementById('figura-ruta');
    const btnPreviewRuta = document.getElementById('btn-preview-ruta');
    const btnSeleccionarImagen = document.getElementById('btn-seleccionar-imagen');
    
    if (rutaInput && btnPreviewRuta) {
        const validarRuta = () => {
            const ruta = rutaInput.value.trim();
            
            if (ruta) {
                btnPreviewRuta.disabled = false;
                btnPreviewRuta.classList.remove('btn-outline-secondary');
                btnPreviewRuta.classList.add('btn-outline-info');
                btnPreviewRuta.title = 'Vista previa de la imagen';
            } else {
                btnPreviewRuta.disabled = true;
                btnPreviewRuta.classList.remove('btn-outline-info');
                btnPreviewRuta.classList.add('btn-outline-secondary');
                btnPreviewRuta.title = 'Ingresa una ruta primero';
            }
        };
        
        rutaInput.addEventListener('input', validarRuta);
        
        // Validar estado inicial
        validarRuta();
    }
    
    // El botón de seleccionar imagen siempre está habilitado
    if (btnSeleccionarImagen) {
        btnSeleccionarImagen.title = 'Seleccionar imagen desde tu computadora';
    }
}

/**
 * Mostrar mensaje de validación en el modal
 */
function mostrarMensajeValidacion(mensaje) {
    let mensajeDiv = document.getElementById('mensaje-validacion-figura');
    
    if (!mensajeDiv) {
        mensajeDiv = document.createElement('div');
        mensajeDiv.id = 'mensaje-validacion-figura';
        mensajeDiv.className = 'alert alert-warning alert-sm mt-2';
        mensajeDiv.style.fontSize = '0.85rem';
        
        // Insertar después del campo de orden
        const ordenInput = document.getElementById('figura-orden');
        ordenInput.parentNode.appendChild(mensajeDiv);
    }
    
    mensajeDiv.innerHTML = `<i class="fas fa-exclamation-triangle me-1"></i> ${mensaje}`;
    mensajeDiv.style.display = 'block';
}

/**
 * Ocultar mensaje de validación
 */
function ocultarMensajeValidacion() {
    const mensajeDiv = document.getElementById('mensaje-validacion-figura');
    if (mensajeDiv) {
        mensajeDiv.style.display = 'none';
    }
}

/**
 * Cargar figuras desde Google Sheets CSV
 */
async function cargarFiguras() {
    if (isLoading) {
        console.log('⏳ Ya hay una carga en progreso...');
        return;
    }

    try {
        isLoading = true;
        mostrarEstadoCarga(true);

        console.log('📡 Cargando figuras desde Google Sheets CSV...');

        // Usar la función del sistema para cargar todos los datos
        if (typeof cargarTodosDatos === 'function') {
            const datos = await cargarTodosDatos();

            if (datos && datos.figuras) {
                // Filtrar por documento actual
                const docId = (window.editor?.docId || 'D01').toString().trim().toUpperCase();

                figurasData = datos.figuras.filter(fig => {
                    const figDocId = (fig.DocumentoID || fig.DocumentoId || fig.Documento || '').toString().trim().toUpperCase();
                    return figDocId === docId;
                }).map(fig => ({
                    ...fig,
                    id: `${fig.SeccionOrden}-${fig.OrdenFigura}` // Agregar ID compuesto
                }));

                console.log(`📦 Figuras filtradas para documento ${docId}:`, figurasData.length);

                renderizarFiguras();
                console.log(`✅ ${figurasData.length} figuras cargadas`);

                // Toast removido - no molestar al usuario al cargar
            } else {
                console.warn('⚠️ No se encontraron figuras en los datos');
                figurasData = [];
                renderizarFiguras();
            }
        } else {
            console.error('❌ Función cargarTodosDatos no disponible');
            figurasData = [];
            renderizarFiguras();
        }

    } catch (error) {
        console.error('❌ Error al cargar figuras:', error);
        figurasData = [];
        renderizarFiguras();
        mostrarToast('error', 'Error al cargar figuras: ' + error.message);
    } finally {
        isLoading = false;
        mostrarEstadoCarga(false);
    }
}

/**
 * Renderizar tabla de figuras
 */
function renderizarFiguras() {
    const tbody = document.getElementById('figuras-tbody');

    if (!tbody) {
        console.warn('⚠️ Elemento #figuras-tbody no encontrado');
        return;
    }

    // Estado vacío
    if (figurasData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-5">
                    <i class="fas fa-image text-muted mb-3" style="font-size: 3rem; opacity: 0.3;"></i>
                    <p class="text-muted mb-0">No hay figuras disponibles</p>
                    <button class="btn btn-primary btn-sm mt-2" onclick="mostrarModalNuevaFigura()">
                        <i class="fas fa-plus me-1"></i>
                        Agregar Primera Figura
                    </button>
                </td>
            </tr>
        `;
        return;
    }

    // Ordenar figuras por sección y orden
    const figurasOrdenadas = [...figurasData].sort((a, b) => {
        const seccionA = parseFloat(a.SeccionOrden || 0);
        const seccionB = parseFloat(b.SeccionOrden || 0);
        if (seccionA !== seccionB) {
            return seccionA - seccionB;
        }
        const ordenA = parseInt(a.OrdenFigura || 0);
        const ordenB = parseInt(b.OrdenFigura || 0);
        return ordenA - ordenB;
    });

    // Renderizar filas
    tbody.innerHTML = figurasOrdenadas.map((figura) => {
        const numeroFigura = `${figura.SeccionOrden || '?'}.${figura.OrdenFigura || '?'}`;
        const caption = figura.Caption || 'Sin título';
        const ruta = figura.RutaArchivo || 'Sin archivo';
        const fuente = figura.Fuente || '-';
        const figuraId = figura.id || `${figura.SeccionOrden}-${figura.OrdenFigura}`;

        return `
            <tr>
                <td class="text-center">
                    <span class="badge bg-primary">${numeroFigura}</span>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="fas fa-image me-2 text-muted"></i>
                        <span>${caption}</span>
                    </div>
                </td>
                <td>
                    <code class="text-muted small">${ruta}</code>
                </td>
                <td>
                    <small class="text-muted">${fuente}</small>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-info btn-preview" id="preview-${figuraId}" 
                                onclick="previewFigura('${figuraId}')" title="Vista previa de imagen">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-primary" onclick="editarFigura('${figuraId}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="eliminarFigura('${figuraId}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    console.log(`✅ ${figurasOrdenadas.length} figuras renderizadas`);
    
    // Verificar disponibilidad de imágenes después del renderizado
    setTimeout(() => {
        verificarImagenesDisponibles();
    }, 100);
}

/**
 * Mostrar modal para nueva figura
 */
function mostrarModalNuevaFigura() {
    console.log('📸 Abriendo modal para nueva figura...');
    figuraEditando = null;

    const modalElement = document.getElementById('modal-figura');
    if (!modalElement) {
        console.error('❌ No se encontró el elemento modal-figura');
        mostrarToast('error', 'Error: Modal no encontrado');
        return;
    }

    try {
        // Limpiar instancias previas ANTES de hacer cualquier cosa
        const existingModal = bootstrap.Modal.getInstance(modalElement);
        if (existingModal) {
            console.log('🧹 Limpiando instancia previa del modal');
            existingModal.dispose();
        }

        // Limpiar formulario
        document.getElementById('figura-seccion-orden').value = '';
        document.getElementById('figura-orden').value = '';
        document.getElementById('figura-ruta').value = '';
        document.getElementById('figura-caption').value = '';
        document.getElementById('figura-fuente').value = '';

        // Cambiar título
        document.querySelector('#modal-figura .modal-title').textContent = 'Nueva Figura';

        // Crear nueva instancia del modal
        const modal = new bootstrap.Modal(modalElement, {
            backdrop: 'static',
            keyboard: true,
            focus: true
        });
        
        // Mostrar modal
        modal.show();
        
        console.log('✅ Modal de nueva figura abierto');
        
    } catch (error) {
        console.error('❌ Error al abrir modal con Bootstrap:', error);
        console.log('🔧 Intentando con método alternativo...');
        
        // Fallback: usar método simple
        setTimeout(() => {
            abrirModalFiguraSimple(false);
        }, 100);
    }
}

/**
 * Editar figura existente
 */
function editarFigura(figuraId) {
    console.log('📸 Editando figura:', figuraId);
    const figura = figurasData.find(f => f.id === figuraId);

    if (!figura) {
        console.error('❌ Figura no encontrada:', figuraId);
        mostrarToast('error', 'Figura no encontrada');
        return;
    }

    const modalElement = document.getElementById('modal-figura');
    if (!modalElement) {
        console.error('❌ No se encontró el elemento modal-figura');
        mostrarToast('error', 'Error: Modal no encontrado');
        return;
    }

    try {
        // Limpiar instancias previas ANTES de hacer cualquier cosa
        const existingModal = bootstrap.Modal.getInstance(modalElement);
        if (existingModal) {
            console.log('🧹 Limpiando instancia previa del modal');
            existingModal.dispose();
        }

        figuraEditando = figuraId;

        // Llenar formulario con datos existentes
        document.getElementById('figura-seccion-orden').value = figura.SeccionOrden || '';
        document.getElementById('figura-orden').value = figura.OrdenFigura || '';
        document.getElementById('figura-ruta').value = figura.RutaArchivo || '';
        document.getElementById('figura-caption').value = figura.Caption || '';
        document.getElementById('figura-fuente').value = figura.Fuente || '';

        // Cambiar título
        document.querySelector('#modal-figura .modal-title').textContent = 'Editar Figura';

        // Crear nueva instancia del modal
        const modal = new bootstrap.Modal(modalElement, {
            backdrop: 'static',
            keyboard: true,
            focus: true
        });
        
        // Mostrar modal
        modal.show();
        
        console.log('✅ Modal de editar figura abierto');
        
    } catch (error) {
        console.error('❌ Error al abrir modal de edición con Bootstrap:', error);
        console.log('🔧 Intentando con método alternativo...');
        
        // Fallback: usar método simple
        setTimeout(() => {
            abrirModalFiguraSimple(true, figuraId);
        }, 100);
    }
}

/**
 * Guardar figura (crear o actualizar)
 */
async function guardarFigura() {
    console.log('💾 Iniciando guardado de figura...');
    
    // Obtener valores del formulario
    const seccionOrden = document.getElementById('figura-seccion-orden').value.trim();
    const ordenFigura = document.getElementById('figura-orden').value.trim();
    const rutaArchivo = document.getElementById('figura-ruta').value.trim();
    const caption = document.getElementById('figura-caption').value.trim();
    const fuente = document.getElementById('figura-fuente').value.trim();

    // Validar campos obligatorios
    if (!seccionOrden || !ordenFigura || !rutaArchivo) {
        mostrarToast('error', '⚠️ Complete los campos obligatorios: Sección, Orden y Ruta');
        
        // Resaltar campos faltantes
        if (!seccionOrden) document.getElementById('figura-seccion-orden').classList.add('is-invalid');
        if (!ordenFigura) document.getElementById('figura-orden').classList.add('is-invalid');
        if (!rutaArchivo) document.getElementById('figura-ruta').classList.add('is-invalid');
        
        return;
    }

    // Validar que no exista una figura duplicada
    const figuraId = `${seccionOrden}-${ordenFigura}`;
    const figuraExistente = figurasData.find(f => f.id === figuraId);
    
    if (figuraExistente && figuraEditando !== figuraId) {
        // Sugerir siguiente número disponible
        const siguienteNumero = obtenerSiguienteNumeroDisponible(seccionOrden);
        
        mostrarToast('error', `❌ Ya existe figura ${seccionOrden}.${ordenFigura}. Prueba con ${seccionOrden}.${siguienteNumero}`);
        
        // Resaltar campos problemáticos
        document.getElementById('figura-seccion-orden').classList.add('is-invalid');
        document.getElementById('figura-orden').classList.add('is-invalid');
        
        // Mostrar información de la figura existente y sugerencia
        const infoExistente = figuraExistente.Caption || 'Sin título';
        setTimeout(() => {
            mostrarToast('info', `💡 Sugerencia: Usa ${seccionOrden}.${siguienteNumero} (siguiente disponible)`);
        }, 2000);
        
        return;
    }

    // Limpiar clases de error
    document.getElementById('figura-seccion-orden').classList.remove('is-invalid');
    document.getElementById('figura-orden').classList.remove('is-invalid');
    document.getElementById('figura-ruta').classList.remove('is-invalid');

    // Mostrar preloader
    showLoading(figuraEditando ? 'Actualizando figura...' : 'Creando figura...');

    try {
        const docId = window.editor?.docId || 'D01';

        // Construir URL con parámetros GET
        const params = new URLSearchParams({
            action: figuraEditando ? 'ACTUALIZAR_FIGURA' : 'CREAR_FIGURA',
            docId: docId,
            seccionOrden: seccionOrden,
            ordenFigura: ordenFigura,
            rutaArchivo: rutaArchivo,
            caption: caption,
            fuente: fuente
        });

        if (figuraEditando) {
            params.append('figuraId', figuraEditando);
        }

        const url = `${FIGURAS_API_URL}?${params.toString()}`;
        console.log('📤 Guardando figura:', url);

        const response = await fetch(url, {
            method: 'GET',
            redirect: 'follow'
        });

        const result = await response.json();
        console.log('📥 Respuesta:', result);

        if (result.success) {
            mostrarToast('success', figuraEditando ? '✅ Figura actualizada' : '✅ Figura creada');

            // Cerrar modal (Bootstrap o método simple)
            const modalElement = document.getElementById('modal-figura');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            const manualBackdrop = document.getElementById('manual-backdrop');
            
            if (modalInstance) {
                // Cerrar con Bootstrap
                console.log('🔄 Cerrando modal con Bootstrap...');
                modalInstance.hide();
                
                modalElement.addEventListener('hidden.bs.modal', function() {
                    limpiarResiduosModal();
                    console.log('✅ Modal Bootstrap cerrado completamente');
                }, { once: true });
                
            } else if (manualBackdrop || modalElement.style.display === 'block') {
                // Cerrar con método simple
                console.log('🔄 Cerrando modal con método simple...');
                cerrarModalFiguraSimple();
                
            } else {
                // Fallback general
                console.log('🔄 Cerrando modal con fallback...');
                limpiarResiduosModal();
            }

            // Recargar figuras
            await cargarFiguras();
        } else {
            throw new Error(result.error || 'Error al guardar figura');
        }

    } catch (error) {
        console.error('❌ Error al guardar figura:', error);
        mostrarToast('error', 'Error: ' + error.message);
    } finally {
        hideLoading();
    }
}

/**
 * Eliminar figura - Mostrar modal de confirmación
 */
async function eliminarFigura(figuraId) {
    const figura = figurasData.find(f => f.id === figuraId);

    if (!figura) {
        mostrarToast('error', 'Figura no encontrada');
        return;
    }

    console.log('🗑️ Solicitando confirmación para eliminar figura:', figuraId);
    
    // Mostrar modal de confirmación
    mostrarModalEliminarFigura(figura);
}

/**
 * Mostrar modal de confirmación para eliminar figura
 */
function mostrarModalEliminarFigura(figura) {
    const figuraId = figura.id;
    const numeroFigura = `${figura.SeccionOrden}.${figura.OrdenFigura}`;
    const titulo = figura.Caption || 'Sin título';
    const ruta = figura.RutaArchivo || 'Sin ruta';
    
    const modalHtml = `
        <div class="modal fade" id="eliminar-figura-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Confirmar Eliminación
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="text-center mb-3">
                            <i class="fas fa-image text-danger" style="font-size: 3rem; opacity: 0.7;"></i>
                        </div>
                        
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            <strong>¿Estás seguro de eliminar esta figura?</strong>
                        </div>
                        
                        <div class="card">
                            <div class="card-body">
                                <h6 class="card-title text-danger">
                                    <i class="fas fa-hashtag me-1"></i>
                                    Figura ${numeroFigura}
                                </h6>
                                <p class="card-text">
                                    <strong>Título:</strong> ${titulo}
                                </p>
                                <p class="card-text">
                                    <strong>Archivo:</strong> <code class="text-muted">${ruta}</code>
                                </p>
                            </div>
                        </div>
                        
                        <div class="alert alert-info mt-3">
                            <i class="fas fa-info-circle me-2"></i>
                            <small>
                                <strong>Nota:</strong> Esta acción no se puede deshacer. 
                                El archivo de imagen no será eliminado de tu computadora.
                            </small>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-1"></i>
                            Cancelar
                        </button>
                        <button type="button" class="btn btn-danger" onclick="confirmarEliminarFigura('${figuraId}')" data-bs-dismiss="modal">
                            <i class="fas fa-trash me-1"></i>
                            Sí, Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remover modal anterior si existe
    const existingModal = document.getElementById('eliminar-figura-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Agregar nuevo modal
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('eliminar-figura-modal'));
    modal.show();
    
    // Limpiar modal al cerrar
    document.getElementById('eliminar-figura-modal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

/**
 * Confirmar y ejecutar eliminación de figura
 */
async function confirmarEliminarFigura(figuraId) {
    console.log('🗑️ Confirmando eliminación de figura:', figuraId);
    
    const figura = figurasData.find(f => f.id === figuraId);
    if (!figura) {
        mostrarToast('error', 'Figura no encontrada');
        return;
    }

    try {
        showLoading('Eliminando figura...');

        const docId = window.editor?.docId || 'D01';

        // Construir URL con parámetros GET
        const params = new URLSearchParams({
            action: 'ELIMINAR_FIGURA',
            docId: docId,
            figuraId: figuraId
        });

        const url = `${FIGURAS_API_URL}?${params.toString()}`;
        console.log('📤 Eliminando figura:', url);

        const response = await fetch(url, {
            method: 'GET',
            redirect: 'follow'
        });

        const result = await response.json();
        console.log('📥 Respuesta:', result);

        if (result.success) {
            // Eliminar de la lista local también
            figurasData = figurasData.filter(f => f.id !== figuraId);
            
            mostrarToast('success', `✅ Figura ${figura.SeccionOrden}.${figura.OrdenFigura} eliminada`);
            await cargarFiguras();
        } else {
            throw new Error(result.error || 'Error al eliminar figura');
        }

    } catch (error) {
        console.error('❌ Error al eliminar figura:', error);
        mostrarToast('error', 'Error: ' + error.message);
    } finally {
        hideLoading();
    }
}

/**
 * Mostrar/ocultar estado de carga
 */
function mostrarEstadoCarga(mostrar) {
    const loadingElement = document.getElementById('figuras-loading');
    const tableView = document.getElementById('figuras-table-view');

    if (loadingElement) {
        loadingElement.classList.toggle('d-none', !mostrar);
    }

    if (tableView) {
        tableView.classList.toggle('d-none', mostrar);
    }
}

/**
 * Mostrar notificación toast
 */
function mostrarToast(tipo, mensaje) {
    const toastId = `toast-${tipo}`;
    const toastElement = document.getElementById(toastId);
    const toastMessage = document.getElementById(`${toastId}-message`);

    if (toastElement && toastMessage) {
        toastMessage.textContent = mensaje;
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
    } else {
        console.log(`${tipo.toUpperCase()}: ${mensaje}`);
    }
}

/**
 * Helpers para loading
 */
function showLoading(mensaje) {
    // Buscar función global showLoading en editor.js
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.remove('d-none');
        const texto = preloader.querySelector('.preloader-text');
        if (texto) texto.textContent = mensaje || 'Cargando...';
    } else {
        console.log('⏳', mensaje);
    }
}

function hideLoading() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('d-none');
    }
}

/**
 * Limpiar modales problemáticos - Función de emergencia
 */
function limpiarModalesProblematicos() {
    console.log('🧹 Limpiando modales problemáticos...');
    
    try {
        // 1. Disponer todas las instancias de Bootstrap Modal
        const todosLosModales = document.querySelectorAll('.modal');
        todosLosModales.forEach(modal => {
            const modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) {
                console.log('🗑️ Disposing modal instance:', modal.id);
                modalInstance.dispose();
            }
        });
        
        // 2. Remover todos los backdrops
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => {
            console.log('🗑️ Removiendo backdrop:', backdrop);
            backdrop.remove();
        });
        
        // 3. Limpiar clases y estilos del body
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.body.style.marginRight = '';
        
        // 4. Resetear todos los modales manualmente
        todosLosModales.forEach(modal => {
            modal.style.display = 'none';
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
            modal.removeAttribute('aria-modal');
            modal.removeAttribute('role');
        });
        
        // 5. Limpiar event listeners problemáticos
        const modalFigura = document.getElementById('modal-figura');
        if (modalFigura) {
            // Clonar el elemento para remover todos los event listeners
            const nuevoModal = modalFigura.cloneNode(true);
            modalFigura.parentNode.replaceChild(nuevoModal, modalFigura);
            console.log('🔄 Modal figura reiniciado');
        }
        
        console.log('✅ Limpieza de modales completada');
        mostrarToast('success', '✅ Modales limpiados. Intenta de nuevo.');
        
    } catch (error) {
        console.error('❌ Error durante limpieza:', error);
        mostrarToast('error', 'Error durante limpieza: ' + error.message);
    }
}

/**
 * Función alternativa simple para abrir modal (fallback)
 */
function abrirModalFiguraSimple(esEdicion = false, figuraId = null) {
    console.log('🔧 Usando método alternativo para abrir modal...');
    
    const modalElement = document.getElementById('modal-figura');
    if (!modalElement) {
        alert('Error: Modal no encontrado');
        return;
    }
    
    try {
        // Método más directo sin Bootstrap
        modalElement.style.display = 'block';
        modalElement.classList.add('show');
        modalElement.setAttribute('aria-modal', 'true');
        modalElement.setAttribute('role', 'dialog');
        modalElement.removeAttribute('aria-hidden');
        
        // Agregar backdrop manualmente
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        backdrop.id = 'manual-backdrop';
        document.body.appendChild(backdrop);
        
        // Agregar clase al body
        document.body.classList.add('modal-open');
        
        // Configurar formulario
        if (esEdicion && figuraId) {
            const figura = figurasData.find(f => f.id === figuraId);
            if (figura) {
                figuraEditando = figuraId;
                document.getElementById('figura-seccion-orden').value = figura.SeccionOrden || '';
                document.getElementById('figura-orden').value = figura.OrdenFigura || '';
                document.getElementById('figura-ruta').value = figura.RutaArchivo || '';
                document.getElementById('figura-caption').value = figura.Caption || '';
                document.getElementById('figura-fuente').value = figura.Fuente || '';
                document.querySelector('#modal-figura .modal-title').textContent = 'Editar Figura';
            }
        } else {
            figuraEditando = null;
            document.getElementById('figura-seccion-orden').value = '';
            document.getElementById('figura-orden').value = '';
            document.getElementById('figura-ruta').value = '';
            document.getElementById('figura-caption').value = '';
            document.getElementById('figura-fuente').value = '';
            document.querySelector('#modal-figura .modal-title').textContent = 'Nueva Figura';
        }
        
        // Agregar event listener para cerrar
        const btnCerrar = modalElement.querySelector('[data-bs-dismiss="modal"]');
        if (btnCerrar) {
            btnCerrar.onclick = cerrarModalFiguraSimple;
        }
        
        console.log('✅ Modal abierto con método alternativo');
        
    } catch (error) {
        console.error('❌ Error con método alternativo:', error);
        alert('Error al abrir modal: ' + error.message);
    }
}

/**
 * Cerrar modal con método simple
 */
function cerrarModalFiguraSimple() {
    console.log('🔧 Cerrando modal con método simple...');
    
    const modalElement = document.getElementById('modal-figura');
    const backdrop = document.getElementById('manual-backdrop');
    
    if (modalElement) {
        modalElement.style.display = 'none';
        modalElement.classList.remove('show');
        modalElement.setAttribute('aria-hidden', 'true');
        modalElement.removeAttribute('aria-modal');
        modalElement.removeAttribute('role');
    }
    
    if (backdrop) {
        backdrop.remove();
    }
    
    limpiarResiduosModal();
}

/**
 * Limpiar residuos de modal
 */
function limpiarResiduosModal() {
    // Limpiar cualquier backdrop residual
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());
    
    // Restaurar scroll del body
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.body.style.marginRight = '';
    
    console.log('🧹 Residuos de modal limpiados');
}

/**
 * Verificar disponibilidad de imágenes y habilitar/deshabilitar botones de preview
 */
function verificarImagenesDisponibles() {
    console.log('🔍 Verificando disponibilidad de imágenes...');
    
    figurasData.forEach(figura => {
        const figuraId = figura.id;
        const rutaImagen = figura.RutaArchivo;
        const btnPreview = document.getElementById(`preview-${figuraId}`);
        
        if (btnPreview && rutaImagen) {
            verificarImagen(rutaImagen, figuraId, btnPreview);
        }
    });
}

/**
 * Verificar si una imagen específica existe
 */
function verificarImagen(rutaImagen, figuraId, btnPreview) {
    // Crear una imagen temporal para verificar si existe
    const img = new Image();
    
    img.onload = function() {
        // Imagen existe - habilitar botón
        btnPreview.disabled = false;
        btnPreview.classList.remove('btn-outline-secondary');
        btnPreview.classList.add('btn-outline-info');
        btnPreview.title = 'Vista previa de imagen';
        btnPreview.querySelector('i').className = 'fas fa-eye';
        
        console.log(`✅ Imagen disponible: ${rutaImagen}`);
    };
    
    img.onerror = function() {
        // Imagen no existe - deshabilitar botón
        btnPreview.disabled = true;
        btnPreview.classList.remove('btn-outline-info');
        btnPreview.classList.add('btn-outline-secondary');
        btnPreview.title = 'Imagen no encontrada: ' + rutaImagen;
        btnPreview.querySelector('i').className = 'fas fa-eye-slash';
        
        console.log(`❌ Imagen no disponible: ${rutaImagen}`);
    };
    
    // Intentar cargar la imagen
    // Construir ruta relativa desde la ubicación del HTML
    const rutaCompleta = rutaImagen.startsWith('../') ? rutaImagen : '../' + rutaImagen;
    img.src = rutaCompleta;
}

/**
 * Obtener el siguiente número de figura disponible para una sección
 */
function obtenerSiguienteNumeroDisponible(seccion) {
    // Obtener todas las figuras de esta sección
    const figurasSeccion = figurasData.filter(f => f.SeccionOrden === seccion);
    
    if (figurasSeccion.length === 0) {
        return 1; // Primera figura de la sección
    }
    
    // Obtener números existentes y ordenarlos
    const numerosExistentes = figurasSeccion
        .map(f => parseInt(f.OrdenFigura || 0))
        .sort((a, b) => a - b);
    
    // Buscar el primer hueco o el siguiente número
    for (let i = 1; i <= numerosExistentes.length + 1; i++) {
        if (!numerosExistentes.includes(i)) {
            return i;
        }
    }
    
    return numerosExistentes.length + 1; // Fallback
}

/**
 * Mostrar lista de figuras existentes como referencia
 */
function mostrarFigurasExistentes() {
    if (figurasData.length === 0) {
        mostrarToast('info', 'ℹ️ No hay figuras existentes');
        return;
    }
    
    // Ordenar figuras por sección y orden
    const figurasOrdenadas = [...figurasData].sort((a, b) => {
        const seccionA = parseFloat(a.SeccionOrden || 0);
        const seccionB = parseFloat(b.SeccionOrden || 0);
        if (seccionA !== seccionB) {
            return seccionA - seccionB;
        }
        const ordenA = parseInt(a.OrdenFigura || 0);
        const ordenB = parseInt(b.OrdenFigura || 0);
        return ordenA - ordenB;
    });
    
    // Crear lista de figuras
    const listaFiguras = figurasOrdenadas.map(figura => {
        const numero = `${figura.SeccionOrden}.${figura.OrdenFigura}`;
        const titulo = figura.Caption || 'Sin título';
        return `• Fig. ${numero}: ${titulo}`;
    }).join('\n');
    
    // Mostrar en alert (simple pero efectivo)
    alert(`📋 Figuras existentes (${figurasData.length}):\n\n${listaFiguras}\n\n💡 Asegúrate de usar un número único.`);
}

/**
 * Previsualizar figura en modal
 */
function previewFigura(figuraId) {
    console.log('👁️ Previsualizando figura:', figuraId);
    
    const figura = figurasData.find(f => f.id === figuraId);
    if (!figura) {
        mostrarToast('error', 'Figura no encontrada');
        return;
    }
    
    const rutaImagen = figura.RutaArchivo;
    const titulo = figura.Caption || 'Sin título';
    const fuente = figura.Fuente || 'No especificado';
    const [seccion, orden] = figuraId.split('-');
    
    // Construir ruta completa
    const rutaCompleta = rutaImagen.startsWith('../') ? rutaImagen : '../' + rutaImagen;
    
    // Crear modal de previsualización
    const modalHtml = `
        <div class="modal fade" id="preview-figura-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-info text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-eye me-2"></i>
                            Vista Previa - Figura ${seccion}.${orden}
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center p-4">
                        <div class="mb-3">
                            <img id="preview-image" src="${rutaCompleta}" alt="${titulo}" 
                                 class="img-fluid rounded shadow" 
                                 style="max-height: 500px; max-width: 100%;"
                                 onload="imagenCargadaCorrectamente()"
                                 onerror="imagenNoEncontrada('${rutaImagen}')">
                        </div>
                        <h6 class="text-primary mb-2">${titulo}</h6>
                        <div class="row text-start">
                            <div class="col-md-6">
                                <p class="text-muted mb-1">
                                    <i class="fas fa-folder me-1 text-info"></i>
                                    <strong>Ruta:</strong>
                                </p>
                                <code class="text-muted small">${rutaImagen}</code>
                            </div>
                            <div class="col-md-6">
                                <p class="text-muted mb-1">
                                    <i class="fas fa-quote-left me-1 text-success"></i>
                                    <strong>Fuente:</strong>
                                </p>
                                <em class="text-muted">${fuente}</em>
                            </div>
                        </div>
                        <div id="image-info" class="mt-3 text-muted small"></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-1"></i>
                            Cerrar
                        </button>
                        <button type="button" class="btn btn-primary" onclick="editarFigura('${figuraId}'); bootstrap.Modal.getInstance(document.getElementById('preview-figura-modal')).hide();">
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
    const modal = new bootstrap.Modal(document.getElementById('preview-figura-modal'));
    modal.show();
    
    // Limpiar modal al cerrar
    document.getElementById('preview-figura-modal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

/**
 * Callback cuando la imagen se carga correctamente
 */
function imagenCargadaCorrectamente() {
    const img = document.getElementById('preview-image');
    const infoDiv = document.getElementById('image-info');
    
    if (img && infoDiv) {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        const size = ((img.src.length * 0.75) / 1024).toFixed(1); // Estimación aproximada
        
        infoDiv.innerHTML = `
            <i class="fas fa-info-circle me-1"></i>
            Dimensiones: ${width} × ${height} px | Tamaño estimado: ~${size} KB
        `;
    }
}

/**
 * Callback cuando la imagen no se puede cargar
 */
function imagenNoEncontrada(rutaOriginal) {
    const img = document.getElementById('preview-image');
    const infoDiv = document.getElementById('image-info');
    
    if (img) {
        // Mostrar imagen de placeholder
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIiBzdHJva2U9IiNkZWUyZTYiIHN0cm9rZS13aWR0aD0iMiIvPjx0ZXh0IHg9IjUwJSIgeT0iNDAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2Yzc1N2QiIHRleHQtYW5jaG9yPSJtaWRkbGUiPjxpIGNsYXNzPSJmYXMgZmEtaW1hZ2UiPjwvaT4gSW1hZ2VuIG5vIGVuY29udHJhZGE8L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI2MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzZjNzU3ZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VmVyaWZpY2EgbGEgcnV0YTogJyArIHJ1dGFPcmlnaW5hbCArICc8L3RleHQ+PC9zdmc+';
        img.alt = 'Imagen no encontrada';
        img.style.border = '2px dashed #dc3545';
    }
    
    if (infoDiv) {
        infoDiv.innerHTML = `
            <div class="alert alert-warning mb-0">
                <i class="fas fa-exclamation-triangle me-1"></i>
                <strong>Imagen no encontrada:</strong> ${rutaOriginal}
                <br><small>Verifica que el archivo existe en la ruta especificada.</small>
            </div>
        `;
    }
}

/**
 * Previsualizar imagen desde el campo de ruta en el modal de edición
 */
function previewRutaImagen() {
    const rutaInput = document.getElementById('figura-ruta');
    const ruta = rutaInput.value.trim();
    
    if (!ruta) {
        mostrarToast('warning', '⚠️ Ingresa una ruta de imagen primero');
        rutaInput.focus();
        return;
    }
    
    console.log('👁️ Previsualizando ruta:', ruta);
    
    // Obtener otros datos del formulario para contexto
    const seccion = document.getElementById('figura-seccion-orden').value.trim() || '?';
    const orden = document.getElementById('figura-orden').value.trim() || '?';
    const titulo = document.getElementById('figura-caption').value.trim() || 'Vista previa';
    
    // Construir ruta completa
    const rutaCompleta = ruta.startsWith('../') ? ruta : '../' + ruta;
    
    // Crear modal de previsualización simple
    const modalHtml = `
        <div class="modal fade" id="preview-ruta-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-eye me-2"></i>
                            Vista Previa - Figura ${seccion}.${orden}
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center p-4">
                        <div class="mb-3">
                            <img id="preview-ruta-image" src="${rutaCompleta}" alt="${titulo}" 
                                 class="img-fluid rounded shadow" 
                                 style="max-height: 400px; max-width: 100%;"
                                 onload="rutaImagenCargada()"
                                 onerror="rutaImagenError('${ruta}')">
                        </div>
                        <h6 class="text-primary mb-2">${titulo}</h6>
                        <p class="text-muted mb-1">
                            <i class="fas fa-folder me-1 text-info"></i>
                            <code class="text-muted">${ruta}</code>
                        </p>
                        <div id="ruta-image-info" class="mt-3 text-muted small"></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-1"></i>
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remover modal anterior si existe
    const existingModal = document.getElementById('preview-ruta-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Agregar nuevo modal
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('preview-ruta-modal'));
    modal.show();
    
    // Limpiar modal al cerrar
    document.getElementById('preview-ruta-modal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

/**
 * Callback para imagen cargada desde ruta
 */
function rutaImagenCargada() {
    const img = document.getElementById('preview-ruta-image');
    const infoDiv = document.getElementById('ruta-image-info');
    
    if (img && infoDiv) {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        
        infoDiv.innerHTML = `
            <div class="alert alert-success mb-0">
                <i class="fas fa-check-circle me-1"></i>
                <strong>Imagen encontrada:</strong> ${width} × ${height} px
            </div>
        `;
    }
}

/**
 * Callback para error de imagen desde ruta
 */
function rutaImagenError(rutaOriginal) {
    const img = document.getElementById('preview-ruta-image');
    const infoDiv = document.getElementById('ruta-image-info');
    
    if (img) {
        // Mostrar imagen de error
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIiBzdHJva2U9IiNkYzM1NDUiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWRhc2hhcnJheT0iMTAiLz48dGV4dCB4PSI1MCUiIHk9IjQ1JSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmaWxsPSIjZGMzNTQ1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7inYwgSW1hZ2VuIG5vIGVuY29udHJhZGE8L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI2MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzZjNzU3ZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VmVyaWZpY2EgbGEgcnV0YTwvdGV4dD48L3N2Zz4=';
        img.alt = 'Imagen no encontrada';
    }
    
    if (infoDiv) {
        infoDiv.innerHTML = `
            <div class="alert alert-danger mb-0">
                <i class="fas fa-exclamation-triangle me-1"></i>
                <strong>Imagen no encontrada:</strong> ${rutaOriginal}
                <br><small>Verifica que el archivo existe y la ruta es correcta.</small>
            </div>
        `;
    }
}

/**
 * Abrir selector de archivos para imágenes
 */
function seleccionarImagen() {
    console.log('📁 Abriendo selector de imágenes...');
    
    const fileInput = document.getElementById('file-selector-imagen');
    if (fileInput) {
        fileInput.click();
    } else {
        console.error('❌ No se encontró el input de archivo');
        mostrarToast('error', 'Error al abrir selector de archivos');
    }
}

/**
 * Manejar imagen seleccionada
 */
function imagenSeleccionada(input) {
    const file = input.files[0];
    if (!file) {
        console.log('❌ No se seleccionó ningún archivo');
        return;
    }
    
    console.log('📷 Imagen seleccionada:', file.name);
    
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
        mostrarToast('error', '❌ Por favor selecciona un archivo de imagen válido');
        input.value = ''; // Limpiar selección
        return;
    }
    
    // Generar ruta sugerida basada en la sección y orden
    const seccion = document.getElementById('figura-seccion-orden').value.trim();
    const orden = document.getElementById('figura-orden').value.trim();
    
    let rutaSugerida;
    if (seccion && orden) {
        // Obtener extensión del archivo
        const extension = file.name.split('.').pop().toLowerCase();
        rutaSugerida = `img/graficos/figura_${seccion}_${orden}.${extension}`;
    } else {
        // Usar nombre original pero en la carpeta correcta
        rutaSugerida = `img/graficos/${file.name}`;
    }
    
    // Actualizar campo de ruta
    const rutaInput = document.getElementById('figura-ruta');
    rutaInput.value = rutaSugerida;
    
    // Trigger validación
    rutaInput.dispatchEvent(new Event('input'));
    
    // Mostrar información al usuario
    mostrarToast('success', `✅ Ruta sugerida: ${rutaSugerida}`);
    
    // Mostrar modal de confirmación con preview
    mostrarModalConfirmacionImagen(file, rutaSugerida);
    
    // Limpiar input para permitir seleccionar el mismo archivo otra vez
    input.value = '';
}

/**
 * Mostrar modal de confirmación con preview de la imagen seleccionada
 */
function mostrarModalConfirmacionImagen(file, rutaSugerida) {
    // Crear URL temporal para preview
    const urlTemporal = URL.createObjectURL(file);
    
    const modalHtml = `
        <div class="modal fade" id="confirmacion-imagen-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-image me-2"></i>
                            Imagen Seleccionada
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <img src="${urlTemporal}" alt="Preview" 
                                     class="img-fluid rounded shadow mb-3" 
                                     style="max-height: 300px; width: 100%; object-fit: contain;">
                            </div>
                            <div class="col-md-6">
                                <h6 class="text-primary mb-3">Información del Archivo</h6>
                                <div class="mb-2">
                                    <strong>Nombre:</strong> ${file.name}
                                </div>
                                <div class="mb-2">
                                    <strong>Tamaño:</strong> ${(file.size / 1024).toFixed(1)} KB
                                </div>
                                <div class="mb-2">
                                    <strong>Tipo:</strong> ${file.type}
                                </div>
                                <div class="mb-3">
                                    <strong>Ruta sugerida:</strong>
                                    <br><code class="text-primary">${rutaSugerida}</code>
                                </div>
                                
                                <div class="alert alert-info">
                                    <i class="fas fa-info-circle me-1"></i>
                                    <strong>Importante:</strong> Debes copiar manualmente este archivo a la carpeta 
                                    <code>img/graficos/</code> de tu proyecto LaTeX con el nombre sugerido.
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-1"></i>
                            Cancelar
                        </button>
                        <button type="button" class="btn btn-primary" onclick="confirmarRutaImagen('${rutaSugerida}')" data-bs-dismiss="modal">
                            <i class="fas fa-check me-1"></i>
                            Usar esta Ruta
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remover modal anterior si existe
    const existingModal = document.getElementById('confirmacion-imagen-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Agregar nuevo modal
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('confirmacion-imagen-modal'));
    modal.show();
    
    // Limpiar modal y URL temporal al cerrar
    document.getElementById('confirmacion-imagen-modal').addEventListener('hidden.bs.modal', function() {
        URL.revokeObjectURL(urlTemporal);
        this.remove();
    });
}

/**
 * Confirmar y usar la ruta de imagen sugerida
 */
function confirmarRutaImagen(ruta) {
    const rutaInput = document.getElementById('figura-ruta');
    rutaInput.value = ruta;
    
    // Trigger validación
    rutaInput.dispatchEvent(new Event('input'));
    
    mostrarToast('info', `📋 Ruta configurada: ${ruta}`);
    
    console.log('✅ Ruta de imagen confirmada:', ruta);
}

/**
 * Función de emergencia para usuarios - accesible desde consola
 */
window.limpiarModales = limpiarModalesProblematicos;
window.abrirModalFiguraSimple = abrirModalFiguraSimple;
window.cerrarModalFiguraSimple = cerrarModalFiguraSimple;
window.mostrarFigurasExistentes = mostrarFigurasExistentes;
window.previewFigura = previewFigura;
window.previewRutaImagen = previewRutaImagen;
window.seleccionarImagen = seleccionarImagen;
window.imagenSeleccionada = imagenSeleccionada;
window.confirmarRutaImagen = confirmarRutaImagen;
window.mostrarModalEliminarFigura = mostrarModalEliminarFigura;
window.confirmarEliminarFigura = confirmarEliminarFigura;
window.imagenCargadaCorrectamente = imagenCargadaCorrectamente;
window.imagenNoEncontrada = imagenNoEncontrada;
window.rutaImagenCargada = rutaImagenCargada;
window.rutaImagenError = rutaImagenError;

/**
 * Exponer funciones globalmente para evitar conflictos
 */
window.figurasModule = {
    editarFigura: editarFigura,
    eliminarFigura: eliminarFigura,
    mostrarModalNuevaFigura: mostrarModalNuevaFigura,
    guardarFigura: guardarFigura,
    limpiarModales: limpiarModalesProblematicos,
    cargarFiguras: cargarFiguras
};

// También exponer directamente para compatibilidad
window.editarFigura = editarFigura;
window.eliminarFigura = eliminarFigura;
window.mostrarModalNuevaFigura = mostrarModalNuevaFigura;
window.guardarFigura = guardarFigura;

/**
 * Inicializar cuando el DOM esté listo
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFiguras);
} else {
    initFiguras();
}
