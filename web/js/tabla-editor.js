/**
 * ============================================================================
 * EDITOR DE TABLAS - Página dedicada para crear/editar tablas
 * ============================================================================
 */

console.log('📊 Cargando editor de tablas...');

// Estado
let tablaActual = null;
let modoEdicion = 'new'; // 'new' o 'edit'
let tablasData = [];
let luckysheeetInstance = null;
let rangosOcupados = []; // Cache de rangos ocupados por otras tablas
let rangoActual = null; // Rango actual de la tabla que estamos editando

/**
 * Inicializar editor de tablas
 */
function initTablaEditor() {
    console.log('🚀 Inicializando editor de tablas...');
    
    // Obtener parámetros de URL
    const urlParams = new URLSearchParams(window.location.search);
    modoEdicion = urlParams.get('action') || 'new';
    const tablaId = urlParams.get('id');
    
    console.log(`📋 Modo: ${modoEdicion}, ID: ${tablaId}`);
    
    // Configurar interfaz según el modo
    if (modoEdicion === 'edit' && tablaId) {
        document.getElementById('breadcrumb-title').textContent = `Editar Tabla ${tablaId}`;
        cargarTablaParaEdicion(tablaId);
    } else {
        document.getElementById('breadcrumb-title').textContent = 'Nueva Tabla';
    }
    
    // Configurar event listeners
    setupEventListeners();
    
    // Inicializar Luckysheet
    initLuckysheet();
    
    // Cargar datos de tablas existentes
    cargarTablasExistentes();
}

/**
 * Inicializar Luckysheet (Editor tipo Excel)
 */
function initLuckysheet() {
    // Verificar que Luckysheet esté disponible
    if (typeof luckysheet === 'undefined') {
        console.error('❌ Luckysheet no está disponible');
        // Fallback: mostrar mensaje de error
        document.getElementById('luckysheet-container').innerHTML = `
            <div class="alert alert-danger text-center">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Error al cargar el editor Excel</strong>
                <br>
                <small>Luckysheet no se pudo cargar. Verifica tu conexión a internet.</small>
            </div>
        `;
        return;
    }
    
    try {
        const options = {
            container: 'luckysheet-container',
            lang: 'es',
            title: 'Editor de Tabla',
            showtoolbar: true,
            showinfobar: false,
            showsheetbar: false,
            showstatisticBar: false,
            allowCopy: true,
            allowEdit: true,
            allowUpdate: true,
            enableAddRow: true,
            enableAddCol: true,
            data: [{
                name: "Tabla",
                color: "",
                index: 0,
                status: 1,
                order: 0,
                hide: 0,
                row: 20,
                column: 10,
                defaultRowHeight: 19,
                defaultColWidth: 100,
                celldata: [
                    {r: 0, c: 0, v: {v: "Encabezado 1", ct: {fa: "General", t: "g"}, bg: "#f8f9fa", fc: "#495057", bl: 1}},
                    {r: 0, c: 1, v: {v: "Encabezado 2", ct: {fa: "General", t: "g"}, bg: "#f8f9fa", fc: "#495057", bl: 1}},
                    {r: 0, c: 2, v: {v: "Encabezado 3", ct: {fa: "General", t: "g"}, bg: "#f8f9fa", fc: "#495057", bl: 1}},
                    {r: 1, c: 0, v: {v: "Valor 1", ct: {fa: "General", t: "g"}}},
                    {r: 1, c: 1, v: {v: "Valor 2", ct: {fa: "General", t: "g"}}},
                    {r: 1, c: 2, v: {v: "Valor 3", ct: {fa: "General", t: "g"}}}
                ]
            }],
            hook: {
                cellEditBefore: function(range) {
                    console.log('📝 Editando celda:', range);
                },
                cellUpdated: function(r, c, oldValue, newValue, isRefresh) {
                    console.log(`📝 Celda actualizada [${r},${c}]: "${oldValue}" → "${newValue}"`);
                    // Sincronizar con CSV automáticamente (con delay para evitar spam)
                    clearTimeout(window.syncTimeout);
                    window.syncTimeout = setTimeout(() => {
                        sincronizarDesdeExcel();
                        // También actualizar rango si es necesario
                        setTimeout(actualizarRangoSegunDatos, 200);
                    }, 500);
                },
                rangeSelect: function(range) {
                    console.log('📐 Rango seleccionado:', range);
                },
                sheetCreateAfter: function() {
                    console.log('✅ Luckysheet completamente inicializado');
                    luckysheeetInstance = luckysheet;
                }
            }
        };
        
        luckysheet.create(options);
        console.log('🚀 Inicializando Luckysheet...');
        
    } catch (error) {
        console.error('❌ Error al inicializar Luckysheet:', error);
        document.getElementById('luckysheet-container').innerHTML = `
            <div class="alert alert-danger text-center">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Error al inicializar el editor Excel</strong>
                <br>
                <small>${error.message}</small>
            </div>
        `;
    }
}

/**
 * Configurar event listeners
 */
function setupEventListeners() {
    // Actualizar preview del número de tabla
    document.getElementById('tabla-seccion-orden').addEventListener('input', actualizarPreviewNumero);
    document.getElementById('tabla-orden').addEventListener('input', actualizarPreviewNumero);
    
    // Cargar datos cuando cambie la referencia CSV
    document.getElementById('tabla-datos-csv').addEventListener('blur', cargarDatosDesdeReferencia);
    
    // Validar rango en tiempo real
    document.getElementById('tabla-datos-csv').addEventListener('input', validarRangoEnTiempoReal);
    
    // Actualizar indicador de rango
    document.getElementById('tabla-datos-csv').addEventListener('input', actualizarIndicadorRango);
    document.getElementById('tabla-datos-csv').addEventListener('blur', actualizarIndicadorRango);
}

/**
 * Actualizar preview del número de tabla
 */
function actualizarPreviewNumero() {
    const seccion = document.getElementById('tabla-seccion-orden').value.trim();
    const orden = document.getElementById('tabla-orden').value.trim();
    const preview = document.getElementById('numero-tabla-preview');
    
    if (seccion && orden) {
        preview.textContent = `Tabla ${seccion}.${orden}`;
        
        // Verificar duplicados
        verificarDuplicado(seccion, orden);
    } else {
        preview.textContent = '';
    }
}

/**
 * Verificar si existe una tabla duplicada
 */
function verificarDuplicado(seccion, orden) {
    const tablaId = `${seccion}-${orden}`;
    const existe = tablasData.some(t => t.id === tablaId && (modoEdicion === 'new' || t.id !== tablaActual?.id));
    
    const seccionInput = document.getElementById('tabla-seccion-orden');
    const ordenInput = document.getElementById('tabla-orden');
    const preview = document.getElementById('numero-tabla-preview');
    
    if (existe) {
        seccionInput.classList.add('is-invalid');
        ordenInput.classList.add('is-invalid');
        preview.textContent = `⚠️ Tabla ${seccion}.${orden} ya existe`;
        preview.className = 'text-danger fw-bold';
    } else {
        seccionInput.classList.remove('is-invalid');
        ordenInput.classList.remove('is-invalid');
        preview.className = 'text-success fw-bold';
    }
}

