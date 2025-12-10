/**
 * ============================================================================
 * MÓDULO FIGURAS - SOLO LECTURA
 * ============================================================================
 * Sistema simplificado que ÚNICAMENTE lee y muestra figuras desde Google Sheets
 * No incluye funcionalidad de crear/editar/eliminar (CRUD)
 */

// Estado
let figurasData = [];
let isLoading = false;

/**
 * Inicializar módulo de figuras
 */
function initFiguras() {
    console.log('📸 Inicializando módulo de figuras (solo lectura)...');
    cargarFiguras();
}

/**
 * Cargar figuras desde Google Sheets (usando el método del sistema)
 */
async function cargarFiguras() {
    if (isLoading) {
        console.log('⏳ Ya hay una carga en progreso...');
        return;
    }

    try {
        isLoading = true;
        mostrarEstadoCarga(true);

        console.log('📡 Cargando figuras desde Google Sheets...');

        // Usar la función del sistema para cargar datos
        if (typeof cargarTodosDatos === 'function') {
            const datos = await cargarTodosDatos();
            
            if (datos && datos.figuras) {
                // Filtrar por documento actual si está disponible
                if (window.editor && window.editor.docId) {
                    const docId = window.editor.docId.toString().trim().toUpperCase();
                    figurasData = datos.figuras.filter(fig => {
                        const figDocId = (fig.DocumentoID || fig.DocumentoId || fig.Documento || '').toString().trim().toUpperCase();
                        return figDocId === docId;
                    });
                    console.log(`📦 Figuras filtradas para documento ${docId}:`, figurasData.length);
                } else {
                    figurasData = datos.figuras || [];
                    console.log('📦 Todas las figuras cargadas:', figurasData.length);
                }
                
                renderizarFiguras();
                console.log(`✅ ${figurasData.length} figuras cargadas exitosamente`);
                
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
            mostrarToast('error', 'Sistema de carga no disponible');
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
                <td colspan="4" class="text-center py-5">
                    <i class="fas fa-image text-muted mb-3" style="font-size: 3rem; opacity: 0.3;"></i>
                    <p class="text-muted mb-0">No hay figuras disponibles</p>
                    <small class="text-muted">Las figuras se cargan desde Google Sheets</small>
                </td>
            </tr>
        `;
        return;
    }

    // Ordenar figuras por sección y orden
    const figurasOrdenadas = [...figurasData].sort((a, b) => {
        // Primero por sección
        const seccionA = parseFloat(a.SeccionOrden || 0);
        const seccionB = parseFloat(b.SeccionOrden || 0);
        if (seccionA !== seccionB) {
            return seccionA - seccionB;
        }
        // Luego por orden dentro de la sección
        const ordenA = parseInt(a.OrdenFigura || 0);
        const ordenB = parseInt(b.OrdenFigura || 0);
        return ordenA - ordenB;
    });

    // Renderizar filas
    tbody.innerHTML = figurasOrdenadas.map((figura, index) => {
        const numeroFigura = `${figura.SeccionOrden || '?'}.${figura.OrdenFigura || '?'}`;
        const caption = figura.Caption || 'Sin título';
        const ruta = figura.RutaArchivo || 'Sin archivo';
        const fuente = figura.Fuente || '-';

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
            </tr>
        `;
    }).join('');

    console.log(`✅ ${figurasOrdenadas.length} figuras renderizadas`);
}

/**
 * Mostrar/ocultar estado de carga
 */
function mostrarEstadoCarga(mostrar) {
    const loadingElement = document.getElementById('figuras-loading');
    const tableView = document.getElementById('figuras-table-view');
    const emptyState = document.getElementById('figuras-empty-state');

    if (loadingElement) {
        loadingElement.classList.toggle('d-none', !mostrar);
    }

    if (tableView) {
        tableView.classList.toggle('d-none', mostrar);
    }

    if (emptyState) {
        emptyState.classList.add('d-none');
    }
}

/**
 * Mostrar notificación toast
 */
function mostrarToast(tipo, mensaje) {
    // Usar el sistema de toasts de Bootstrap si está disponible
    const toastId = `toast-${tipo}`;
    const toastElement = document.getElementById(toastId);
    const toastMessage = document.getElementById(`${toastId}-message`);

    if (toastElement && toastMessage) {
        toastMessage.textContent = mensaje;
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
    } else {
        // Fallback: console
        console.log(`${tipo.toUpperCase()}: ${mensaje}`);
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
