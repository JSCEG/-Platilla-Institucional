/**
 * ============================================================================
 * FRONTEND METADATOS
 * ============================================================================
 * Funciones para manejar guardado de Metadatos del documento
 */

async function guardarMetadatos() {
    // Recopilar datos del formulario
    const metadatos = {
        Titulo: document.getElementById('input-titulo').value.trim(),
        Subtitulo: document.getElementById('input-subtitulo').value.trim(),
        Autor: document.getElementById('input-autor').value.trim(),
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

    // Validar campos requeridos
    if (!metadatos.Titulo) {
        mostrarError('El título es obligatorio');
        return;
    }

    if (!metadatos.Autor) {
        mostrarError('El autor es obligatorio');
        return;
    }

    try {
        showLoading('Guardando metadatos...');

        const resultado = await api.guardarMetadatos(editor.docId, metadatos);

        if (resultado.status === 'success') {
            // Actualizar localmente
            editor.documento.metadata = {
                ID: editor.docId,
                ...metadatos
            };

            // Actualizar título del header
            document.getElementById('documento-titulo').textContent = metadatos.Titulo;

            mostrarExito('✅ Metadatos guardados correctamente');
        } else {
            throw new Error(resultado.message || 'Error al guardar metadatos');
        }

    } catch (error) {
        console.error('Error al guardar metadatos:', error);
        mostrarError('❌ Error: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Event listener para el botón Guardar del header
// (Este botón guarda metadatos cuando estamos en la pestaña de metadatos)
document.addEventListener('DOMContentLoaded', () => {
    const btnGuardar = document.getElementById('btn-guardar');
    if (btnGuardar) {
        btnGuardar.addEventListener('click', () => {
            // Verificar si estamos en la pestaña de metadatos
            const metadatosTab = document.getElementById('tab-metadatos');
            if (metadatosTab && metadatosTab.classList.contains('active')) {
                guardarMetadatos();
            } else {
                // Si estamos en otra pestaña, mostrar mensaje
                mostrarError('Cambia a la pestaña de Metadatos para guardar');
            }
        });
    }
});

/**
 * Seleccionar imagen de portada desde el sistema local
 */
function seleccionarPortada() {
    const input = document.getElementById('file-portada');
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

        showLoading('Subiendo imagen de portada...');

        try {
            const resultado = await api.subirImagen(file, 'img');

            if (resultado.success) {
                document.getElementById('input-portada-ruta').value = resultado.ruta;
                mostrarExito('✅ Imagen de portada subida correctamente');
            } else {
                throw new Error(resultado.message || 'Error al subir imagen');
            }
        } catch (error) {
            console.error('Error al subir portada:', error);
            mostrarError('❌ Error al subir imagen: ' + error.message);
        } finally {
            hideLoading();
        }
    };
}

/**
 * Seleccionar imagen de contraportada desde el sistema local
 */
function seleccionarContraportada() {
    const input = document.getElementById('file-contraportada');
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

        showLoading('Subiendo imagen de contraportada...');

        try {
            const resultado = await api.subirImagen(file, 'img');

            if (resultado.success) {
                document.getElementById('input-contraportada-ruta').value = resultado.ruta;
                mostrarExito('✅ Imagen de contraportada subida correctamente');
            } else {
                throw new Error(resultado.message || 'Error al subir imagen');
            }
        } catch (error) {
            console.error('Error al subir contraportada:', error);
            mostrarError('❌ Error al subir imagen: ' + error.message);
        } finally {
            hideLoading();
        }
    };
}