/**
 * Cargar tablas existentes
 */
async function cargarTablasExistentes() {
    try {
        console.log('📡 Cargando tablas existentes...');
        
        if (typeof cargarTodosDatos === 'function') {
            const datos = await cargarTodosDatos();
            
            if (datos && datos.tablas) {
                // Filtrar por documento actual
                const docId = 'D01'; // Por ahora hardcodeado
                
                tablasData = datos.tablas.filter(tabla => {
                    const tablaDocId = tabla.DocumentoID || tabla.DocumentoId || tabla.Documento || tabla.DocID || '';
                    return tablaDocId.toString().trim().toUpperCase() === docId;
                }).map(tabla => ({
                    ...tabla,
                    id: `${tabla.SeccionOrden}-${tabla.OrdenTabla}`
                }));
                
                console.log(`✅ ${tablasData.length} tablas cargadas`);
                
                // Cargar rangos ocupados
                cargarRangosOcupados();
            }
        }
    } catch (error) {
        console.error('❌ Error al cargar tablas:', error);
    }
}

/**
 * Cargar tabla para edición
 */
async function cargarTablaParaEdicion(tablaId) {
    try {
        await cargarTablasExistentes();
        
        tablaActual = tablasData.find(t => t.id === tablaId);
        
        if (!tablaActual) {
            alert('Tabla no encontrada');
            window.location.href = 'editor.html#tablas';
            return;
        }
        
        // Llenar formulario
        document.getElementById('tabla-seccion-orden').value = tablaActual.SeccionOrden || '';
        document.getElementById('tabla-orden').value = tablaActual.OrdenTabla || '';
        document.getElementById('tabla-titulo').value = tablaActual.Titulo || '';
        document.getElementById('tabla-fuente').value = tablaActual.Fuente || '';
        document.getElementById('tabla-datos-csv').value = tablaActual.DatosCSV || '';
        document.getElementById('tabla-notas').value = tablaActual.Notas || '';
        
        // Actualizar preview
        actualizarPreviewNumero();
        
        // Cargar datos si hay referencia
        if (tablaActual.DatosCSV) {
            console.log(`📡 Cargando datos para tabla ${tablaActual.SeccionOrden}.${tablaActual.OrdenTabla}`);
            console.log(`📋 Referencia CSV: ${tablaActual.DatosCSV}`);
            await cargarDatosDesdeReferencia();
        } else {
            console.log(`ℹ️ Tabla ${tablaActual.SeccionOrden}.${tablaActual.OrdenTabla} no tiene referencia CSV`);
        }
        
        console.log('✅ Tabla cargada para edición:', tablaActual);
        
    } catch (error) {
        console.error('❌ Error al cargar tabla para edición:', error);
        alert('Error al cargar la tabla');
    }
}

/**
 * Cargar datos desde la referencia CSV
 */
async function cargarDatosDesdeReferencia() {
    const referencia = document.getElementById('tabla-datos-csv').value.trim();
    
    if (!referencia) {
        console.log('ℹ️ No hay referencia CSV para cargar');
        return;
    }
    
    if (!referencia.includes('!')) {
        alert('Formato de referencia inválido. Usa: Datos Tablas!A1:E4');
        return;
    }
    
    try {
        console.log('📡 Cargando datos desde referencia:', referencia);
        
        // Mostrar indicador de carga
        mostrarIndicadorCarga(true);
        
        const datos = await cargarDatosRango(referencia);
        
        if (datos && datos.length > 0) {
            // Extraer el rango de la referencia
            const [hoja, rango] = referencia.split('!');
            
            // Cargar datos en Luckysheet con posicionamiento correcto
            cargarDatosEnLuckysheet(datos, rango.trim());
            
            // También llenar el editor CSV con headers de posición
            const csvContent = generarCSVConPosicion(datos, rango.trim());
            document.getElementById('csv-data').value = csvContent;
            
            // Mostrar mensaje de éxito
            console.log(`✅ Datos cargados: ${datos.length} filas × ${datos[0]?.length || 0} columnas en rango ${rango}`);
            
            // Mostrar notificación de éxito
            mostrarNotificacion('success', `✅ Datos cargados en ${rango}: ${datos.length - 1} filas de datos`);
            
        } else {
            console.warn('⚠️ No se encontraron datos en el rango especificado');
            mostrarNotificacion('warning', `⚠️ No se encontraron datos en el rango ${referencia}`);
        }
        
    } catch (error) {
        console.error('❌ Error al cargar datos:', error);
        mostrarNotificacion('error', `❌ Error al cargar datos: ${error.message}`);
    } finally {
        mostrarIndicadorCarga(false);
    }
}

/**
 * Mostrar indicador de carga
 */
function mostrarIndicadorCarga(mostrar) {
    const btn = document.querySelector('button[onclick="cargarDatosDesdeReferencia()"]');
    if (btn) {
        if (mostrar) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Cargando...';
            btn.disabled = true;
        } else {
            btn.innerHTML = '<i class="fas fa-sync me-1"></i> Cargar Datos';
            btn.disabled = false;
        }
    }
}

/**
 * Mostrar notificación
 */
function mostrarNotificacion(tipo, mensaje) {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `alert alert-${tipo === 'success' ? 'success' : tipo === 'warning' ? 'warning' : 'danger'} alert-dismissible fade show position-fixed`;
    notificacion.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notificacion.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notificacion);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (notificacion.parentNode) {
            notificacion.remove();
        }
    }, 5000);
}

/**
 * Generar HTML de tabla a partir de datos usando DataTables
 */
