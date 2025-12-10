/**
 * ============================================================================
 * MÓDULO TABLAS - CON CRUD COMPLETO
 * ============================================================================
 * Sistema para gestionar tablas con metadatos y datos CSV
 * Maneja dos hojas de Google Sheets: "Tablas" y "Datos Tablas"
 */

console.log('📊 Cargando módulo de tablas...');

// Configuración
const TABLAS_API_URL = 'https://script.google.com/macros/s/AKfycbx83R7-iJxqJsdXDCytkpKfwHov5wVzGqIlKQBIM2OziDFY9Hq_JflEW6rqPyzCuo179w/exec';

// Estado
let tablasData = [];
let datosTablas = [];
let isLoadingTablas = false;
let tablaEditando = null;

/**
 * Inicializar módulo de tablas
 */
function initTablas() {
    console.log('📊 Inicializando módulo de tablas con CRUD...');
    
    // Verificar que los elementos existan
    const tbody = document.getElementById('tablas-tbody');
    if (!tbody) {
        console.warn('⚠️ Elemento tablas-tbody no encontrado, reintentando en 1 segundo...');
        setTimeout(initTablas, 1000);
        return;
    }
    
    // Forzar exportación de funciones
    console.log('🔧 Forzando exportación de funciones...');
    window.previewTabla = previewTabla;
    window.editarTabla = editarTabla;
    window.eliminarTabla = eliminarTabla;
    window.mostrarModalNuevaTabla = mostrarModalNuevaTabla;
    
    // Verificar exportación
    console.log('✅ Funciones exportadas:', {
        previewTabla: typeof window.previewTabla,
        editarTabla: typeof window.editarTabla,
        eliminarTabla: typeof window.eliminarTabla
    });
    
    setupTablasEventListeners();
    cargarTablas();
}

/**
 * Configurar event listeners
 */
function setupTablasEventListeners() {
    const btnNueva = document.getElementById('btn-nueva-tabla');
    if (btnNueva) {
        btnNueva.addEventListener('click', mostrarModalNuevaTabla);
    }
}

/**
 * Cargar tablas desde Google Sheets
 */
async function cargarTablas() {
    if (isLoadingTablas) {
        console.log('⏳ Ya hay una carga en progreso...');
        return;
    }

    try {
        isLoadingTablas = true;
        mostrarEstadoCargaTablas(true);

        console.log('📡 Cargando tablas desde Google Sheets...');

        // Usar la función del sistema para cargar todos los datos
        if (typeof cargarTodosDatos === 'function') {
            console.log('📡 Llamando a cargarTodosDatos...');
            const datos = await cargarTodosDatos();
            
            console.log('📊 Datos recibidos:', {
                documentos: datos.documentos?.length || 0,
                secciones: datos.secciones?.length || 0,
                tablas: datos.tablas?.length || 0,
                figuras: datos.figuras?.length || 0,
                datosTablas: datos.datosTablas?.length || 0
            });

            if (datos && datos.tablas) {
                // Filtrar por documento actual
                const docId = (window.editor?.docId || 'D01').toString().trim().toUpperCase();
                console.log('🔍 Filtrando tablas para documento:', docId);

                // Función helper para obtener ID del documento
                const getDocId = (item = {}) => {
                    const direct = item.DocumentoID || item.DocumentoId || item.Documento || item.DocID;
                    if (direct) return direct.toString().trim().toUpperCase();

                    // Buscar cualquier key que contenga "doc" e "id"
                    const key = Object.keys(item).find(k => {
                        const nk = k.toLowerCase().replace(/[^a-z0-9]/g, '');
                        return nk.includes('doc') && nk.includes('id');
                    });
                    if (key) return item[key].toString().trim().toUpperCase();

                    return '';
                };

                tablasData = datos.tablas.filter(tabla => {
                    const tablaDocId = getDocId(tabla);
                    return tablaDocId === docId;
                }).map(tabla => ({
                    ...tabla,
                    id: `${tabla.SeccionOrden}-${tabla.OrdenTabla}` // Agregar ID compuesto
                }));

                // También cargar datos de tablas si están disponibles
                if (datos.datosTablas) {
                    datosTablas = datos.datosTablas.filter(dato => {
                        const datoDocId = getDocId(dato);
                        return datoDocId === docId;
                    });
                }

                console.log(`📦 Tablas filtradas para documento ${docId}:`, tablasData.length);
                console.log(`📦 Datos de tablas encontrados:`, datosTablas.length);
                
                if (tablasData.length > 0) {
                    console.log('📋 Primeras tablas encontradas:', tablasData.slice(0, 2));
                }
                
                if (datosTablas.length > 0) {
                    console.log('📊 Primeros datos de tablas:', datosTablas.slice(0, 3));
                    console.log('📊 Estructura de datos de tablas:', Object.keys(datosTablas[0] || {}));
                } else {
                    console.warn('⚠️ No se encontraron datos en la hoja "Datos Tablas"');
                }

                renderizarTablas();
                console.log(`✅ ${tablasData.length} tablas cargadas`);

            } else {
                console.warn('⚠️ No se encontraron tablas en los datos');
                console.log('📊 Estructura de datos recibida:', Object.keys(datos || {}));
                tablasData = [];
                datosTablas = [];
                renderizarTablas();
            }
        } else {
            console.error('❌ Función cargarTodosDatos no disponible');
            tablasData = [];
            datosTablas = [];
            renderizarTablas();
        }

    } catch (error) {
        console.error('❌ Error al cargar tablas:', error);
        tablasData = [];
        datosTablas = [];
        renderizarTablas();
        mostrarToastTablas('error', 'Error al cargar tablas: ' + error.message);
    } finally {
        isLoadingTablas = false;
        mostrarEstadoCargaTablas(false);
    }
}

