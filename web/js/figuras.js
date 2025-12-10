/**
 * ============================================================================
 * FRONTEND FIGURAS
 * ============================================================================
 * Funciones para manejar CRUD de Figuras del documento
 */

/**
 * Cargar figuras del documento actual
 */
async function cargarFiguras() {
    try {
        showLoading('Cargando figuras...');
        const figuras = await api.obtenerFiguras(editor.docId);
        renderizarFiguras(figuras);
    } catch (error) {
        console.error('Error al cargar figuras:', error);
        mostrarError('Error al cargar figuras');
    } finally {
        hideLoading();
    }
}

/**
 * Renderizar lista de figuras en tabla
 */

function renderizarFiguras(figuras) {
    // Actualizar cache global para el resto del editor
    editor.documento.figuras = figuras || [];

    // Ordenar por seccion/orden
    editor.documento.figuras.sort((a, b) => {
        const secA = parseInt(a.SeccionOrden) || 0;
        const secB = parseInt(b.SeccionOrden) || 0;
        if (secA !== secB) return secA - secB;
        return (parseInt(a.OrdenFigura) || 0) - (parseInt(b.OrdenFigura) || 0);
    });

    // Reusar renderer principal (tabla responsiva)
    if (typeof renderFiguras === 'function') {
        renderFiguras(editor.documento.figuras);
    }
}


/**
 * Abrir modal para nueva figura
 */
document.addEventListener('DOMContentLoaded', () => {
    const btnNuevaFigura = document.getElementById('btn-nueva-figura');
    if (btnNuevaFigura) {
        btnNuevaFigura.addEventListener('click', () => {
            document.getElementById('figura-id').value = '';
            document.getElementById('form-figura').reset();
            document.querySelector('#modal-figura .modal-title').textContent = 'Nueva Figura';
            abrirModal('modal-figura');
        });
    }
});

/**
 * Editar figura existente
 */
async function editarFigura(figuraKey) {
    try {
        showLoading('Cargando figura...');
        const figuras = await api.obtenerFiguras(editor.docId);

        // Parse composite key "seccion-orden"
        const [seccion, orden] = figuraKey.split('-');
        const figura = figuras.find(f =>
            String(f.SeccionOrden) === String(seccion) &&
            String(f.OrdenFigura) === String(orden)
        );

        if (!figura) {
            throw new Error('Figura no encontrada');
        }

        // Llenar formulario
        document.getElementById('figura-id').value = figuraKey;
        document.getElementById('figura-seccion-orden').value = figura.SeccionOrden || '';
        document.getElementById('figura-orden').value = figura.OrdenFigura || '';
        document.getElementById('figura-ruta').value = figura.RutaArchivo || '';
        document.getElementById('figura-caption').value = figura.Caption || '';
        document.getElementById('figura-fuente').value = figura.Fuente || '';

        document.querySelector('#modal-figura .modal-title').textContent = 'Editar Figura';
        abrirModal('modal-figura');

    } catch (error) {
        console.error('Error al editar figura:', error);
        mostrarError('Error al cargar figura: ' + error.message);
    } finally {
        hideLoading();
    }
}

/**
 * Guardar figura (crear o actualizar)
 */