function generarTablaHTML(datos) {
    if (!datos || datos.length === 0) return '';
    
    // Generar ID único para la tabla
    const tableId = 'preview-table-' + Date.now();
    
    let html = `<div class="table-responsive">
        <table id="${tableId}" class="table table-sm table-bordered table-hover" style="width:100%">`;
    
    // Headers
    if (datos.length > 0) {
        html += '<thead class="table-light"><tr>';
        datos[0].forEach(header => {
            html += `<th class="text-center">${header || 'Columna'}</th>`;
        });
        html += '</tr></thead>';
    }
    
    // Datos - TODAS las filas, no limitadas
    if (datos.length > 1) {
        html += '<tbody>';
        for (let i = 1; i < datos.length; i++) {
            html += '<tr>';
            datos[i].forEach(celda => {
                // Escapar HTML y manejar valores vacíos
                const valorLimpio = (celda || '').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
                html += `<td class="text-center">${valorLimpio}</td>`;
            });
            html += '</tr>';
        }
        html += '</tbody>';
    }
    
    html += '</table></div>';
    
    // Inicializar DataTable después de que se agregue al DOM
    setTimeout(() => {
        const table = document.getElementById(tableId);
        if (table && $.fn.DataTable) {
            // Destruir DataTable existente si existe
            if ($.fn.DataTable.isDataTable(`#${tableId}`)) {
                $(`#${tableId}`).DataTable().destroy();
            }
            
            // Inicializar nuevo DataTable
            $(`#${tableId}`).DataTable({
                language: {
                    url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
                },
                pageLength: 10,
                lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "Todos"]],
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
            
            console.log(`✅ DataTable inicializada para tabla ${tableId}`);
        }
    }, 100);
    
    return html;
}

/**
 * Cargar datos de un rango específico desde Google Sheets
 */
async function cargarDatosRango(referencia) {
    if (!referencia || !referencia.includes('!')) {
        throw new Error('Referencia inválida');
    }
    
    const [nombreHojaRaw, rango] = referencia.split('!');
    let nombreHoja = nombreHojaRaw.trim();
    
    // Normalizar nombre de hoja
    if (nombreHoja.includes('_')) {
        nombreHoja = nombreHoja.replace(/_/g, ' ');
    }
    
    console.log(`📡 Cargando rango ${rango} de hoja "${nombreHoja}"`);
    
    // Usar la función del sistema para cargar la hoja
    const url = getUrlHojaCSV(nombreHoja);
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    const todosLosDatos = parsearCSV(csvText);
    
    // Extraer el rango específico
    return extraerRangoCSV(todosLosDatos, rango);
}

/**
 * Extraer un rango específico de datos CSV
 */
function extraerRangoCSV(datos, rango) {
    if (!datos || datos.length === 0) return [];
    
    console.log(`📐 Procesando rango: ${rango}`);
    console.log(`📊 Datos disponibles: ${datos.length} filas`);
    
    // Parsear el rango (ej: A1:E4, A1:Z100, etc.)
    const match = rango.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/i);
    if (!match) {
        console.warn('⚠️ Formato de rango inválido:', rango);
        return datos.slice(0, 10); // Devolver primeras 10 filas como fallback
    }
    
    const [, colInicioStr, filaInicio, colFinStr, filaFin] = match;
    
    // Convertir letras de columna a números (A=0, B=1, etc.)
    const colInicio = columnaLetraANumero(colInicioStr.toUpperCase());
    const colFin = columnaLetraANumero(colFinStr.toUpperCase());
    const filaInicioIdx = parseInt(filaInicio) - 1; // Convertir a índice 0-based
    const filaFinIdx = parseInt(filaFin) - 1;
    
    console.log(`📐 Rango parseado:`);
    console.log(`   Columnas: ${colInicioStr}(${colInicio}) → ${colFinStr}(${colFin})`);
    console.log(`   Filas: ${filaInicio}(${filaInicioIdx}) → ${filaFin}(${filaFinIdx})`);
    
    // Convertir objetos a arrays si es necesario
    let datosArray = datos;
    if (datos.length > 0 && typeof datos[0] === 'object') {
        const headers = Object.keys(datos[0]);
        console.log(`📋 Headers encontrados: ${headers.length} columnas`);
        
        // Crear array con headers como primera fila
        datosArray = [headers];
        
        // Agregar datos
        datos.forEach(obj => {
            const fila = headers.map(h => obj[h] || '');
            datosArray.push(fila);
        });
        
        console.log(`📊 Datos convertidos a array: ${datosArray.length} filas × ${datosArray[0]?.length || 0} columnas`);
    }
    
    // Validar que el rango esté dentro de los límites
    const maxFilas = datosArray.length;
    const maxColumnas = datosArray[0]?.length || 0;
    
    if (filaInicioIdx >= maxFilas) {
        console.warn(`⚠️ Fila inicial ${filaInicio} fuera de rango (máximo: ${maxFilas})`);
        return [];
    }
    
    if (colInicio >= maxColumnas) {
        console.warn(`⚠️ Columna inicial ${colInicioStr} fuera de rango (máximo: ${maxColumnas})`);
        return [];
    }
    
    // Ajustar límites si exceden los datos disponibles
    const filaFinReal = Math.min(filaFinIdx, maxFilas - 1);
    const colFinReal = Math.min(colFin, maxColumnas - 1);
    
    console.log(`📐 Rango ajustado: Filas ${filaInicioIdx}-${filaFinReal}, Columnas ${colInicio}-${colFinReal}`);
    
    // Extraer el rango específico
    const resultado = [];
    for (let i = filaInicioIdx; i <= filaFinReal; i++) {
        if (datosArray[i]) {
            const fila = datosArray[i].slice(colInicio, colFinReal + 1);
            resultado.push(fila);
            console.log(`   Fila ${i + 1}: [${fila.join(', ')}]`);
        }
    }
    
    console.log(`✅ Rango extraído: ${resultado.length} filas × ${resultado[0]?.length || 0} columnas`);
    return resultado;
}

/**
 * Convertir letra de columna a número (A=0, B=1, ..., Z=25, AA=26, etc.)
 */
function columnaLetraANumero(letra) {
    let resultado = 0;
    const letraUpper = letra.toUpperCase();
    
    for (let i = 0; i < letraUpper.length; i++) {
        const charCode = letraUpper.charCodeAt(i) - 'A'.charCodeAt(0) + 1;
        resultado = resultado * 26 + charCode;
    }
    
    const indice = resultado - 1; // Convertir a índice 0-based
    console.log(`📝 Columna ${letra} → índice ${indice}`);
    return indice;
}

/**
 * Mostrar tablas existentes
 */
function mostrarTablasExistentes() {
    if (tablasData.length === 0) {
        alert('No hay tablas existentes');
        return;
    }
    
    const lista = tablasData
        .sort((a, b) => {
            const seccionA = parseFloat(a.SeccionOrden || 0);
            const seccionB = parseFloat(b.SeccionOrden || 0);
            if (seccionA !== seccionB) return seccionA - seccionB;
            return parseInt(a.OrdenTabla || 0) - parseInt(b.OrdenTabla || 0);
        })
        .map(t => `• Tabla ${t.SeccionOrden}.${t.OrdenTabla}: ${t.Titulo || 'Sin título'}`)
        .join('\n');
    
    alert(`Tablas existentes (${tablasData.length}):\n\n${lista}`);
}

/**
 * Validar duplicados
 */
function validarDuplicados() {
    actualizarPreviewNumero();
}

/**
 * Limpiar DataTables existentes
 */