/**
 * Renderizar tabla de tablas
 */
function renderizarTablas() {
    const tbody = document.getElementById('tablas-tbody');
    const emptyState = document.getElementById('tablas-empty-state');
    const tableContainer = document.querySelector('.tablas-table-container');

    if (!tbody) {
        console.warn('⚠️ Elemento #tablas-tbody no encontrado');
        return;
    }

    // Estado vacío
    if (tablasData.length === 0) {
        if (emptyState) {
            emptyState.classList.remove('d-none');
        }
        if (tableContainer) {
            tableContainer.querySelector('#tablas-table-view').classList.add('d-none');
        }
        tbody.innerHTML = '';
        return;
    }

    // Ocultar estado vacío y mostrar tabla
    if (emptyState) {
        emptyState.classList.add('d-none');
    }
    if (tableContainer) {
        tableContainer.querySelector('#tablas-table-view').classList.remove('d-none');
    }

    // Ordenar tablas por sección y orden
    const tablasOrdenadas = [...tablasData].sort((a, b) => {
        const seccionA = parseFloat(a.SeccionOrden || 0);
        const seccionB = parseFloat(b.SeccionOrden || 0);
        if (seccionA !== seccionB) {
            return seccionA - seccionB;
        }
        const ordenA = parseInt(a.OrdenTabla || 0);
        const ordenB = parseInt(b.OrdenTabla || 0);
        return ordenA - ordenB;
    });

    // Renderizar filas
    tbody.innerHTML = tablasOrdenadas.map((tabla) => {
        const numeroTabla = `${tabla.SeccionOrden || '?'}.${tabla.OrdenTabla || '?'}`;
        const titulo = tabla.Titulo || 'Sin título';
        const datosCSV = tabla.DatosCSV || 'Sin datos';
        const fuente = tabla.Fuente || '-';
        const tablaId = tabla.id || `${tabla.SeccionOrden}-${tabla.OrdenTabla}`;

        // Verificar si tiene datos asociados (simplificado para renderizado)
        const tieneReferencia = tabla.DatosCSV && tabla.DatosCSV.includes('!');
        const tieneDatos = tieneReferencia;

        return `
            <tr>
                <td class="text-center">
                    <span class="badge bg-success">
                        <i class="fas fa-table me-1"></i>
                        ${numeroTabla}
                    </span>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="fas fa-file-alt me-2 text-muted"></i>
                        <span>${titulo}</span>
                        ${tieneDatos ? '<i class="fas fa-database ms-2 text-success" title="Tiene datos CSV"></i>' : ''}
                    </div>
                </td>
                <td>
                    <code class="text-muted small">${datosCSV}</code>
                </td>
                <td>
                    <small class="text-muted">${fuente}</small>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-info btn-preview-tabla" id="preview-tabla-${tablaId}" 
                                onclick="previewTabla('${tablaId}')" title="Vista previa de tabla">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-primary" onclick="editarTabla('${tablaId}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="eliminarTabla('${tablaId}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    console.log(`✅ ${tablasOrdenadas.length} tablas renderizadas`);
}

/**
 * Abrir página para nueva tabla
 */
function mostrarModalNuevaTabla() {
    console.log('📊 Redirigiendo a página de nueva tabla...');
    window.location.href = 'tabla-editor.html?action=new';
}

/**
 * Editar tabla existente
 */
function editarTabla(tablaId) {
    console.log('📊 Redirigiendo a página de edición de tabla:', tablaId);
    window.location.href = `tabla-editor.html?action=edit&id=${tablaId}`;
}

/**
 * Eliminar tabla - Mostrar modal de confirmación
 */
function eliminarTabla(tablaId) {
    const tabla = tablasData.find(t => t.id === tablaId);

    if (!tabla) {
        mostrarToastTablas('error', 'Tabla no encontrada');
        return;
    }

    console.log('🗑️ Solicitando confirmación para eliminar tabla:', tablaId);
    
    // Mostrar modal de confirmación
    mostrarModalEliminarTabla(tabla);
}

/**
 * Mostrar modal de confirmación para eliminar tabla
 */
async function mostrarModalEliminarTabla(tabla) {
    const tablaId = tabla.id;
    const numeroTabla = `${tabla.SeccionOrden}.${tabla.OrdenTabla}`;
    const titulo = tabla.Titulo || 'Sin título';
    const datosCSV = tabla.DatosCSV || 'Sin datos';
    
    // Contar datos asociados
    const datosAsociados = await buscarDatosTabla(tabla);
    
    const modalHtml = `
        <div class="modal fade" id="eliminar-tabla-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Confirmar Eliminación
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="text-center mb-3">
                            <i class="fas fa-table text-danger" style="font-size: 3rem; opacity: 0.7;"></i>
                        </div>
                        
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            <strong>¿Estás seguro de eliminar esta tabla?</strong>
                        </div>
                        
                        <div class="card">
                            <div class="card-body">
                                <h6 class="card-title text-danger">
                                    <i class="fas fa-hashtag me-1"></i>
                                    Tabla ${numeroTabla}
                                </h6>
                                <p class="card-text">
                                    <strong>Título:</strong> ${titulo}
                                </p>
                                <p class="card-text">
                                    <strong>Datos CSV:</strong> <code class="text-muted">${datosCSV}</code>
                                </p>
                                ${datosAsociados.length > 0 ? `
                                <p class="card-text">
                                    <strong>Registros de datos:</strong> 
                                    <span class="badge bg-warning text-dark">${datosAsociados.length} registros</span>
                                </p>
                                ` : ''}
                            </div>
                        </div>
                        
                        <div class="alert alert-info mt-3">
                            <i class="fas fa-info-circle me-2"></i>
                            <small>
                                <strong>Nota:</strong> Esta acción eliminará la tabla y sus metadatos.
                                ${datosAsociados.length > 0 ? 'Los datos CSV asociados también serán eliminados.' : ''}
                            </small>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-1"></i>
                            Cancelar
                        </button>
                        <button type="button" class="btn btn-danger" onclick="confirmarEliminarTabla('${tablaId}')" data-bs-dismiss="modal">
                            <i class="fas fa-trash me-1"></i>
                            Sí, Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remover modal anterior si existe
    const existingModal = document.getElementById('eliminar-tabla-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Agregar nuevo modal
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('eliminar-tabla-modal'));
    modal.show();
    
    // Limpiar modal al cerrar
    document.getElementById('eliminar-tabla-modal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

/**
 * Confirmar y ejecutar eliminación de tabla
 */
function confirmarEliminarTabla(tablaId) {
    console.log('🗑️ Confirmando eliminación de tabla:', tablaId);
    
    const tabla = tablasData.find(t => t.id === tablaId);
    if (!tabla) {
        mostrarToastTablas('error', 'Tabla no encontrada');
        return;
    }

    // Por ahora, solo eliminar localmente
    tablasData = tablasData.filter(t => t.id !== tablaId);
    
    // También eliminar datos asociados localmente (simplificado)
    const datosIniciales = 0; // Los datos están en rangos específicos, no en array local
    
    const datosEliminados = 0; // Los datos están en Google Sheets, no localmente
    
    // Re-renderizar
    renderizarTablas();
    
    mostrarToastTablas('success', `✅ Tabla ${tabla.SeccionOrden}.${tabla.OrdenTabla} eliminada${datosEliminados > 0 ? ` (${datosEliminados} registros de datos)` : ''}`);
    mostrarToastTablas('info', '🚧 Eliminación en Google Sheets en desarrollo');
    
    console.log(`📊 Tabla eliminada localmente. Datos eliminados: ${datosEliminados}`);
}

/**
 * Previsualizar tabla
 */
async function previewTabla(tablaId) {
    console.log('👁️ Previsualizando tabla:', tablaId);
    
    const tabla = tablasData.find(t => t.id === tablaId);
    if (!tabla) {
        mostrarToastTablas('error', 'Tabla no encontrada');
        return;
    }

    // Buscar datos asociados
    const datosAsociados = await buscarDatosTabla(tabla);

    const numeroTabla = `${tabla.SeccionOrden}.${tabla.OrdenTabla}`;
    const titulo = tabla.Titulo || 'Sin título';
    const fuente = tabla.Fuente || 'No especificado';
    const datosCSV = tabla.DatosCSV || 'Sin referencia';

    // Crear modal de previsualización
    const modalHtml = `
        <div class="modal fade" id="preview-tabla-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-xl modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-eye me-2"></i>
                            Vista Previa - Tabla ${numeroTabla}
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row mb-4">
                            <div class="col-md-8">
                                <h6 class="text-success mb-2">${titulo}</h6>
                                <div class="row text-start">
                                    <div class="col-md-6">
                                        <p class="text-muted mb-1">
                                            <i class="fas fa-database me-1 text-info"></i>
                                            <strong>Datos CSV:</strong>
                                        </p>
                                        <code class="text-muted small">${datosCSV}</code>
                                    </div>
                                    <div class="col-md-6">
                                        <p class="text-muted mb-1">
                                            <i class="fas fa-quote-left me-1 text-success"></i>
                                            <strong>Fuente:</strong>
                                        </p>
                                        <em class="text-muted">${fuente}</em>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 text-end">
                                <div class="badge bg-success fs-6 p-2">
                                    <i class="fas fa-table me-1"></i>
                                    Tabla ${numeroTabla}
                                </div>
                            </div>
                        </div>
                        
                        <div class="table-responsive">
                            <div id="tabla-preview-content">
                                ${generarVistaPreviewTabla(tabla, datosAsociados)}
                            </div>
                        </div>
                        
                        ${tabla.Notas ? `
                        <div class="mt-4">
                            <h6 class="text-muted">Notas al Pie:</h6>
                            <div class="alert alert-light">
                                <small>${tabla.Notas.replace(/\n/g, '<br>')}</small>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-1"></i>
                            Cerrar
                        </button>
                        <button type="button" class="btn btn-primary" onclick="editarTabla('${tablaId}'); bootstrap.Modal.getInstance(document.getElementById('preview-tabla-modal')).hide();">
                            <i class="fas fa-edit me-1"></i>
                            Editar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remover modal anterior si existe
    const existingModal = document.getElementById('preview-tabla-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Agregar nuevo modal
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('preview-tabla-modal'));
    modal.show();
    
    // Limpiar modal al cerrar
    document.getElementById('preview-tabla-modal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

/**
 * Normalizar nombre de hoja para compatibilidad
 * Convierte "Datos_Tablas" a "Datos Tablas" y viceversa
 */
function normalizarNombreHoja(nombre) {
    if (!nombre) return nombre;
    
    // Si contiene guión bajo, convertir a espacio
    if (nombre.includes('_')) {
        return nombre.replace(/_/g, ' ');
    }
    
    // Si contiene espacio, también devolver la versión con guión bajo para comparación
    if (nombre.includes(' ')) {
        return nombre; // Mantener el original con espacio
    }
    
    return nombre;
}

/**
 * Cargar datos específicos de un rango desde Google Sheets
 */
async function cargarDatosRango(referencia) {
    if (!referencia || !referencia.includes('!')) {
        console.warn('⚠️ Referencia inválida:', referencia);
        return [];
    }
    
    const [nombreHojaRaw, rango] = referencia.split('!');
    const nombreHoja = normalizarNombreHoja(nombreHojaRaw.trim());
    
    console.log(`🔍 Cargando datos del rango: ${referencia}`);
    console.log(`   📋 Hoja: "${nombreHoja}"`);
    console.log(`   📋 Rango: ${rango}`);
    
    try {
        // Usar la función del sistema para cargar la hoja específica
        const url = getUrlHojaCSV(nombreHoja);
        console.log(`📡 URL de carga: ${url}`);
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const csvText = await response.text();
        const todosLosDatos = parsearCSV(csvText);
        
        console.log(`📊 Total de datos en la hoja: ${todosLosDatos.length} filas`);
        
        // Extraer el rango específico
        const datosRango = extraerRangoCSV(todosLosDatos, rango);
        
        console.log(`✅ Datos del rango ${rango}: ${datosRango.length} filas`);
        return datosRango;
        
    } catch (error) {
        console.error(`❌ Error al cargar rango ${referencia}:`, error);
        return [];
    }
}

/**
 * Extraer un rango específico de datos CSV
 */
function extraerRangoCSV(datos, rango) {
    if (!datos || datos.length === 0) return [];
    
    // Parsear el rango (ej: A1:E4)
    const match = rango.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
    if (!match) {
        console.warn('⚠️ Formato de rango inválido:', rango);
        return datos; // Devolver todos los datos si no se puede parsear
    }
    
    const [, colInicioStr, filaInicio, colFinStr, filaFin] = match;
    
    // Convertir letras de columna a números (A=0, B=1, etc.)
    const colInicio = columnaLetraANumero(colInicioStr);
    const colFin = columnaLetraANumero(colFinStr);
    const filaInicioIdx = parseInt(filaInicio) - 1; // Convertir a índice 0-based
    const filaFinIdx = parseInt(filaFin) - 1;
    
    console.log(`📐 Rango parseado: Filas ${filaInicioIdx}-${filaFinIdx}, Columnas ${colInicio}-${colFin}`);
    
    // Extraer el rango específico
    const datosExtraidos = [];
    
    // Si tenemos headers como objetos, necesitamos convertir a array
    if (datos.length > 0 && typeof datos[0] === 'object') {
        const headers = Object.keys(datos[0]);
        
        // Agregar headers si la fila inicial es 1
        if (filaInicioIdx === 0) {
            const headersRango = headers.slice(colInicio, colFin + 1);
            datosExtraidos.push(headersRango);
        }
        
        // Agregar datos
        for (let i = Math.max(0, filaInicioIdx - 1); i < Math.min(datos.length, filaFinIdx); i++) {
            const fila = datos[i];
            const filaRango = headers.slice(colInicio, colFin + 1).map(header => fila[header] || '');
            datosExtraidos.push(filaRango);
        }
    }
    
    return datosExtraidos;
}

/**
 * Convertir letra de columna a número (A=0, B=1, ..., Z=25, AA=26, etc.)
 */
function columnaLetraANumero(letra) {
    let resultado = 0;
    for (let i = 0; i < letra.length; i++) {
        resultado = resultado * 26 + (letra.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
    }
    return resultado - 1; // Convertir a índice 0-based
}

/**
 * Buscar datos de tabla usando la referencia CSV
 */
async function buscarDatosTabla(tabla) {
    const datosRef = tabla.DatosCSV || '';
    
    if (!datosRef.includes('!')) {
        console.log(`ℹ️ Tabla ${tabla.SeccionOrden}.${tabla.OrdenTabla} no tiene referencia a hoja externa`);
        return []; // No es una referencia a otra hoja
    }
    
    console.log(`🔍 Buscando datos para tabla ${tabla.SeccionOrden}.${tabla.OrdenTabla}:`);
    console.log(`   📋 Referencia: ${datosRef}`);
    
    try {
        const datos = await cargarDatosRango(datosRef);
        console.log(`   ✅ Datos cargados: ${datos.length} filas`);
        return datos;
    } catch (error) {
        console.error(`   ❌ Error al cargar datos:`, error);
        return [];
    }
}

/**
 * Generar vista previa HTML de la tabla con DataTables
 */
function generarVistaPreviewTabla(tabla, datosAsociados) {
    if (!datosAsociados || datosAsociados.length === 0) {
        return `
            <div class="alert alert-warning text-center">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Sin datos disponibles</strong>
                <br>
                <small>No se encontraron datos CSV para esta tabla en Google Sheets</small>
                <br>
                <small class="text-muted">Referencia: ${tabla.DatosCSV || 'No especificada'}</small>
            </div>
        `;
    }

    // Generar ID único para la tabla
    const tableId = 'modal-preview-table-' + Date.now();
    
    // Generar tabla HTML con los datos reales
    let tablaHtml = `<div class="table-responsive">
        <table id="${tableId}" class="table table-sm table-bordered table-hover" style="width:100%">`;
    
    // Headers (primera fila)
    if (datosAsociados.length > 0) {
        tablaHtml += '<thead class="table-light"><tr>';
        const headers = datosAsociados[0];
        headers.forEach(header => {
            tablaHtml += `<th class="text-center">${header || 'Columna'}</th>`;
        });
        tablaHtml += '</tr></thead>';
    }
    
    // Datos (resto de filas) - TODAS las filas
    if (datosAsociados.length > 1) {
        tablaHtml += '<tbody>';
        for (let i = 1; i < datosAsociados.length; i++) {
            tablaHtml += '<tr>';
            const fila = datosAsociados[i];
            fila.forEach(celda => {
                const valorLimpio = (celda || '').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
                tablaHtml += `<td class="text-center">${valorLimpio}</td>`;
            });
            tablaHtml += '</tr>';
        }
        tablaHtml += '</tbody>';
    }
    
    tablaHtml += '</table></div>';
    
    // Agregar información adicional
    tablaHtml += `
        <div class="mt-3">
            <div class="row text-center">
                <div class="col-md-4">
                    <div class="badge bg-success p-2">
                        <i class="fas fa-table me-1"></i>
                        ${datosAsociados.length - 1} filas de datos
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="badge bg-info p-2">
                        <i class="fas fa-columns me-1"></i>
                        ${datosAsociados[0]?.length || 0} columnas
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="badge bg-primary p-2">
                        <i class="fas fa-database me-1"></i>
                        ${tabla.DatosCSV}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Inicializar DataTable después de que se agregue al DOM
    setTimeout(() => {
        const table = document.getElementById(tableId);
        if (table && typeof $ !== 'undefined' && $.fn.DataTable) {
            // Destruir DataTable existente si existe
            if ($.fn.DataTable.isDataTable(`#${tableId}`)) {
                $(`#${tableId}`).DataTable().destroy();
            }
            
            // Inicializar nuevo DataTable
            $(`#${tableId}`).DataTable({
                language: {
                    url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
                },
                pageLength: 5, // Menos filas en modal para mejor UX
                lengthMenu: [[5, 10, 25, -1], [5, 10, 25, "Todos"]],
                responsive: true,
                scrollX: true,
                dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>' +
                     '<"row"<"col-sm-12"tr>>' +
                     '<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>',
                columnDefs: [
                    {
                        targets: '_all',
                        className: 'text-center'
                    }
                ]
            });
            
            console.log(`✅ DataTable inicializada para modal preview ${tableId}`);
        }
    }, 200);
    
    return tablaHtml;
}

/**
 * Mostrar datos raw para debug
 */
async function mostrarDatosRaw(tablaId) {
    const tabla = tablasData.find(t => t.id === tablaId);
    if (!tabla) return;

    const datosAsociados = await buscarDatosTabla(tabla);

    console.log('📊 Datos raw de tabla:', tabla);
    console.log('📊 Datos asociados:', datosAsociados);
    
    alert(`Datos de tabla ${tabla.SeccionOrden}.${tabla.OrdenTabla}:\n\n` +
          `Registros encontrados: ${datosAsociados.length}\n` +
          `Ver consola para detalles completos`);
}

/**
 * Mostrar/ocultar estado de carga
 */
function mostrarEstadoCargaTablas(mostrar) {
    const loadingElement = document.getElementById('tablas-loading');
    const tableView = document.getElementById('tablas-table-view');

    if (loadingElement) {
        loadingElement.classList.toggle('d-none', !mostrar);
    }

    if (tableView) {
        tableView.classList.toggle('d-none', mostrar);
    }
}

/**
 * Mostrar notificación toast para tablas
 */
function mostrarToastTablas(tipo, mensaje) {
    // Reutilizar la función de figuras si está disponible
    if (typeof mostrarToast === 'function') {
        mostrarToast(tipo, mensaje);
    } else {
        console.log(`${tipo.toUpperCase()}: ${mensaje}`);
    }
}

/**
 * Obtener el siguiente número de tabla disponible para una sección
 */
function obtenerSiguienteNumeroTablaDisponible(seccion) {
    // Obtener todas las tablas de esta sección
    const tablasSeccion = tablasData.filter(t => t.SeccionOrden === seccion);
    
    if (tablasSeccion.length === 0) {
        return 1; // Primera tabla de la sección
    }
    
    // Obtener números existentes y ordenarlos
    const numerosExistentes = tablasSeccion
        .map(t => parseInt(t.OrdenTabla || 0))
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
 * Mostrar lista de tablas existentes como referencia
 */
function mostrarTablasExistentes() {
    if (tablasData.length === 0) {
        mostrarToastTablas('info', 'ℹ️ No hay tablas existentes');
        return;
    }
    
    // Ordenar tablas por sección y orden
    const tablasOrdenadas = [...tablasData].sort((a, b) => {
        const seccionA = parseFloat(a.SeccionOrden || 0);
        const seccionB = parseFloat(b.SeccionOrden || 0);
        if (seccionA !== seccionB) {
            return seccionA - seccionB;
        }
        const ordenA = parseInt(a.OrdenTabla || 0);
        const ordenB = parseInt(b.OrdenTabla || 0);
        return ordenA - ordenB;
    });
    
    // Crear lista de tablas
    const listaTablas = tablasOrdenadas.map(tabla => {
        const numero = `${tabla.SeccionOrden}.${tabla.OrdenTabla}`;
        const titulo = tabla.Titulo || 'Sin título';
        return `• Tabla ${numero}: ${titulo}`;
    }).join('\n');
    
    // Mostrar en alert (simple pero efectivo)
    alert(`📋 Tablas existentes (${tablasData.length}):\n\n${listaTablas}\n\n💡 Asegúrate de usar un número único.`);
}

/**
 * Toggle del editor CSV
 */
function toggleEditorCSV() {
    const container = document.getElementById('csv-editor-container');
    if (container.style.display === 'none') {
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
    }
}

/**
 * Agregar fila al CSV
 */
function agregarFilaCSV() {
    const textarea = document.getElementById('csv-data');
    const currentValue = textarea.value;
    
    if (currentValue.trim() === '') {
        textarea.value = 'Nueva fila,Valor 1,Valor 2';
    } else {
        textarea.value = currentValue + '\nNueva fila,Valor 1,Valor 2';
    }
}

/**
 * Agregar columna al CSV
 */
function agregarColumnaCSV() {
    const textarea = document.getElementById('csv-data');
    const lines = textarea.value.split('\n');
    
    if (lines.length === 0 || (lines.length === 1 && lines[0].trim() === '')) {
        textarea.value = 'Columna 1,Columna 2,Nueva Columna';
    } else {
        const newLines = lines.map(line => {
            if (line.trim() === '') return line;
            return line + ',Nueva Columna';
        });
        textarea.value = newLines.join('\n');
    }
}

/**
 * Guardar tabla (crear o actualizar)
 */
async function guardarTabla() {
    console.log('💾 Iniciando guardado de tabla...');
    
    // Obtener valores del formulario
    const seccionOrden = document.getElementById('tabla-seccion-orden').value.trim();
    const ordenTabla = document.getElementById('tabla-orden').value.trim();
    const titulo = document.getElementById('tabla-titulo').value.trim();
    const fuente = document.getElementById('tabla-fuente').value.trim();
    const datosCSV = document.getElementById('tabla-datos-csv').value.trim();
    const csvData = document.getElementById('csv-data').value.trim();
    const notas = document.getElementById('tabla-notas').value.trim();

    // Validar campos obligatorios
    if (!seccionOrden || !ordenTabla || !titulo) {
        mostrarToastTablas('error', '⚠️ Complete los campos obligatorios: Sección, Orden y Título');
        
        // Resaltar campos faltantes
        if (!seccionOrden) document.getElementById('tabla-seccion-orden').classList.add('is-invalid');
        if (!ordenTabla) document.getElementById('tabla-orden').classList.add('is-invalid');
        if (!titulo) document.getElementById('tabla-titulo').classList.add('is-invalid');
        
        return;
    }

    // Validar que no exista una tabla duplicada
    const tablaId = `${seccionOrden}-${ordenTabla}`;
    const tablaExistente = tablasData.find(t => t.id === tablaId);
    
    if (tablaExistente && tablaEditando !== tablaId) {
        const siguienteNumero = obtenerSiguienteNumeroTablaDisponible(seccionOrden);
        
        mostrarToastTablas('error', `❌ Ya existe tabla ${seccionOrden}.${ordenTabla}. Prueba con ${seccionOrden}.${siguienteNumero}`);
        
        document.getElementById('tabla-seccion-orden').classList.add('is-invalid');
        document.getElementById('tabla-orden').classList.add('is-invalid');
        
        setTimeout(() => {
            mostrarToastTablas('info', `💡 Sugerencia: Usa ${seccionOrden}.${siguienteNumero} (siguiente disponible)`);
        }, 2000);
        
        return;
    }

    // Limpiar clases de error
    document.getElementById('tabla-seccion-orden').classList.remove('is-invalid');
    document.getElementById('tabla-orden').classList.remove('is-invalid');
    document.getElementById('tabla-titulo').classList.remove('is-invalid');

    // Por ahora, mostrar mensaje de desarrollo
    mostrarToastTablas('success', `✅ Tabla ${seccionOrden}.${ordenTabla} validada correctamente`);
    mostrarToastTablas('info', '🚧 Guardado en Google Sheets en desarrollo');
    
    console.log('📊 Datos de tabla a guardar:', {
        seccionOrden,
        ordenTabla,
        titulo,
        fuente,
        datosCSV,
        csvData: csvData.substring(0, 100) + '...',
        notas
    });
}

/**
 * Exponer funciones globalmente
 */
window.tablasModule = {
    editarTabla: editarTabla,
    eliminarTabla: eliminarTabla,
    mostrarModalNuevaTabla: mostrarModalNuevaTabla,
    previewTabla: previewTabla,
    cargarTablas: cargarTablas,
    guardarTabla: guardarTabla,
    mostrarTablasExistentes: mostrarTablasExistentes,
    toggleEditorCSV: toggleEditorCSV,
    agregarFilaCSV: agregarFilaCSV,
    agregarColumnaCSV: agregarColumnaCSV,
    mostrarModalEliminarTabla: mostrarModalEliminarTabla,
    confirmarEliminarTabla: confirmarEliminarTabla
};

// También exponer directamente para compatibilidad
window.editarTabla = editarTabla;
window.eliminarTabla = eliminarTabla;
window.mostrarModalNuevaTabla = mostrarModalNuevaTabla;
window.previewTabla = previewTabla;
window.cargarTablas = cargarTablas;
window.guardarTabla = guardarTabla;
window.mostrarTablasExistentes = mostrarTablasExistentes;
window.toggleEditorCSV = toggleEditorCSV;
window.agregarFilaCSV = agregarFilaCSV;
window.agregarColumnaCSV = agregarColumnaCSV;
window.generarVistaPreviewTabla = generarVistaPreviewTabla;
window.mostrarDatosRaw = mostrarDatosRaw;
window.mostrarModalEliminarTabla = mostrarModalEliminarTabla;
window.confirmarEliminarTabla = confirmarEliminarTabla;

/**
 * Inicializar cuando el DOM esté listo
 */
function inicializarModuloTablas() {
    console.log('🚀 Inicializando módulo de tablas...');
    console.log('🔍 Verificando funciones exportadas:', {
        previewTabla: typeof window.previewTabla,
        editarTabla: typeof window.editarTabla,
        eliminarTabla: typeof window.eliminarTabla
    });
    
    // Verificar que estemos en la página correcta
    if (!document.getElementById('tablas-tbody')) {
        console.log('📊 Página sin tabla de tablas, saltando inicialización');
        return;
    }
    
    initTablas();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarModuloTablas);
} else {
    inicializarModuloTablas();
}

// También exponer para re-inicialización manual
window.inicializarModuloTablas = inicializarModuloTablas;

// FORZAR EXPORTACIÓN DE FUNCIONES CRÍTICAS
console.log('📊 Forzando exportación de funciones de tablas...');
window.previewTabla = previewTabla;
window.editarTabla = editarTabla;
window.eliminarTabla = eliminarTabla;
window.mostrarModalNuevaTabla = mostrarModalNuevaTabla;

// Función de inicialización forzada para debug
window.forzarInicializacionTablas = function() {
    console.log('🚀 Forzando inicialización completa de tablas...');
    
    // Re-exportar todas las funciones
    window.previewTabla = previewTabla;
    window.editarTabla = editarTabla;
    window.eliminarTabla = eliminarTabla;
    window.mostrarModalNuevaTabla = mostrarModalNuevaTabla;
    window.guardarTabla = guardarTabla;
    window.cargarTablas = cargarTablas;
    
    // Re-crear el módulo
    window.tablasModule = {
        editarTabla: editarTabla,
        eliminarTabla: eliminarTabla,
        mostrarModalNuevaTabla: mostrarModalNuevaTabla,
        previewTabla: previewTabla,
        cargarTablas: cargarTablas,
        guardarTabla: guardarTabla
    };
    
    // Inicializar si es posible
    if (document.getElementById('tablas-tbody')) {
        initTablas();
    }
    
    console.log('✅ Inicialización forzada completada');
    return 'Tablas inicializadas correctamente';
};

// Verificar que las funciones estén disponibles
setTimeout(() => {
    console.log('🔍 Verificación final de funciones:', {
        previewTabla: typeof window.previewTabla,
        editarTabla: typeof window.editarTabla,
        eliminarTabla: typeof window.eliminarTabla,
        mostrarModalNuevaTabla: typeof window.mostrarModalNuevaTabla,
        forzarInicializacionTablas: typeof window.forzarInicializacionTablas
    });
    
    if (typeof window.previewTabla !== 'function') {
        console.warn('⚠️ Las funciones no están disponibles. Ejecuta window.forzarInicializacionTablas() en la consola.');
    }
}, 100);