/**
 * SENER LaTeX Editor - Editor de Documento
 */

// Estado del editor
const editor = {
    docId: null,
    documento: null,
    cambiosPendientes: false,
    autoguardadoInterval: null
};

/**
 * Inicializar editor
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando Editor...');

    // Obtener ID del documento desde URL
    const urlParams = new URLSearchParams(window.location.search);
    editor.docId = urlParams.get('id');

    if (!editor.docId) {
        alert('❌ No se especificó un documento');
        window.location.href = 'index.html';
        return;
    }

    // Cargar documento
    await cargarDocumento();

    // Ocultar preloader
    hidePreloader();

    // Setup event listeners
    setupEventListeners();

    // Iniciar autoguardado
    iniciarAutoguardado();
});

/**
 * Cargar documento desde Google Sheets público
 */
async function cargarDocumento() {
    try {
        showLoading('Cargando documento desde Google Sheets...');

        // Cargar todos los datos del Google Sheets público
        const datos = await cargarTodosDatos();

        // Buscar el documento por ID
        const docMetadata = datos.documentos.find(doc => doc.ID === editor.docId);

        if (!docMetadata) {
            throw new Error(`No se encontró el documento con ID: ${editor.docId}`);
        }

        // Filtrar secciones, tablas y figuras de este documento
        const documento = {
            metadata: docMetadata,
            secciones: datos.secciones.filter(s => s.DocumentoID === editor.docId),
            tablas: datos.tablas.filter(t => t.DocumentoID === editor.docId),
            figuras: datos.figuras.filter(f => f.DocumentoID === editor.docId),
            bibliografia: datos.bibliografia.filter(b => b.DocumentoID === editor.docId),
            siglas: datos.siglas.filter(s => s.DocumentoID === editor.docId),
            glosario: datos.glosario.filter(g => g.DocumentoID === editor.docId)
        };

        console.log('✅ Documento cargado:', documento);

        editor.documento = documento;

        // Renderizar datos
        renderMetadatos(documento.metadata);
        renderSecciones(documento.secciones);
        renderTablas(documento.tablas);
        renderFiguras(documento.figuras);
        renderBibliografia(documento.bibliografia);
        renderSiglas(documento.siglas);
        renderGlosario(documento.glosario);

        // Actualizar título del header
        document.getElementById('documento-titulo').textContent =
            documento.metadata.Titulo || 'Sin título';

        console.log('📄 Documento cargado:', documento);

    } catch (error) {
        console.error('Error al cargar documento:', error);
        alert('❌ No se pudo cargar el documento');
        window.location.href = 'index.html';
    } finally {
        hideLoading();
    }
}

/**
 * Renderizar metadatos en el formulario
 */
function renderMetadatos(metadata) {
    console.log('📋 Renderizando metadatos:', metadata);

    document.getElementById('input-id').value = metadata.ID || '';
    document.getElementById('input-titulo').value = metadata.Titulo || '';
    document.getElementById('input-subtitulo').value = metadata.Subtitulo || '';
    document.getElementById('input-autor').value = metadata.Autor || '';

    // Fecha - manejar diferentes formatos
    if (metadata.Fecha) {
        try {
            let fechaISO;
            if (metadata.Fecha instanceof Date) {
                fechaISO = metadata.Fecha.toISOString().split('T')[0];
            } else if (typeof metadata.Fecha === 'string') {
                // Intentar parsear la fecha
                const fecha = new Date(metadata.Fecha);
                if (!isNaN(fecha.getTime())) {
                    fechaISO = fecha.toISOString().split('T')[0];
                }
            }
            if (fechaISO) {
                document.getElementById('input-fecha').value = fechaISO;
            }
        } catch (error) {
            console.warn('Error al parsear fecha:', error);
        }
    }

    document.getElementById('input-institucion').value = metadata.Institucion || '';
    document.getElementById('input-unidad').value = metadata.Unidad || '';
    document.getElementById('input-documento-corto').value = metadata.DocumentoCorto || '';
    document.getElementById('input-version').value = metadata.Version || '';
    document.getElementById('input-palabras-clave').value = metadata.PalabrasClave || '';
    document.getElementById('input-portada-ruta').value = metadata.PortadaRuta || '';
    document.getElementById('input-contraportada-ruta').value = metadata.ContraportadaRuta || '';
    document.getElementById('input-resumen').value = metadata.ResumenEjecutivo || '';
    document.getElementById('input-datos-clave').value = metadata.DatosClave || '';

    // Marcar campos requeridos visualmente
    marcarCamposRequeridos();
}