function limpiarDataTables() {
    if (typeof $ !== 'undefined' && $.fn.DataTable) {
        // Destruir todas las instancias de DataTable en el contenedor
        $('#tabla-preview-container table').each(function() {
            if ($.fn.DataTable.isDataTable(this)) {
                $(this).DataTable().destroy();
            }
        });
    }
}

/**
 * Previsualizar CSV del editor
 */
function previsualizarCSV() {
    const csvContent = document.getElementById('csv-data').value.trim();
    const previewContainer = document.getElementById('tabla-preview-container');
    
    // Limpiar DataTables existentes
    limpiarDataTables();
    
    if (!csvContent) {
        previewContainer.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                Ingresa datos CSV en el editor para previsualizar
            </div>
        `;
        return;
    }
    
    try {
        // Parsear CSV manualmente
        const lineas = csvContent.split('\n').filter(l => l.trim());
        const datos = lineas.map(linea => linea.split(',').map(c => c.trim()));
        
        const tablaHtml = generarTablaHTML(datos);
        previewContainer.innerHTML = `
            <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">
                        <i class="fas fa-code me-2 text-info"></i>
                        Vista Previa del Editor CSV
                    </h6>
                    <div class="badge bg-info">${datos.length - 1} filas × ${datos[0]?.length || 0} columnas</div>
                </div>
            </div>
            ${tablaHtml}
        `;
        
        // Cambiar a tab de preview
        document.getElementById('preview-tab').click();
        
    } catch (error) {
        previewContainer.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle me-2"></i>
                Error al parsear CSV: ${error.message}
            </div>
        `;
    }
}

/**
 * Agregar fila al CSV
 */
function agregarFilaCSV() {
    const textarea = document.getElementById('csv-data');
    const lineas = textarea.value.split('\n');
    
    if (lineas.length === 0 || (lineas.length === 1 && lineas[0].trim() === '')) {
        textarea.value = 'Columna 1,Columna 2,Columna 3\nValor 1,Valor 2,Valor 3';
    } else {
        // Contar columnas de la primera fila
        const numColumnas = lineas[0].split(',').length;
        const nuevaFila = Array(numColumnas).fill('Nuevo valor').join(',');
        textarea.value += '\n' + nuevaFila;
    }
}

/**
 * Agregar columna al CSV
 */
function agregarColumnaCSV() {
    const textarea = document.getElementById('csv-data');
    const lineas = textarea.value.split('\n');
    
    if (lineas.length === 0 || (lineas.length === 1 && lineas[0].trim() === '')) {
        textarea.value = 'Columna 1,Columna 2,Nueva Columna';
    } else {
        const nuevasLineas = lineas.map((linea, index) => {
            if (linea.trim() === '') return linea;
            return linea + (index === 0 ? ',Nueva Columna' : ',Nuevo valor');
        });
        textarea.value = nuevasLineas.join('\n');
    }
}

/**
 * Guardar tabla
 */
async function guardarTabla() {
    console.log('💾 Guardando tabla...');
    
    // Validar formulario
    const seccion = document.getElementById('tabla-seccion-orden').value.trim();
    const orden = document.getElementById('tabla-orden').value.trim();
    const titulo = document.getElementById('tabla-titulo').value.trim();
    
    if (!seccion || !orden || !titulo) {
        alert('Complete los campos obligatorios: Sección, Orden y Título');
        return;
    }
    
    // Verificar duplicados
    const tablaId = `${seccion}-${orden}`;
    const existe = tablasData.some(t => t.id === tablaId && (modoEdicion === 'new' || t.id !== tablaActual?.id));
    
    if (existe) {
        alert(`Ya existe una tabla ${seccion}.${orden}`);
        return;
    }
    
    // Por ahora, solo mostrar mensaje de éxito
    alert(`✅ Tabla ${seccion}.${orden} validada correctamente\n\n🚧 Guardado en Google Sheets en desarrollo`);
    
    console.log('📊 Datos a guardar:', {
        seccion,
        orden,
        titulo,
        fuente: document.getElementById('tabla-fuente').value.trim(),
        datosCSV: document.getElementById('tabla-datos-csv').value.trim(),
        notas: document.getElementById('tabla-notas').value.trim()
    });
}

/**
 * Agregar fila al editor Excel
 */
function agregarFila() {
    if (luckysheet && luckysheet.insertRow) {
        luckysheet.insertRow();
        console.log('➕ Fila agregada');
    }
}

/**
 * Agregar columna al editor Excel
 */
function agregarColumna() {
    if (luckysheet && luckysheet.insertColumn) {
        luckysheet.insertColumn();
        console.log('➕ Columna agregada');
    }
}

/**
 * Eliminar fila del editor Excel
 */
function eliminarFila() {
    if (luckysheet && luckysheet.deleteRow) {
        luckysheet.deleteRow();
        console.log('➖ Fila eliminada');
    }
}

/**
 * Eliminar columna del editor Excel
 */
function eliminarColumna() {
    if (luckysheet && luckysheet.deleteColumn) {
        luckysheet.deleteColumn();
        console.log('➖ Columna eliminada');
    }
}

/**
 * Sincronizar datos desde Excel a CSV manteniendo posición
 */
function sincronizarDesdeExcel() {
    if (!luckysheet || !luckysheet.getSheetData) {
        console.warn('⚠️ Luckysheet no disponible');
        return;
    }
    
    try {
        const referencia = document.getElementById('tabla-datos-csv').value.trim();
        let rangoActivo = null;
        
        if (referencia && referencia.includes('!')) {
            const [hoja, rango] = referencia.split('!');
            rangoActivo = rango.trim();
        }
        
        const data = luckysheet.getSheetData();
        if (!data || data.length === 0) {
            document.getElementById('csv-data').value = '';
            return;
        }
        
        // Extraer solo los datos del rango específico si existe
        let datosExtraidos = [];
        
        if (rangoActivo) {
            const rangoParsed = parsearRango(rangoActivo);
            if (rangoParsed) {
                // Extraer datos del rango específico
                for (let r = rangoParsed.filaInicio; r <= rangoParsed.filaFin; r++) {
                    const fila = [];
                    for (let c = rangoParsed.colInicio; c <= rangoParsed.colFin; c++) {
                        const celda = data[r] && data[r][c];
                        fila.push(celda && celda.v ? celda.v.toString() : '');
                    }
                    datosExtraidos.push(fila);
                }
            }
        } else {
            // Si no hay rango específico, usar todos los datos
            datosExtraidos = data.map(fila => {
                return fila ? fila.map(celda => celda && celda.v ? celda.v.toString() : '') : [];
            }).filter(fila => fila.some(celda => celda.trim() !== ''));
        }
        
        // Generar CSV con información de posición
        const csvContent = rangoActivo ? 
            generarCSVConPosicion(datosExtraidos, rangoActivo) :
            datosExtraidos.map(fila => fila.join(',')).join('\n');
        
        document.getElementById('csv-data').value = csvContent;
        console.log(`🔄 Datos sincronizados desde Excel a CSV${rangoActivo ? ` (rango: ${rangoActivo})` : ''}`);
        
    } catch (error) {
        console.error('❌ Error al sincronizar desde Excel:', error);
    }
}