async function guardarFigura() {
    const figuraKey = document.getElementById('figura-id').value;
    const figura = {
        SeccionOrden: document.getElementById('figura-seccion-orden').value.trim(),
        OrdenFigura: document.getElementById('figura-orden').value.trim(),
        RutaArchivo: document.getElementById('figura-ruta').value.trim(),
        Caption: document.getElementById('figura-caption').value.trim(),
        Fuente: document.getElementById('figura-fuente').value.trim()
    };

    // Validar campos requeridos
    if (!figura.SeccionOrden) {
        mostrarError('La sección es obligatoria');
        return;
    }

    if (!figura.OrdenFigura) {
        mostrarError('El orden de la figura es obligatorio');
        return;
    }

    if (!figura.RutaArchivo) {
        mostrarError('La ruta de la imagen es obligatoria');
        return;
    }

    // Validar orden jerárquico dentro de la sección
    try {
        const todasFiguras = await api.obtenerFiguras(editor.docId);
        const figurasEnSeccion = todasFiguras.filter(f =>
            String(f.SeccionOrden) === String(figura.SeccionOrden) &&
            !(figuraKey && String(f.SeccionOrden) === figuraKey.split('-')[0] && String(f.OrdenFigura) === figuraKey.split('-')[1])
        );

        const ordenesExistentes = figurasEnSeccion.map(f => parseInt(f.OrdenFigura)).sort((a, b) => a - b);
        const nuevoOrden = parseInt(figura.OrdenFigura);

        // Validar que el orden sea secuencial
        if (ordenesExistentes.length > 0) {
            const maxOrden = Math.max(...ordenesExistentes);

            // Si es una figura nueva, debe ser el siguiente número
            if (!figuraKey && nuevoOrden !== maxOrden + 1 && nuevoOrden !== 1) {
                mostrarError(`⚠️ Orden incorrecto. En la sección ${figura.SeccionOrden} ya hay ${ordenesExistentes.length} figura(s).\nEl siguiente orden debe ser ${maxOrden + 1} o puedes usar 1 si es la primera.`);
                return;
            }

            // Verificar que no haya duplicados
            if (ordenesExistentes.includes(nuevoOrden)) {
                mostrarError(`⚠️ Ya existe una figura con orden ${nuevoOrden} en la sección ${figura.SeccionOrden}`);
                return;
            }

            // Verificar que no haya saltos (ej: 1, 2, 5)
            const todosOrdenes = [...ordenesExistentes, nuevoOrden].sort((a, b) => a - b);
            for (let i = 0; i < todosOrdenes.length; i++) {
                if (todosOrdenes[i] !== i + 1) {
                    mostrarError(`⚠️ Orden jerárquico incorrecto. Las figuras deben numerarse secuencialmente (1, 2, 3...).\nFalta la figura ${i + 1} en la sección ${figura.SeccionOrden}`);
                    return;
                }
            }
        } else {
            // Primera figura en la sección, debe ser orden 1
            if (nuevoOrden !== 1) {
                mostrarError(`⚠️ Esta es la primera figura en la sección ${figura.SeccionOrden}. El orden debe ser 1`);
                return;
            }
        }

    } catch (error) {
        console.error('Error al validar orden:', error);
        mostrarError('Error al validar el orden de la figura');
        return;
    }

    try {
        showLoading('Guardando figura...');

        if (figuraKey) {
            // Actualizar - parse composite key
            const [seccion, orden] = figuraKey.split('-');
            await api.actualizarFigura(editor.docId, figuraKey, figura);
            mostrarExito('✅ Figura actualizada correctamente');
        } else {
            // Crear
            await api.crearFigura(editor.docId, figura);
            mostrarExito('✅ Figura creada correctamente');
        }

        cerrarModal('modal-figura');
        await cargarFiguras();

    } catch (error) {
        console.error('Error al guardar figura:', error);
        mostrarError('❌ Error al guardar figura: ' + error.message);
    } finally {
        hideLoading();
    }
}

/**
 * Confirmar eliminación de figura
 */
function confirmarEliminarFigura(figuraKey) {
    if (confirm('¿Estás seguro de eliminar esta figura?\n\nEsta acción no se puede deshacer.')) {
        eliminarFigura(figuraKey);
    }
}

/**
 * Eliminar figura
 */
async function eliminarFigura(figuraKey) {
    try {
        showLoading('Eliminando figura...');
        // Parse composite key
        const [seccion, orden] = figuraKey.split('-');
        await api.eliminarFigura(editor.docId, figuraKey);
        await cargarFiguras();
        mostrarExito('✅ Figura eliminada correctamente');
    } catch (error) {
        console.error('Error al eliminar figura:', error);
        mostrarError('❌ Error al eliminar figura: ' + error.message);
    } finally {
        hideLoading();
    }
}

/**
 * Seleccionar imagen para figura desde el sistema local
 */
function seleccionarImagenFigura() {
    const input = document.getElementById('file-figura');
    input.click();

    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tipo de archivo
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            mostrarError('❌ Formato no válido. Solo se permiten PNG y JPG');
            return;
        }

        showLoading('Subiendo imagen...');

        try {
            const resultado = await api.subirImagen(file, 'img/graficos');

            if (resultado.success) {
                document.getElementById('figura-ruta').value = resultado.ruta;
                mostrarExito('✅ Imagen subida correctamente');
            } else {
                throw new Error(resultado.message || 'Error al subir imagen');
            }
        } catch (error) {
            console.error('Error al subir imagen:', error);
            mostrarError('❌ Error al subir imagen: ' + error.message);
        } finally {
            hideLoading();
        }
    };
}
