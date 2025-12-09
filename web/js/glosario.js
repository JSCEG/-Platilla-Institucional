/**
 * ============================================================================
 * FRONTEND GLOSARIO
 * ============================================================================
 * Funciones para manejar CRUD de Glosario en el editor web
 */

function nuevoGlosario() {
    // Limpiar formulario
    document.getElementById('glosario-termino').value = '';
    document.getElementById('glosario-termino').readOnly = false;
    document.getElementById('glosario-definicion').value = '';

    // Marcar como modo creación
    document.getElementById('modal-glosario').dataset.mode = 'create';
    document.querySelector('#modal-glosario .modal-title').textContent = 'Nuevo Término';

    abrirModal('modal-glosario');
}

function editarGlosario(termino) {
    const item = editor.documento.glosario.find(g => g.Termino === termino);
    if (!item) return;

    // Guardar el término original
    document.getElementById('glosario-termino').value = item.Termino || '';
    document.getElementById('glosario-termino').readOnly = false;
    document.getElementById('glosario-termino').dataset.originalId = item.Termino;
    document.getElementById('glosario-definicion').value = item.Definicion || '';

    // Marcar como modo edición
    document.getElementById('modal-glosario').dataset.mode = 'edit';
    document.querySelector('#modal-glosario .modal-title').textContent = 'Editar Término';

    abrirModal('modal-glosario');
}

async function guardarModalGlosario() {
    const termino = document.getElementById('glosario-termino').value.trim();
    const definicion = document.getElementById('glosario-definicion').value.trim();
    const mode = document.getElementById('modal-glosario').dataset.mode || 'edit';

    if (!termino) {
        mostrarError('El término no puede estar vacío');
        return;
    }

    try {
        showLoading(mode === 'create' ? 'Creando término...' : 'Guardando cambios...');

        let resultado;

        if (mode === 'create') {
            resultado = await api.crearGlosario(editor.docId, termino, definicion);

            if (resultado.status === 'success') {
                editor.documento.glosario.push({
                    DocumentoID: editor.docId,
                    Termino: termino,
                    Definicion: definicion
                });

                renderGlosario(editor.documento.glosario);
                cerrarModal('modal-glosario');
                mostrarExito('✅ Término creado correctamente');
            } else {
                throw new Error(resultado.message || 'Error al crear término');
            }
        } else {
            const originalId = document.getElementById('glosario-termino').dataset.originalId || termino;
            const index = editor.documento.glosario.findIndex(g => g.Termino === originalId);

            if (index === -1) {
                throw new Error('Término no encontrado');
            }

            if (originalId !== termino) {
                await api.eliminarGlosario(editor.docId, originalId);
                resultado = await api.crearGlosario(editor.docId, termino, definicion);

                if (resultado.status === 'success') {
                    editor.documento.glosario[index] = {
                        DocumentoID: editor.docId,
                        Termino: termino,
                        Definicion: definicion
                    };
                    renderGlosario(editor.documento.glosario);
                    cerrarModal('modal-glosario');
                    mostrarExito('✅ Término actualizado correctamente');
                } else {
                    throw new Error(resultado.message || 'Error al actualizar término');
                }
            } else {
                resultado = await api.guardarGlosario(editor.docId, termino, definicion);

                if (resultado.status === 'success') {
                    editor.documento.glosario[index].Definicion = definicion;
                    renderGlosario(editor.documento.glosario);
                    cerrarModal('modal-glosario');
                    mostrarExito('✅ Término actualizado correctamente');
                } else {
                    throw new Error(resultado.message || 'Error al actualizar término');
                }
            }
        }

    } catch (error) {
        console.error('Error al guardar término:', error);
        mostrarError('❌ Error: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function eliminarGlosario(termino) {
    document.getElementById('confirmar-mensaje').textContent =
        `¿Estás seguro de eliminar el término "${termino}"? Esta acción no se puede deshacer.`;

    const btnConfirmar = document.getElementById('btn-confirmar-accion');
    const nuevoBtn = btnConfirmar.cloneNode(true);
    btnConfirmar.parentNode.replaceChild(nuevoBtn, btnConfirmar);

    nuevoBtn.addEventListener('click', async () => {
        cerrarModal('modal-confirmar');

        try {
            showLoading('Eliminando término...');

            const resultado = await api.eliminarGlosario(editor.docId, termino);

            if (resultado.status === 'success') {
                editor.documento.glosario = editor.documento.glosario.filter(g => g.Termino !== termino);
                renderGlosario(editor.documento.glosario);
                mostrarExito('✅ Término eliminado correctamente');
            } else {
                throw new Error(resultado.message || 'Error al eliminar término');
            }

        } catch (error) {
            console.error('Error al eliminar término:', error);
            mostrarError('❌ Error: ' + error.message);
        } finally {
            hideLoading();
        }
    });

    abrirModal('modal-confirmar');
}

// Event listener
const btnNuevoGlosario = document.getElementById('btn-nuevo-glosario');
if (btnNuevoGlosario) {
    btnNuevoGlosario.addEventListener('click', nuevoGlosario);
}