/**
 * Sincronizar datos desde CSV a Excel
 */
function sincronizarAExcel() {
    const csvContent = document.getElementById('csv-data').value.trim();
    
    if (!csvContent) {
        console.warn('⚠️ No hay datos CSV para sincronizar');
        return;
    }
    
    try {
        // Parsear CSV
        const lineas = csvContent.split('\n').filter(l => l.trim());
        const datos = lineas.map(linea => {
            return linea.split(',').map(celda => ({
                v: celda.trim().replace(/^"|"$/g, ''), // Remover comillas
                ct: {fa: "General", t: "g"}
            }));
        });
        
        // Crear estructura de datos para Luckysheet
        const celldata = [];
        datos.forEach((fila, r) => {
            fila.forEach((celda, c) => {
                if (celda.v) {
                    celldata.push({r, c, v: celda});
                }
            });
        });
        
        // Actualizar Luckysheet
        if (luckysheet && luckysheet.setSheetData) {
            luckysheet.setSheetData([{
                name: "Tabla",
                celldata: celldata,
                row: Math.max(datos.length + 5, 20),
                column: Math.max(datos[0]?.length + 2 || 0, 10)
            }]);
            
            console.log('🔄 Datos sincronizados desde CSV a Excel');
        }
        
    } catch (error) {
        console.error('❌ Error al sincronizar a Excel:', error);
        alert('Error al parsear CSV: ' + error.message);
    }
}

/**
 * Exportar datos como CSV
 */
function exportarCSV() {
    sincronizarDesdeExcel();
    const csvContent = document.getElementById('csv-data').value;
    
    if (!csvContent.trim()) {
        alert('No hay datos para exportar');
        return;
    }
    
    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tabla_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('📥 CSV exportado');
}

/**
 * Importar CSV desde archivo
 */
function importarCSV() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const csvContent = e.target.result;
            document.getElementById('csv-data').value = csvContent;
            sincronizarAExcel();
            console.log('📤 CSV importado');
        };
        reader.readAsText(file);
    };
    input.click();
}

/**
 * Limpiar hoja de cálculo
 */
function limpiarHoja() {
    if (confirm('¿Estás seguro de limpiar toda la hoja?')) {
        if (luckysheet && luckysheet.setSheetData) {
            luckysheet.setSheetData([{
                name: "Tabla",
                celldata: [],
                row: 20,
                column: 10
            }]);
        }
        document.getElementById('csv-data').value = '';
        console.log('🧹 Hoja limpiada');
    }
}

/**
 * Cargar datos en Luckysheet con posicionamiento correcto
 */
function cargarDatosEnLuckysheet(datos, rangoOriginal = null) {
    if (!datos || datos.length === 0) {
        console.warn('⚠️ No hay datos para cargar en Luckysheet');
        return;
    }
    
    // Verificar que Luckysheet esté disponible
    if (typeof luckysheet === 'undefined') {
        console.error('❌ Luckysheet no está disponible');
        return;
    }
    
    try {
        console.log(`📊 Cargando ${datos.length} filas × ${datos[0]?.length || 0} columnas en Luckysheet`);
        
        // Obtener posición inicial del rango
        let filaInicial = 0;
        let columnaInicial = 0;
        
        if (rangoOriginal) {
            const rangoParsed = parsearRango(rangoOriginal);
            if (rangoParsed) {
                filaInicial = rangoParsed.filaInicio;
                columnaInicial = rangoParsed.colInicio;
                console.log(`📍 Posicionando datos en: Fila ${filaInicial + 1}, Columna ${numeroAColumnaLetra(columnaInicial)}`);
            }
        }
        
        // Crear estructura de datos para Luckysheet
        const celldata = [];
        
        datos.forEach((fila, r) => {
            if (Array.isArray(fila)) {
                fila.forEach((celda, c) => {
                    if (celda !== null && celda !== undefined && celda !== '') {
                        const valorCelda = {
                            r: r + filaInicial, // Posicionar en el rango correcto
                            c: c + columnaInicial, // Posicionar en el rango correcto
                            v: {
                                v: celda.toString(),
                                ct: {fa: "General", t: "g"}
                            }
                        };
                        
                        // Estilo especial para headers (primera fila de datos)
                        if (r === 0) {
                            valorCelda.v.bg = "#e3f2fd";
                            valorCelda.v.fc = "#1565c0";
                            valorCelda.v.bl = 1; // Bold
                        }
                        
                        celldata.push(valorCelda);
                    }
                });
            }
        });
        
        // Agregar indicadores de rango (bordes visuales)
        if (rangoOriginal) {
            const rangoParsed = parsearRango(rangoOriginal);
            if (rangoParsed) {
                // Agregar bordes al rango
                for (let r = rangoParsed.filaInicio; r <= rangoParsed.filaFin; r++) {
                    for (let c = rangoParsed.colInicio; c <= rangoParsed.colFin; c++) {
                        // Buscar si ya existe la celda
                        let celdaExistente = celldata.find(cell => cell.r === r && cell.c === c);
                        
                        if (!celdaExistente) {
                            // Crear celda vacía con borde
                            celdaExistente = {
                                r: r,
                                c: c,
                                v: {
                                    v: "",
                                    ct: {fa: "General", t: "g"}
                                }
                            };
                            celldata.push(celdaExistente);
                        }
                        
                        // Agregar bordes
                        celdaExistente.v.bd = {
                            t: {style: 1, color: "#2196f3"}, // Top
                            b: {style: 1, color: "#2196f3"}, // Bottom
                            l: {style: 1, color: "#2196f3"}, // Left
                            r: {style: 1, color: "#2196f3"}  // Right
                        };
                    }
                }
            }
        }
        
        // Configurar dimensiones de la hoja completa
        const maxFila = Math.max(...celldata.map(c => c.r), 50);
        const maxColumna = Math.max(...celldata.map(c => c.c), 20);
        
        console.log(`📐 Configurando hoja: ${maxFila + 1} filas × ${maxColumna + 1} columnas`);
        
        // Crear configuración de hoja
        const sheetConfig = {
            name: "Datos Tablas",
            color: "",
            index: 0,
            status: 1,
            order: 0,
            hide: 0,
            row: maxFila + 10,
            column: maxColumna + 5,
            defaultRowHeight: 25,
            defaultColWidth: 100,
            celldata: celldata
        };
        
        // Actualizar Luckysheet
        if (luckysheet.setSheetData) {
            luckysheet.setSheetData([sheetConfig]);
            
            // Navegar al rango específico
            if (rangoOriginal) {
                setTimeout(() => {
                    try {
                        luckysheet.scrollToRange({
                            row: [filaInicial, filaInicial + datos.length - 1],
                            column: [columnaInicial, columnaInicial + (datos[0]?.length || 1) - 1]
                        });
                        console.log(`🎯 Navegado al rango: ${rangoOriginal}`);
                    } catch (scrollError) {
                        console.warn('⚠️ No se pudo navegar al rango:', scrollError);
                    }
                }, 500);
            }
            
            console.log(`✅ Datos cargados exitosamente en Luckysheet en posición ${rangoOriginal || 'A1'}`);
        } else {
            console.warn('⚠️ luckysheet.setSheetData no está disponible, intentando método alternativo');
            recrearLuckysheeetConDatos(sheetConfig, filaInicial, columnaInicial);
        }
        
    } catch (error) {
        console.error('❌ Error al cargar datos en Luckysheet:', error);
        mostrarNotificacion('error', `Error al cargar datos en el editor: ${error.message}`);
    }
}

