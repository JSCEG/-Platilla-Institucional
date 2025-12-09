// ============================================================================
// FUNCIONES CRUD PARA GLOSARIO Y BIBLIOGRAFÍA
// ============================================================================
// Instrucciones:
// 1. Copia este código
// 2. Pégalo en editor.js DESPUÉS de las funciones de Siglas (después de eliminarSigla)
// 3. Agrega los event listeners al final del archivo (ver sección al final de este archivo)
// ============================================================================

// ========================================================================
// GLOSARIO
// ========================================================================

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

    // Guardar el término original para poder actualizar después
    document.getElementById('glosario-termino').value = item.Termino || '';
    document.getElementById('glosario-termino').readOnly = false; // Permitir editar el nombre
    document.getElementById('glosario-termino').dataset.originalId = item.Termino; // Guardar término original
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
            // Crear nuevo término
            resultado = await api.crearGlosario(editor.docId, termino, definicion);

            if (resultado.status === 'success') {
                // Agregar localmente
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
            // Actualizar término existente
            const originalId = document.getElementById('glosario-termino').dataset.originalId || termino;
            const index = editor.documento.glosario.findIndex(g => g.Termino === originalId);

            if (index === -1) {
                throw new Error('Término no encontrado');
            }

            // Si el nombre cambió, eliminar el viejo y crear uno nuevo
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
                // Solo actualizar definición
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
    // Configurar modal de confirmación
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

// ========================================================================
// BIBLIOGRAFÍA
// ========================================================================

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
    document.getElementById('bib-clave').readOnly = false; // Permitir editar
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
            // Crear nueva referencia
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
            // Actualizar referencia existente
            const originalId = document.getElementById('bib-clave').dataset.originalId || clave;
            const index = editor.documento.bibliografia.findIndex(b => b.Clave === originalId);

            if (index === -1) {
                throw new Error('Referencia no encontrada');
            }

            // Si la clave cambió, eliminar la vieja y crear una nueva
            if (originalId !== clave) {
                await api.eliminarBibliografia(editor.docId, originalId);
                resultado = await api.crearBibliografia(editor.docId, datos);

                if (resultado.status === 'success') {
                    editor.documento.bibliografia[index] = {
                        DocumentoID: editor.docId,
                        ...datos
                    };
                    renderBibliografia(editor.documento.bibliografia);
                    cerrarModal('modal-bibliografia');
                    mostrarExito('✅ Referencia actualizada correctamente');
                } else {
                    throw new Error(resultado.message || 'Error al actualizar referencia');
                }
            } else {
                // Solo actualizar datos
                resultado = await api.guardarBibliografia(editor.docId, datos);

                if (resultado.status === 'success') {
                    editor.documento.bibliografia[index] = {
                        DocumentoID: editor.docId,
                        ...datos
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
    // Configurar modal de confirmación
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

// ============================================================================
// EVENT LISTENERS - Agregar al final de editor.js
// ============================================================================

// Event listener para botón Nuevo Glosario
const btnNuevoGlosario = document.getElementById('btn-nuevo-glosario');
if (btnNuevoGlosario) {
    btnNuevoGlosario.addEventListener('click', nuevoGlosario);
}

// Event listener para botón Nueva Bibliografía
const btnNuevaBibliografia = document.getElementById('btn-nueva-bibliografia');
if (btnNuevaBibliografia) {
    btnNuevaBibliografia.addEventListener('click', nuevaBibliografia);
}
