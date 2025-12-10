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
 * Eliminar figura
 */
async function eliminarFigura(figuraId) {
    const figura = figurasData.find(f => f.id === figuraId);

    if (!figura) {
        mostrarToast('error', 'Figura no encontrada');
        return;
    }

    if (!confirm(`¿Eliminar figura ${figura.SeccionOrden}.${figura.OrdenFigura}?`)) {
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
            mostrarToast('success', '✅ Figura eliminada');
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
 * Función de emergencia para usuarios - accesible desde consola
 */
window.limpiarModales = limpiarModalesProblematicos;
window.abrirModalFiguraSimple = abrirModalFiguraSimple;
window.cerrarModalFiguraSimple = cerrarModalFiguraSimple;
window.mostrarFigurasExistentes = mostrarFigurasExistentes;

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
