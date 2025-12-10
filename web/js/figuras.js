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

                if (figurasData.length > 0) {
                    mostrarToast('success', `${figurasData.length} figuras cargadas`);
                }
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
    figuraEditando = null;

    // Limpiar formulario
    document.getElementById('figura-seccion-orden').value = '';
    document.getElementById('figura-orden').value = '';
    document.getElementById('figura-ruta').value = '';
    document.getElementById('figura-caption').value = '';
    document.getElementById('figura-fuente').value = '';

    // Cambiar título
    document.querySelector('#modal-figura .modal-title').textContent = 'Nueva Figura';

    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modal-figura'));
    modal.show();
}

/**
 * Editar figura existente
 */
function editarFigura(figuraId) {
    const figura = figurasData.find(f => f.id === figuraId);

    if (!figura) {
        mostrarToast('error', 'Figura no encontrada');
        return;
    }

    figuraEditando = figuraId;

    // Llenar formulario
    document.getElementById('figura-seccion-orden').value = figura.SeccionOrden || '';
    document.getElementById('figura-orden').value = figura.OrdenFigura || '';
    document.getElementById('figura-ruta').value = figura.RutaArchivo || '';
    document.getElementById('figura-caption').value = figura.Caption || '';
    document.getElementById('figura-fuente').value = figura.Fuente || '';

    // Cambiar título
    document.querySelector('#modal-figura .modal-title').textContent = 'Editar Figura';

    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modal-figura'));
    modal.show();
}

/**
 * Guardar figura (crear o actualizar)
 */
async function guardarFigura() {
    // Obtener valores del formulario
    const seccionOrden = document.getElementById('figura-seccion-orden').value.trim();
    const ordenFigura = document.getElementById('figura-orden').value.trim();
    const rutaArchivo = document.getElementById('figura-ruta').value.trim();
    const caption = document.getElementById('figura-caption').value.trim();
    const fuente = document.getElementById('figura-fuente').value.trim();

    // Validar
    if (!seccionOrden || !ordenFigura || !rutaArchivo) {
        mostrarToast('error', 'Complete los campos obligatorios (Sección, Orden, Ruta)');
        return;
    }

    try {
        const docId = window.editor?.docId || 'D01';
        
        showLoading(figuraEditando ? 'Actualizando figura...' : 'Creando figura...');

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
            
            // Cerrar modal
            const modalElement = document.getElementById('modal-figura');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
                modalInstance.hide();
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
 * Inicializar cuando el DOM esté listo
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFiguras);
} else {
    initFiguras();
}