/**
 * Generar CSV con información de posición
 */
function generarCSVConPosicion(datos, rango) {
    if (!datos || datos.length === 0) return '';
    
    const rangoParsed = parsearRango(rango);
    let csvContent = '';
    
    if (rangoParsed) {
        // Agregar header con información del rango
        csvContent += `# Tabla en rango: ${rango}\n`;
        csvContent += `# Posición: ${numeroAColumnaLetra(rangoParsed.colInicio)}${rangoParsed.filaInicio + 1}\n`;
        csvContent += `# Dimensiones: ${datos.length} filas × ${datos[0]?.length || 0} columnas\n`;
        csvContent += `# ==========================================\n`;
    }
    
    // Agregar datos CSV
    csvContent += datos.map(fila => fila.join(',')).join('\n');
    
    return csvContent;
}

/**
 * Recrear Luckysheet con datos en posición específica
 */
function recrearLuckysheeetConDatos(sheetConfig, filaInicial, columnaInicial) {
    luckysheet.destroy();
    
    setTimeout(() => {
        const options = {
            container: 'luckysheet-container',
            lang: 'es',
            title: 'Editor de Tabla',
            showtoolbar: true,
            showinfobar: false,
            showsheetbar: false,
            showstatisticBar: false,
            allowCopy: true,
            allowEdit: true,
            allowUpdate: true,
            data: [sheetConfig],
            hook: {
                sheetCreateAfter: function() {
                    // Navegar al rango después de crear
                    setTimeout(() => {
                        try {
                            luckysheet.scrollToRange({
                                row: [filaInicial, filaInicial + 10],
                                column: [columnaInicial, columnaInicial + 5]
                            });
                        } catch (e) {
                            console.warn('⚠️ No se pudo navegar:', e);
                        }
                    }, 200);
                }
            }
        };
        
        luckysheet.create(options);
        console.log('✅ Luckysheet recreado con datos posicionados');
    }, 100);
}

/**
 * Formatear CSV
 */
function formatearCSV() {
    const csvContent = document.getElementById('csv-data').value.trim();
    if (!csvContent) return;
    
    try {
        const lineas = csvContent.split('\n');
        const datosFormateados = lineas.map(linea => {
            return linea.split(',').map(celda => celda.trim()).join(',');
        }).join('\n');
        
        document.getElementById('csv-data').value = datosFormateados;
        console.log('✨ CSV formateado');
        
    } catch (error) {
        console.error('❌ Error al formatear CSV:', error);
    }
}

/**
 * ============================================================================
 * SISTEMA DE GESTIÓN DE RANGOS
 * ============================================================================
 */

/**
 * Parsear rango Excel (ej: A1:E10) a coordenadas
 */
function parsearRango(rango) {
    const match = rango.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/i);
    if (!match) return null;
    
    const [, colInicioStr, filaInicio, colFinStr, filaFin] = match;
    
    return {
        colInicio: columnaLetraANumero(colInicioStr.toUpperCase()),
        filaInicio: parseInt(filaInicio) - 1, // Convertir a 0-based
        colFin: columnaLetraANumero(colFinStr.toUpperCase()),
        filaFin: parseInt(filaFin) - 1,
        original: rango
    };
}

/**
 * Convertir coordenadas a rango Excel
 */
function coordenadasARango(colInicio, filaInicio, colFin, filaFin) {
    const colInicioStr = numeroAColumnaLetra(colInicio);
    const colFinStr = numeroAColumnaLetra(colFin);
    return `${colInicioStr}${filaInicio + 1}:${colFinStr}${filaFin + 1}`;
}

/**
 * Convertir número a letra de columna (0=A, 1=B, etc.)
 */
function numeroAColumnaLetra(num) {
    let resultado = '';
    while (num >= 0) {
        resultado = String.fromCharCode(65 + (num % 26)) + resultado;
        num = Math.floor(num / 26) - 1;
    }
    return resultado;
}

/**
 * Verificar si dos rangos se empalman
 */
function rangosSeEmpalman(rango1, rango2) {
    const r1 = parsearRango(rango1);
    const r2 = parsearRango(rango2);
    
    if (!r1 || !r2) return false;
    
    // Verificar si hay intersección
    const noSeEmpalman = (
        r1.colFin < r2.colInicio || 
        r2.colFin < r1.colInicio || 
        r1.filaFin < r2.filaInicio || 
        r2.filaFin < r1.filaInicio
    );
    
    return !noSeEmpalman;
}

/**
 * Cargar rangos ocupados por otras tablas
 */
function cargarRangosOcupados() {
    rangosOcupados = [];
    
    tablasData.forEach(tabla => {
        if (tabla.DatosCSV && tabla.DatosCSV.includes('!')) {
            const [hoja, rango] = tabla.DatosCSV.split('!');
            
            // Solo considerar rangos de "Datos Tablas"
            if (hoja.trim().toLowerCase().includes('datos') && hoja.trim().toLowerCase().includes('tablas')) {
                rangosOcupados.push({
                    tabla: `${tabla.SeccionOrden}.${tabla.OrdenTabla}`,
                    rango: rango.trim(),
                    referencia: tabla.DatosCSV,
                    id: tabla.id
                });
            }
        }
    });
    
    console.log(`📋 Rangos ocupados cargados: ${rangosOcupados.length}`, rangosOcupados);
}

/**
 * Verificar conflictos de rango
 */
function verificarConflictosRango(nuevoRango) {
    const conflictos = [];
    
    rangosOcupados.forEach(ocupado => {
        // No verificar contra la tabla actual si estamos editando
        if (modoEdicion === 'edit' && tablaActual && ocupado.id === tablaActual.id) {
            return;
        }
        
        if (rangosSeEmpalman(nuevoRango, ocupado.rango)) {
            conflictos.push(ocupado);
        }
    });
    
    return conflictos;
}

