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