/**
 * Marcar campos requeridos visualmente
 */
function marcarCamposRequeridos() {
    const camposRequeridos = ['input-titulo', 'input-autor'];

    camposRequeridos.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('blur', function () {
                if (!this.value.trim()) {
                    this.style.borderColor = '#dc3545';
                } else {
                    this.style.borderColor = '';
                }
            });
        }
    });
}

/**
 * Renderizar secciones
 */
function renderSecciones(secciones) {
    const container = document.getElementById('secciones-lista');

    if (!secciones || secciones.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-list"></i>
                <p>No hay secciones. Crea una nueva para comenzar.</p>
            </div>
        `;
        return;
    }

    // Ordenar por orden
    secciones.sort((a, b) => parseFloat(a.Orden) - parseFloat(b.Orden));

    container.innerHTML = secciones.map(seccion => {
        const nivelClass = getNivelClass(seccion.Nivel);
        return `
            <div class="seccion-item ${nivelClass}" data-orden="${seccion.Orden}">
                <div class="seccion-header">
                    <div class="seccion-info">
                        <div class="seccion-orden">${seccion.Orden}</div>
                        <h4 class="seccion-titulo">${seccion.Titulo}</h4>
                        <div class="seccion-nivel">${seccion.Nivel}</div>
                    </div>
                    <div class="seccion-actions">
                        <button class="btn-icon" onclick="editarSeccion('${seccion.Orden}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" onclick="eliminarSeccion('${seccion.Orden}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Obtener clase CSS según nivel de sección
 */
function getNivelClass(nivel) {
    const nivelLower = (nivel || '').toLowerCase();
    if (nivelLower.includes('subsub')) return 'nivel-subsubseccion';
    if (nivelLower.includes('sub')) return 'nivel-subseccion';
    return 'nivel-seccion';
}

/**
 * Renderizar tablas
 */
function renderTablas(tablas) {
    const container = document.getElementById('tablas-lista');

    if (!tablas || tablas.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-table"></i>
                <p>No hay tablas. Crea una nueva para comenzar.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = tablas.map(tabla => `
        <div class="item-card">
            <div class="item-card-header">
                <h4 class="item-card-title">${tabla.Titulo}</h4>
                <div class="item-card-actions">
                    <button class="btn-icon" onclick="editarTabla('${tabla.SeccionOrden}-${tabla.OrdenTabla}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="eliminarTabla('${tabla.SeccionOrden}-${tabla.OrdenTabla}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="item-card-meta">
                Sección: ${tabla.SeccionOrden} | Orden: ${tabla.OrdenTabla}
            </div>
            <div class="item-card-meta">
                Datos: ${tabla.DatosCSV || 'No especificado'}
            </div>
        </div>
    `).join('');
}

/**
 * Renderizar figuras
 */
function renderFiguras(figuras) {
    const container = document.getElementById('figuras-lista');

    if (!figuras || figuras.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-image"></i>
                <p>No hay figuras. Agrega una nueva para comenzar.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = figuras.map(figura => `
        <div class="item-card">
            <div class="item-card-header">
                <h4 class="item-card-title">${figura.Caption}</h4>
                <div class="item-card-actions">
                    <button class="btn-icon" onclick="editarFigura('${figura.SeccionOrden}-${figura.OrdenFigura}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="eliminarFigura('${figura.SeccionOrden}-${figura.OrdenFigura}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="item-card-meta">
                Sección: ${figura.SeccionOrden} | Orden: ${figura.OrdenFigura}
            </div>
            <div class="item-card-meta">
                Archivo: ${figura.RutaArchivo || 'No especificado'}
            </div>
        </div>
    `).join('');
}

/**
 * Renderizar bibliografía (Vista Tabla)
 */
function renderBibliografia(bibliografia) {
    const container = document.getElementById('bibliografia-lista');
    const tbody = container.querySelector('tbody');

    if (!bibliografia || bibliografia.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <i class="fas fa-book" style="font-size: 2rem;"></i>
                    <p>No hay referencias. Agrega una nueva para comenzar.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = bibliografia.map(item => `
        <tr>
            <td><strong>${item.Clave}</strong></td>
            <td>${item.Tipo || 'misc'}</td>
            <td>${item.Anio || 's/f'}</td>
            <td>
                <strong>${item.Autor || 'Autor desconocido'}</strong>. 
                <em>${item.Titulo || 'Sin título'}</em>.
                ${item.Editorial ? item.Editorial : ''}
            </td>
            <td class="col-actions">
                <button class="btn-icon" onclick="editarBibliografia('${item.Clave}')" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" onclick="eliminarBibliografia('${item.Clave}')" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Renderizar siglas (Vista Tabla)
 */
function renderSiglas(siglas) {
    const container = document.getElementById('siglas-lista');
    const tbody = container.querySelector('tbody');

    if (!siglas || siglas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="empty-state">
                    <i class="fas fa-font" style="font-size: 2rem;"></i>
                    <p>No hay siglas. Agrega una nueva para comenzar.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = siglas.map(item => `
        <tr>
            <td><strong>${item.Sigla}</strong></td>
            <td>${item.Descripcion || ''}</td>
            <td class="col-actions">
                <button class="btn-icon" onclick="editarSigla('${item.Sigla}')" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" onclick="eliminarSigla('${item.Sigla}')" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Renderizar glosario (Vista Tabla)
 */
function renderGlosario(glosario) {
    const container = document.getElementById('glosario-lista');
    const tbody = container.querySelector('tbody');

    if (!glosario || glosario.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="empty-state">
                    <i class="fas fa-spell-check" style="font-size: 2rem;"></i>
                    <p>No hay términos en el glosario.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = glosario.map(item => `
        <tr>
            <td><strong>${item.Termino}</strong></td>
            <td>${item.Definicion || ''}</td>
            <td class="col-actions">
                <button class="btn-icon" onclick="editarGlosario('${item.Termino}')" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" onclick="eliminarGlosario('${item.Termino}')" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Tabs
    document.querySelectorAll('.editor-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchTab(tabName);
        });
    });

    // Botón guardar
    document.getElementById('btn-guardar').addEventListener('click', guardarCambios);

    // Botón generar .tex
    document.getElementById('btn-generar').addEventListener('click', generarTex);

    // Detectar cambios en formularios
    document.querySelectorAll('.form-control').forEach(input => {
        input.addEventListener('input', () => {
            editor.cambiosPendientes = true;
        });
    });

    // Botones de nueva entidad
    document.getElementById('btn-nueva-seccion')?.addEventListener('click', () => {
        alert('Función en desarrollo: Nueva Sección');
    });

    document.getElementById('btn-nueva-tabla')?.addEventListener('click', () => {
        alert('Función en desarrollo: Nueva Tabla');
    });

    document.getElementById('btn-nueva-figura')?.addEventListener('click', () => {
        alert('Función en desarrollo: Nueva Figura');
    });

    document.getElementById('btn-nueva-bibliografia')?.addEventListener('click', () => {
    });
}

/**
 * Cambiar de tab
 */
function switchTab(tabName) {
    // Actualizar tabs
    document.querySelectorAll('.editor-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Actualizar contenido
    document.querySelectorAll('.editor-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

/**
 * Guardar cambios
 */
async function guardarCambios() {
    try {
        showLoading('Guardando cambios...');

        // Validar campos requeridos
        const titulo = document.getElementById('input-titulo').value.trim();
        const autor = document.getElementById('input-autor').value.trim();

        if (!titulo) {
            mostrarError('El título es obligatorio');
            hideLoading();
            return;
        }

        if (!autor) {
            mostrarError('El autor es obligatorio');
            hideLoading();
            return;
        }

        // Recopilar datos del formulario
        const metadata = {
            ID: document.getElementById('input-id').value,
            Titulo: titulo,
            Subtitulo: document.getElementById('input-subtitulo').value.trim(),
            Autor: autor,
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

        console.log('📝 Guardando metadatos:', metadata);

        // Por ahora solo guardamos localmente (sin backend)
        editor.documento.metadata = metadata;
        editor.cambiosPendientes = false;

        mostrarExito('✅ Cambios guardados localmente. Nota: Para guardar en Google Sheets necesitas configurar el backend.');

    } catch (error) {
        console.error('Error al guardar:', error);
        mostrarError('No se pudieron guardar los cambios: ' + error.message);
    } finally {
        hideLoading();
    }
}

/**
 * Generar .tex
 */
async function generarTex() {
    try {
        showLoading('Generando archivo .tex...');

        // Llamar a la API
        const resultado = await api.generarTex(editor.docId);

        if (resultado.success) {
            // Descargar el archivo
            descargarArchivo(resultado.contenido, resultado.nombreArchivo);
            mostrarExito('Archivo .tex generado correctamente');
        } else {
            throw new Error(resultado.message || 'Error al generar');
        }

    } catch (error) {
        console.error('Error al generar .tex:', error);
        mostrarError('No se pudo generar el archivo .tex: ' + error.message);
    } finally {
        hideLoading();
    }
}

/**
 * Descargar archivo de texto
 */
function descargarArchivo(contenido, nombreArchivo) {
    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Iniciar autoguardado
 */
function iniciarAutoguardado() {
    editor.autoguardadoInterval = setInterval(() => {
        if (editor.cambiosPendientes) {
            console.log('💾 Autoguardando...');
            guardarCambios();
        }
    }, 30000); // Cada 30 segundos
}

/**
 * Funciones de edición (placeholder)
 */
function editarSeccion(orden) {
    console.log('Editar sección:', orden);
    alert('Función en desarrollo: Editar Sección');
}

function eliminarSeccion(orden) {
    if (confirm('¿Estás seguro de eliminar esta sección?')) {
        console.log('Eliminar sección:', orden);
        alert('Función en desarrollo: Eliminar Sección');
    }
}

function editarTabla(id) {
    console.log('Editar tabla:', id);
    alert('Función en desarrollo: Editar Tabla');
}

function eliminarTabla(id) {
    if (confirm('¿Estás seguro de eliminar esta tabla?')) {
        console.log('Eliminar tabla:', id);
        alert('Función en desarrollo: Eliminar Tabla');
    }
}

function editarFigura(id) {
    console.log('Editar figura:', id);
    alert('Función en desarrollo: Editar Figura');
}

function eliminarFigura(id) {
    if (confirm('¿Estás seguro de eliminar esta figura?')) {
        console.log('Eliminar figura:', id);
        alert('Función en desarrollo: Eliminar Figura');
    }
}


// ==========================================
// Módulos de Edición (Bibliografía, Siglas, Glosario)
// ==========================================

// --- UTILIDADES MODAL ---
function abrirModal(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex'); // Asumiendo que usamos flex para centrar
    }
}

function cerrarModal(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// Cerrar modal al hacer clic fuera
window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.add('hidden');
        event.target.classList.remove('flex');
    }
}


// --- BIBLIOGRAFÍA ---

function editarBibliografia(clave) {
    const item = editor.documento.bibliografia.find(b => b.Clave === clave);
    if (!item) return;

    // Poblar formulario
    document.getElementById('bib-clave').value = item.Clave || '';
    document.getElementById('bib-tipo').value = item.Tipo || 'misc';
    document.getElementById('bib-titulo').value = item.Titulo || '';
    document.getElementById('bib-autor').value = item.Autor || '';
    document.getElementById('bib-anio').value = item.Anio || '';
    document.getElementById('bib-editorial').value = item.Editorial || '';
    document.getElementById('bib-url').value = item.Url || '';

    abrirModal('modal-bibliografia');
}

function guardarModalBibliografia() {
    const clave = document.getElementById('bib-clave').value;

    // Buscar índice
    const index = editor.documento.bibliografia.findIndex(b => b.Clave === clave);
    if (index === -1) return; // O manejar creación nueva si fuera el caso

    // Actualizar objeto
    editor.documento.bibliografia[index] = {
        ...editor.documento.bibliografia[index],
        Tipo: document.getElementById('bib-tipo').value,
        Titulo: document.getElementById('bib-titulo').value,
        Autor: document.getElementById('bib-autor').value,
        Anio: document.getElementById('bib-anio').value,
        Editorial: document.getElementById('bib-editorial').value,
        Url: document.getElementById('bib-url').value
    };

    editor.cambiosPendientes = true;
    renderBibliografia(editor.documento.bibliografia);
    cerrarModal('modal-bibliografia');
    mostrarExito('Referencia actualizada localmente');
}

function eliminarBibliografia(clave) {
    if (confirm(`¿Estás seguro de eliminar la referencia "${clave}"?`)) {
        editor.documento.bibliografia = editor.documento.bibliografia.filter(b => b.Clave !== clave);
        editor.cambiosPendientes = true;
        renderBibliografia(editor.documento.bibliografia);
    }
}


// --- SIGLAS ---

function editarSigla(siglaId) {
    const item = editor.documento.siglas.find(s => s.Sigla === siglaId);
    if (!item) return;

    // Guardar el ID original para poder actualizar después
    document.getElementById('sigla-id').value = item.Sigla || '';
    document.getElementById('sigla-id').readOnly = false; // Permitir editar el nombre
    document.getElementById('sigla-id').dataset.originalId = item.Sigla; // Guardar ID original
    document.getElementById('sigla-descripcion').value = item.Descripcion || '';

    // Marcar como modo edición
    document.getElementById('modal-siglas').dataset.mode = 'edit';
    document.querySelector('#modal-siglas .modal-title').textContent = 'Editar Sigla';

    abrirModal('modal-siglas');
}

function nuevaSigla() {
    // Limpiar formulario
    document.getElementById('sigla-id').value = '';
    document.getElementById('sigla-id').readOnly = false; // Permitir editar ID en modo creación
    document.getElementById('sigla-descripcion').value = '';

    // Marcar como modo creación
    document.getElementById('modal-siglas').dataset.mode = 'create';
    document.querySelector('#modal-siglas .modal-title').textContent = 'Nueva Sigla';

    abrirModal('modal-siglas');
}

async function guardarModalSiglas() {
    const id = document.getElementById('sigla-id').value.trim();
    const descripcion = document.getElementById('sigla-descripcion').value.trim();
    const mode = document.getElementById('modal-siglas').dataset.mode || 'edit';

    if (!id) {
        mostrarError('La sigla no puede estar vacía');
        return;
    }

    try {
        showLoading(mode === 'create' ? 'Creando sigla...' : 'Guardando cambios...');

        let resultado;

        if (mode === 'create') {
            // Crear nueva sigla
            resultado = await api.crearSigla(editor.docId, id, descripcion);

            if (resultado.status === 'success') {
                // Agregar localmente
                editor.documento.siglas.push({
                    DocumentoID: editor.docId,
                    Sigla: id,
                    Descripcion: descripcion
                });

                renderSiglas(editor.documento.siglas);
                cerrarModal('modal-siglas');
                mostrarExito('✅ Sigla creada correctamente');
            } else {
                throw new Error(resultado.message || 'Error al crear sigla');
            }
        } else {
            // Actualizar sigla existente
            const originalId = document.getElementById('sigla-id').dataset.originalId || id;
            const index = editor.documento.siglas.findIndex(s => s.Sigla === originalId);

            if (index === -1) {
                throw new Error('Sigla no encontrada');
            }

            // Si el nombre cambió, necesitamos eliminar la vieja y crear una nueva
            if (originalId !== id) {
                // Eliminar la vieja
                await api.eliminarSigla(editor.docId, originalId);
                // Crear la nueva
                resultado = await api.crearSigla(editor.docId, id, descripcion);

                if (resultado.status === 'success') {
                    // Actualizar localmente
                    editor.documento.siglas[index] = {
                        DocumentoID: editor.docId,
                        Sigla: id,
                        Descripcion: descripcion
                    };
                    renderSiglas(editor.documento.siglas);
                    cerrarModal('modal-siglas');
                    mostrarExito('✅ Sigla actualizada correctamente');
                } else {
                    throw new Error(resultado.message || 'Error al actualizar sigla');
                }
            } else {
                // Solo actualizar descripción
                resultado = await api.guardarSigla(editor.docId, id, descripcion);

                if (resultado.status === 'success') {
                    editor.documento.siglas[index].Descripcion = descripcion;
                    renderSiglas(editor.documento.siglas);
                    cerrarModal('modal-siglas');
                    mostrarExito('✅ Sigla actualizada correctamente');
                } else {
                    throw new Error(resultado.message || 'Error al actualizar sigla');
                }
            }
        }

    } catch (error) {
        console.error('Error al guardar sigla:', error);
        mostrarError('❌ Error: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function eliminarSigla(id) {
    // Configurar modal de confirmación
    document.getElementById('confirmar-mensaje').textContent =
        `¿Estás seguro de eliminar la sigla "${id}"? Esta acción no se puede deshacer.`;

    // Configurar el botón de confirmar
    const btnConfirmar = document.getElementById('btn-confirmar-accion');

    // Limpiar listeners anteriores clonando el botón
    const nuevoBtn = btnConfirmar.cloneNode(true);
    btnConfirmar.parentNode.replaceChild(nuevoBtn, btnConfirmar);

    // Agregar nuevo listener
    nuevoBtn.addEventListener('click', async () => {
        cerrarModal('modal-confirmar');

        try {
            showLoading('Eliminando sigla...');

            const resultado = await api.eliminarSigla(editor.docId, id);

            if (resultado.status === 'success') {
                // Eliminar localmente
                editor.documento.siglas = editor.documento.siglas.filter(s => s.Sigla !== id);
                renderSiglas(editor.documento.siglas);
                mostrarExito('✅ Sigla eliminada correctamente');
            } else {
                throw new Error(resultado.message || 'Error al eliminar sigla');
            }

        } catch (error) {
            console.error('Error al eliminar sigla:', error);
            mostrarError('❌ Error: ' + error.message);
        } finally {
            hideLoading();
        }
    });

    // Abrir modal de confirmación
    abrirModal('modal-confirmar');
}


// --- GLOSARIO ---

function editarGlosario(termino) {
    const item = editor.documento.glosario.find(g => g.Termino === termino);
    if (!item) return;

    document.getElementById('glosario-termino').value = item.Termino || '';
    document.getElementById('glosario-termino').readOnly = true;
    document.getElementById('glosario-definicion').value = item.Definicion || '';

    abrirModal('modal-glosario');
}

function guardarModalGlosario() {
    const termino = document.getElementById('glosario-termino').value;
    const index = editor.documento.glosario.findIndex(g => g.Termino === termino);

    if (index === -1) return;

    editor.documento.glosario[index] = {
        ...editor.documento.glosario[index],
        Definicion: document.getElementById('glosario-definicion').value
    };

    editor.cambiosPendientes = true;
    renderGlosario(editor.documento.glosario);
    cerrarModal('modal-glosario');
    mostrarExito('Término actualizado localmente');
}

function eliminarGlosario(termino) {
    if (confirm(`¿Eliminar término "${termino}"?`)) {
        editor.documento.glosario = editor.documento.glosario.filter(g => g.Termino !== termino);
        editor.cambiosPendientes = true;
        renderGlosario(editor.documento.glosario);
    }
}

/**
 * Utilidades
 */
function hidePreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('hidden');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }
}

function showLoading(mensaje = 'Cargando...') {
    console.log('⏳ Loading:', mensaje);

    // Crear overlay si no existe
    let overlay = document.getElementById('loading-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;

        overlay.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 10px; text-align: center;">
                <div class="spinner" style="margin: 0 auto 15px;"></div>
                <p style="margin: 0; color: #621132; font-weight: 600;">${mensaje}</p>
            </div>
        `;

        document.body.appendChild(overlay);
    } else {
        overlay.querySelector('p').textContent = mensaje;
        overlay.style.display = 'flex';
    }
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function mostrarExito(mensaje) {
    console.log('✅', mensaje);
    mostrarNotificacion(mensaje, 'success');
}

function mostrarError(mensaje) {
    console.error('❌', mensaje);
    mostrarNotificacion(mensaje, 'error');
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear notificación
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;

    // Colores según tipo
    const colores = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8',
        warning: '#ffc107'
    };

    notif.style.background = colores[tipo] || colores.info;

    // Icono según tipo
    const iconos = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };

    notif.innerHTML = `${iconos[tipo] || ''} ${mensaje}`;

    document.body.appendChild(notif);

    // Auto-cerrar después de 3 segundos
    setTimeout(() => {
        notif.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// Agregar estilos de animación
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Event listener para botón Nueva Sigla
const btnNuevaSigla = document.getElementById('btn-nueva-sigla');
if (btnNuevaSigla) {
    btnNuevaSigla.addEventListener('click', nuevaSigla);
}

// Limpiar al salir
window.addEventListener('beforeunload', (e) => {
    if (editor.cambiosPendientes) {
        e.preventDefault();
        e.returnValue = '¿Estás seguro? Tienes cambios sin guardar.';
    }

    // Limpiar autoguardado
    if (editor.autoguardadoInterval) {
        clearInterval(editor.autoguardadoInterval);
    }
});