/**
 * Sugerir rango libre
 */
function sugerirRangoLibre(filas = 10, columnas = 5) {
    const hojaName = 'Datos Tablas';
    
    // Empezar desde A1 y buscar el primer espacio libre
    let filaInicio = 0;
    let encontrado = false;
    
    while (!encontrado && filaInicio < 1000) { // Límite de seguridad
        const rangoSugerido = coordenadasARango(0, filaInicio, columnas - 1, filaInicio + filas - 1);
        const referenciaCompleta = `${hojaName}!${rangoSugerido}`;
        
        const conflictos = verificarConflictosRango(rangoSugerido);
        
        if (conflictos.length === 0) {
            return {
                rango: rangoSugerido,
                referencia: referenciaCompleta,
                filas: filas,
                columnas: columnas
            };
        }
        
        // Mover a la siguiente posición libre
        filaInicio += filas + 2; // Agregar 2 filas de separación
    }
    
    return null;
}

/**
 * Actualizar rango basado en datos actuales de Luckysheet
 */
function actualizarRangoSegunDatos() {
    if (!luckysheet || !luckysheet.getSheetData) {
        console.warn('⚠️ No se puede obtener datos de Luckysheet');
        return;
    }
    
    try {
        const data = luckysheet.getSheetData();
        if (!data || data.length === 0) return;
        
        // Encontrar la última fila y columna con datos
        let ultimaFila = 0;
        let ultimaColumna = 0;
        
        data.forEach((fila, r) => {
            if (Array.isArray(fila)) {
                fila.forEach((celda, c) => {
                    if (celda && celda.v && celda.v.toString().trim() !== '') {
                        ultimaFila = Math.max(ultimaFila, r);
                        ultimaColumna = Math.max(ultimaColumna, c);
                    }
                });
            }
        });
        
        // Crear nuevo rango
        const nuevoRango = coordenadasARango(0, 0, ultimaColumna, ultimaFila);
        const nuevaReferencia = `Datos Tablas!${nuevoRango}`;
        
        // Verificar conflictos
        const conflictos = verificarConflictosRango(nuevoRango);
        
        if (conflictos.length > 0) {
            // Hay conflictos, sugerir rango alternativo
            const sugerencia = sugerirRangoLibre(ultimaFila + 1, ultimaColumna + 1);
            if (sugerencia) {
                document.getElementById('tabla-datos-csv').value = sugerencia.referencia;
                mostrarNotificacion('warning', `⚠️ Rango actualizado para evitar conflictos: ${sugerencia.referencia}`);
            }
        } else {
            // No hay conflictos, usar el rango calculado
            document.getElementById('tabla-datos-csv').value = nuevaReferencia;
            mostrarNotificacion('success', `✅ Rango actualizado automáticamente: ${nuevaReferencia}`);
        }
        
        rangoActual = nuevoRango;
        
    } catch (error) {
        console.error('❌ Error al actualizar rango:', error);
    }
}

/**
 * Validar rango en tiempo real
 */
function validarRangoEnTiempoReal() {
    const referencia = document.getElementById('tabla-datos-csv').value.trim();
    const input = document.getElementById('tabla-datos-csv');
    const feedback = document.getElementById('rango-feedback') || crearElementoFeedback();
    
    if (!referencia) {
        input.classList.remove('is-valid', 'is-invalid');
        feedback.innerHTML = '';
        return;
    }
    
    if (!referencia.includes('!')) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        feedback.innerHTML = '<small class="text-danger">Formato inválido. Usa: Datos Tablas!A1:E10</small>';
        return;
    }
    
    const [hoja, rango] = referencia.split('!');
    
    // Verificar que sea la hoja correcta
    if (!hoja.toLowerCase().includes('datos') || !hoja.toLowerCase().includes('tablas')) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        feedback.innerHTML = '<small class="text-warning">⚠️ Se recomienda usar la hoja "Datos Tablas"</small>';
        return;
    }
    
    // Verificar conflictos
    const conflictos = verificarConflictosRango(rango.trim());
    
    if (conflictos.length > 0) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        const tablaConflicto = conflictos[0];
        feedback.innerHTML = `<small class="text-danger">❌ Conflicto con Tabla ${tablaConflicto.tabla} (${tablaConflicto.rango})</small>`;
        
        // Sugerir alternativa
        setTimeout(() => {
            const sugerencia = sugerirRangoLibre();
            if (sugerencia) {
                feedback.innerHTML += `<br><small class="text-info">💡 Sugerencia: ${sugerencia.referencia}</small>`;
            }
        }, 100);
        
    } else {
        input.classList.add('is-valid');
        input.classList.remove('is-invalid');
        feedback.innerHTML = '<small class="text-success">✅ Rango disponible</small>';
    }
}

/**
 * Crear elemento de feedback para el rango
 */
function crearElementoFeedback() {
    const input = document.getElementById('tabla-datos-csv');
    const feedback = document.createElement('div');
    feedback.id = 'rango-feedback';
    feedback.className = 'mt-1';
    
    input.parentNode.appendChild(feedback);
    return feedback;
}

/**
 * Probar carga de datos (función de debug)
 */
function probarCargaDatos() {
    console.log('🧪 Iniciando prueba de carga de datos...');
    
    // Datos de prueba
    const datosEjemplo = [
        ['Tecnología', '2020', '2021', '2022', '2023'],
        ['Solar', '100', '150', '200', '250'],
        ['Eólica', '80', '120', '160', '200'],
        ['Hidroeléctrica', '300', '310', '320', '330'],
        ['Total', '480', '580', '680', '780']
    ];
    
    console.log('📊 Datos de ejemplo:', datosEjemplo);
    
    // Establecer un rango de ejemplo
    const rangoEjemplo = 'A1:E5';
    document.getElementById('tabla-datos-csv').value = `Datos Tablas!${rangoEjemplo}`;
    
    // Cargar en Luckysheet con posicionamiento
    cargarDatosEnLuckysheet(datosEjemplo, rangoEjemplo);
    
    // Cargar en CSV con información de posición
    const csvContent = generarCSVConPosicion(datosEjemplo, rangoEjemplo);
    document.getElementById('csv-data').value = csvContent;
    
    // Actualizar rango automáticamente
    setTimeout(() => {
        actualizarRangoSegunDatos();
    }, 1000);
    
    mostrarNotificacion('success', '🧪 Datos de prueba cargados correctamente');
}

/**
 * Sugerir rango automático
 */
