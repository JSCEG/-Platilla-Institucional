/**
 * ============================================================================
 * FRONTEND BIBLIOGRAFÍA
 * ============================================================================
 * Funciones para manejar CRUD de Bibliografía en el editor web
 */

function nuevaBibliografia() {
    // Limpiar formulario
    document.getElementById('bib-clave').value = '';
    document.getElementById('bib-clave').readOnly = false;
    document.getElementById('bib-tipo').value = 'report';
    document.getElementById('bib-titulo').value = '';
    document.getElementById('bib-autor').value = '';
    document.getElementById('bib-anio').value = '';
    document.getElementById('bib-editorial').value = '';
    document.getElementById('bib-url').value = '';

    // Marcar como modo creación
    document.getElementById('modal-bibliografia').dataset.mode = 'create';
    document.querySelector('#modal-bibliografia .modal-title').textContent = 'Nueva Referencia';

    abrirModal('modal-bibliografia');
}

function editarBibliografia(clave) {
    const item = editor.documento.bibliografia.find(b => b.Clave === clave);
    if (!item) return;

    // Guardar la clave original
    document.getElementById('bib-clave').value = item.Clave || '';
    document.getElementById('bib-clave').readOnly = false;
    document.getElementById('bib-clave').dataset.originalId = item.Clave;
    document.getElementById('bib-tipo').value = item.Tipo || 'report';
    document.getElementById('bib-titulo').value = item.Titulo || '';
    document.getElementById('bib-autor').value = item.Autor || '';
    document.getElementById('bib-anio').value = item.Anio || '';
    document.getElementById('bib-editorial').value = item.Editorial || '';
    document.getElementById('bib-url').value = item.Url || '';

    // Marcar como modo edición
    document.getElementById('modal-bibliografia').dataset.mode = 'edit';
    document.querySelector('#modal-bibliografia .modal-title').textContent = 'Editar Referencia';

    abrirModal('modal-bibliografia');
}

async function guardarModalBibliografia() {
    const clave = document.getElementById('bib-clave').value.trim();
    const tipo = document.getElementById('bib-tipo').value;
    const titulo = document.getElementById('bib-titulo').value.trim();
    const autor = document.getElementById('bib-autor').value.trim();
    const anio = document.getElementById('bib-anio').value.trim();
    const editorial = document.getElementById('bib-editorial').value.trim();
    const url = document.getElementById('bib-url').value.trim();
    const mode = document.getElementById('modal-bibliografia').dataset.mode || 'edit';

    if (!clave) {
        mostrarError('La clave no puede estar vacía');
        return;
    }

    const datos = { clave, tipo, autor, titulo, anio, editorial, url };

    try {
        showLoading(mode === 'create' ? 'Creando referencia...' : 'Guardando cambios...');

        let resultado;

        if (mode === 'create') {
            resultado = await api.crearBibliografia(editor.docId, datos);

            if (resultado.status === 'success') {
                editor.documento.bibliografia.push({
                    DocumentoID: editor.docId,
                    Clave: clave,
                    Tipo: tipo,
                    Autor: autor,
                    Titulo: titulo,
                    Anio: anio,
                    Editorial: editorial,
                    Url: url
                });

                renderBibliografia(editor.documento.bibliografia);
                cerrarModal('modal-bibliografia');
                mostrarExito('✅ Referencia creada correctamente');
            } else {
                throw new Error(resultado.message || 'Error al crear referencia');
            }
        } else {
            const originalId = document.getElementById('bib-clave').dataset.originalId || clave;
            const index = editor.documento.bibliografia.findIndex(b => b.Clave === originalId);

            if (index === -1) {
                throw new Error('Referencia no encontrada');
            }

            if (originalId !== clave) {
                await api.eliminarBibliografia(editor.docId, originalId);
                resultado = await api.crearBibliografia(editor.docId, datos);

                if (resultado.status === 'success') {
                    editor.documento.bibliografia[index] = {
                        DocumentoID: editor.docId,
                        Clave: clave,
                        Tipo: tipo,
                        Autor: autor,
                        Titulo: titulo,
                        Anio: anio,
                        Editorial: editorial,
                        Url: url
                    };
                    renderBibliografia(editor.documento.bibliografia);
                    cerrarModal('modal-bibliografia');
                    mostrarExito('✅ Referencia actualizada correctamente');
                } else {
                    throw new Error(resultado.message || 'Error al actualizar referencia');
                }
            } else {
                resultado = await api.guardarBibliografia(editor.docId, datos);

                if (resultado.status === 'success') {
                    editor.documento.bibliografia[index] = {
                        DocumentoID: editor.docId,
                        Clave: clave,
                        Tipo: tipo,
                        Autor: autor,
                        Titulo: titulo,
                        Anio: anio,
                        Editorial: editorial,
                        Url: url
                    };
                    renderBibliografia(editor.documento.bibliografia);
                    cerrarModal('modal-bibliografia');
                    mostrarExito('✅ Referencia actualizada correctamente');
                } else {
                    throw new Error(resultado.message || 'Error al actualizar referencia');
                }
            }
        }

    } catch (error) {
        console.error('Error al guardar referencia:', error);
        mostrarError('❌ Error: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function eliminarBibliografia(clave) {
    document.getElementById('confirmar-mensaje').textContent =
        `¿Estás seguro de eliminar la referencia "${clave}"? Esta acción no se puede deshacer.`;

    const btnConfirmar = document.getElementById('btn-confirmar-accion');
    const nuevoBtn = btnConfirmar.cloneNode(true);
    btnConfirmar.parentNode.replaceChild(nuevoBtn, btnConfirmar);

    nuevoBtn.addEventListener('click', async () => {
        cerrarModal('modal-confirmar');

        try {
            showLoading('Eliminando referencia...');

            const resultado = await api.eliminarBibliografia(editor.docId, clave);

            if (resultado.status === 'success') {
                editor.documento.bibliografia = editor.documento.bibliografia.filter(b => b.Clave !== clave);
                renderBibliografia(editor.documento.bibliografia);
                mostrarExito('✅ Referencia eliminada correctamente');
            } else {
                throw new Error(resultado.message || 'Error al eliminar referencia');
            }

        } catch (error) {
            console.error('Error al eliminar referencia:', error);
            mostrarError('❌ Error: ' + error.message);
        } finally {
            hideLoading();
        }
    });

    abrirModal('modal-confirmar');
}

// Event listener
const btnNuevaBibliografia = document.getElementById('btn-nueva-bibliografia');
if (btnNuevaBibliografia) {
    btnNuevaBibliografia.addEventListener('click', nuevaBibliografia);
}