function sugerirRangoAutomatico() {
    const sugerencia = sugerirRangoLibre();
    
    if (sugerencia) {
        document.getElementById('tabla-datos-csv').value = sugerencia.referencia;
        validarRangoEnTiempoReal();
        mostrarNotificacion('success', `💡 Rango sugerido: ${sugerencia.referencia}`);
    } else {
        mostrarNotificacion('error', '❌ No se pudo encontrar un rango libre');
    }
}

/**
 * Actualizar indicador de rango en la interfaz
 */
function actualizarIndicadorRango() {
    const referencia = document.getElementById('tabla-datos-csv').value.trim();
    const indicador = document.getElementById('rango-texto');
    
    if (!indicador) return;
    
    if (!referencia || !referencia.includes('!')) {
        indicador.textContent = 'Sin rango';
        indicador.parentElement.className = 'text-muted fw-bold';
        return;
    }
    
    const [hoja, rango] = referencia.split('!');
    const rangoParsed = parsearRango(rango.trim());
    
    if (rangoParsed) {
        const inicio = `${numeroAColumnaLetra(rangoParsed.colInicio)}${rangoParsed.filaInicio + 1}`;
        const fin = `${numeroAColumnaLetra(rangoParsed.colFin)}${rangoParsed.filaFin + 1}`;
        const filas = rangoParsed.filaFin - rangoParsed.filaInicio + 1;
        const columnas = rangoParsed.colFin - rangoParsed.colInicio + 1;
        
        indicador.innerHTML = `${inicio}:${fin} <small>(${filas}×${columnas})</small>`;
        
        // Color según conflictos
        const conflictos = verificarConflictosRango(rango.trim());
        if (conflictos.length > 0) {
            indicador.parentElement.className = 'text-danger fw-bold';
        } else {
            indicador.parentElement.className = 'text-success fw-bold';
        }
    } else {
        indicador.textContent = 'Rango inválido';
        indicador.parentElement.className = 'text-warning fw-bold';
    }
}

/**
 * Verificar conflictos del rango actual
 */
function verificarConflictos() {
    const referencia = document.getElementById('tabla-datos-csv').value.trim();
    
    if (!referencia || !referencia.includes('!')) {
        mostrarNotificacion('warning', '⚠️ Ingresa una referencia válida primero');
        return;
    }
    
    const [hoja, rango] = referencia.split('!');
    const conflictos = verificarConflictosRango(rango.trim());
    
    if (conflictos.length === 0) {
        mostrarNotificacion('success', '✅ No hay conflictos con este rango');
    } else {
        const mensaje = `❌ Conflictos encontrados:\n${conflictos.map(c => `• Tabla ${c.tabla}: ${c.rango}`).join('\n')}`;
        alert(mensaje);
        
        // Sugerir alternativa
        const sugerencia = sugerirRangoLibre();
        if (sugerencia) {
            if (confirm(`¿Quieres usar el rango sugerido: ${sugerencia.referencia}?`)) {
                document.getElementById('tabla-datos-csv').value = sugerencia.referencia;
                validarRangoEnTiempoReal();
            }
        }
    }
}

/**
 * Cancelar edición
 */
function cancelarEdicion() {
    if (confirm('¿Estás seguro de cancelar? Se perderán los cambios no guardados.')) {
        window.location.href = 'editor.html#tablas';
    }
}

/**
 * Validar CSV y mostrar estadísticas
 */
function validarCSV() {
    const csvContent = document.getElementById('csv-data').value;
    const statsElement = document.getElementById('csv-stats');
    
    if (!csvContent.trim()) {
        if (statsElement) statsElement.textContent = '0 líneas';
        mostrarNotificacion('warning', '⚠️ El CSV está vacío');
        return;
    }
    
    try {
        const lineas = csvContent.split('\n');
        const lineasConDatos = lineas.filter(l => l.trim() && !l.trim().startsWith('#'));
        const comentarios = lineas.filter(l => l.trim().startsWith('#'));
        
        let columnas = 0;
        if (lineasConDatos.length > 0) {
            columnas = lineasConDatos[0].split(',').length;
        }
        
        // Actualizar estadísticas
        if (statsElement) {
            statsElement.textContent = `${lineasConDatos.length} filas × ${columnas} cols`;
        }
        
        // Validar consistencia de columnas
        let errores = [];
        lineasConDatos.forEach((linea, index) => {
            const colsEnLinea = linea.split(',').length;
            if (colsEnLinea !== columnas) {
                errores.push(`Línea ${index + 1}: ${colsEnLinea} columnas (esperadas: ${columnas})`);
            }
        });
        
        if (errores.length === 0) {
            mostrarNotificacion('success', `✅ CSV válido: ${lineasConDatos.length} filas × ${columnas} columnas${comentarios.length > 0 ? ` (${comentarios.length} comentarios)` : ''}`);
        } else {
            mostrarNotificacion('error', `❌ Errores encontrados:\n${errores.slice(0, 3).join('\n')}${errores.length > 3 ? `\n... y ${errores.length - 3} más` : ''}`);
        }
        
    } catch (error) {
        mostrarNotificacion('error', `❌ Error al validar CSV: ${error.message}`);
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTablaEditor);
} else {
    initTablaEditor();
}

// Actualizar estadísticas CSV en tiempo real
setTimeout(() => {
    const csvTextarea = document.getElementById('csv-data');
    if (csvTextarea) {
        csvTextarea.addEventListener('input', function() {
            clearTimeout(window.csvValidationTimeout);
            window.csvValidationTimeout = setTimeout(validarCSV, 300);
        });
    }
}, 1000);

// Exponer funciones globalmente
window.cargarDatosDesdeReferencia = cargarDatosDesdeReferencia;
window.mostrarTablasExistentes = mostrarTablasExistentes;
window.validarDuplicados = validarDuplicados;
window.previsualizarCSV = previsualizarCSV;
window.agregarFilaCSV = agregarFilaCSV;
window.agregarColumnaCSV = agregarColumnaCSV;
window.guardarTabla = guardarTabla;
window.cancelarEdicion = cancelarEdicion;

// Funciones del editor Excel
window.agregarFila = agregarFila;
window.agregarColumna = agregarColumna;
window.eliminarFila = eliminarFila;
window.eliminarColumna = eliminarColumna;
window.sincronizarDesdeExcel = sincronizarDesdeExcel;
window.sincronizarAExcel = sincronizarAExcel;
window.exportarCSV = exportarCSV;
window.importarCSV = importarCSV;
window.limpiarHoja = limpiarHoja;
window.formatearCSV = formatearCSV;
window.probarCargaDatos = probarCargaDatos;
window.validarCSV = validarCSV;

// Funciones de gestión de rangos
window.sugerirRangoAutomatico = sugerirRangoAutomatico;
window.verificarConflictos = verificarConflictos;
window.actualizarRangoSegunDatos = actualizarRangoSegunDatos;