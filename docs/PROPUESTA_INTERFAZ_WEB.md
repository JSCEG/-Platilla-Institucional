# Propuesta: Interfaz Web para Edición de Documentos LaTeX

## 🎯 Concepto

Crear una **aplicación web** que funcione como editor visual para los documentos LaTeX almacenados en Google Sheets, sin necesidad de editar directamente el Excel.

---

## 📋 Funcionalidades Principales

### 1. Dashboard Principal
```
┌─────────────────────────────────────────────────────────┐
│  📄 SENER LaTeX Editor                    [Generar PDF] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Documentos Disponibles:                                │
│                                                          │
│  ┌──────────────────────────────────────────┐          │
│  │ 📄 D01 - Informe Energía 2025            │          │
│  │    Última modificación: 08/12/2025       │          │
│  │    [Editar] [Ver Preview] [Generar .tex] │          │
│  └──────────────────────────────────────────┘          │
│                                                          │
│  ┌──────────────────────────────────────────┐          │
│  │ 📄 D02 - Reporte Renovables              │          │
│  │    Última modificación: 05/12/2025       │          │
│  │    [Editar] [Ver Preview] [Generar .tex] │          │
│  └──────────────────────────────────────────┘          │
│                                                          │
│  [+ Nuevo Documento]                                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

### 2. Editor de Documento

```
┌─────────────────────────────────────────────────────────┐
│  ← Volver  |  📄 Informe Energía 2025  |  [Guardar]    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Tabs: [Metadatos] [Secciones] [Tablas] [Figuras]      │
│        [Bibliografía] [Siglas] [Glosario]               │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ METADATOS                                          │ │
│  │                                                    │ │
│  │ Título:                                            │ │
│  │ [Informe de Energía 2025                        ] │ │
│  │                                                    │ │
│  │ Subtítulo:                                         │ │
│  │ [Análisis del sector energético mexicano        ] │ │
│  │                                                    │ │
│  │ Autor:                                             │ │
│  │ [Secretaría de Energía                          ] │ │
│  │                                                    │ │
│  │ Fecha:                                             │ │
│  │ [📅 08/12/2025                                   ] │ │
│  │                                                    │ │
│  │ Palabras Clave:                                    │ │
│  │ [energía, renovables, México                    ] │ │
│  │                                                    │ │
│  │ Resumen Ejecutivo:                                 │ │
│  │ ┌────────────────────────────────────────────┐   │ │
│  │ │ El sistema energético mexicano...          │   │ │
│  │ │                                             │   │ │
│  │ │ [Editor de texto enriquecido]              │   │ │
│  │ └────────────────────────────────────────────┘   │ │
│  │                                                    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

### 3. Editor de Secciones

```
┌─────────────────────────────────────────────────────────┐
│  Tab: SECCIONES                          [+ Nueva]      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Estructura del Documento:                              │
│                                                          │
│  ┌──────────────────────────────────────────┐          │
│  │ ▼ 1. Contexto general                    │ [↑][↓]   │
│  │    Nivel: Sección                        │ [✏️][🗑️] │
│  │    El sistema energético mexicano...     │          │
│  │                                           │          │
│  │    ▼ 1.1 Evolución de la capacidad       │ [↑][↓]   │
│  │       Nivel: Subsección                  │ [✏️][🗑️] │
│  │       Durante el periodo 2020-2025...    │          │
│  │                                           │          │
│  │       ▶ 1.1.1 Integración de renovables  │ [↑][↓]   │
│  │          Nivel: Subsubsección            │ [✏️][🗑️] │
│  │                                           │          │
│  │    ▶ 1.2 Otra subsección                 │ [↑][↓]   │
│  │                                           │ [✏️][🗑️] │
│  │                                           │          │
│  │ ▶ 2. Siguiente sección                   │ [↑][↓]   │
│  │                                           │ [✏️][🗑️] │
│  └──────────────────────────────────────────┘          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

### 4. Editor de Tablas

```
┌─────────────────────────────────────────────────────────┐
│  Tab: TABLAS                             [+ Nueva Tabla]│
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Tablas del Documento:                                  │
│                                                          │
│  ┌──────────────────────────────────────────┐          │
│  │ Tabla 1: Capacidad instalada             │ [✏️][🗑️] │
│  │ Sección: 2.0 | Orden: 1                  │          │
│  │ Fuente: Elaboración propia...            │          │
│  │                                           │          │
│  │ Datos: Datos_Tablas!A1:E5                │          │
│  │ [Ver/Editar Datos]                       │          │
│  │                                           │          │
│  │ Notas al pie:                             │          │
│  │ • 1/ Cifras al cierre del año            │          │
│  │ • 6/ Cifras al cierre de junio           │          │
│  │ [+ Agregar Nota]                         │          │
│  └──────────────────────────────────────────┘          │
│                                                          │
│  ┌──────────────────────────────────────────┐          │
│  │ Tabla 2: Consumo por sector              │ [✏️][🗑️] │
│  │ ...                                       │          │
│  └──────────────────────────────────────────┘          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

### 5. Editor Visual de Tabla (Modal)

```
┌─────────────────────────────────────────────────────────┐
│  Editar Tabla: Capacidad instalada          [X Cerrar] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Título: [Capacidad instalada por tecnología         ] │
│                                                          │
│  Aparece en sección: [2.0 - Evolución de capacidad  ▼] │
│  Orden en sección:   [1                              ] │
│                                                          │
│  Fuente:                                                │
│  [Elaboración propia con datos de SENER              ] │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ DATOS DE LA TABLA                                  │ │
│  │                                                    │ │
│  │ ┌──────────────┬─────────┬─────────┬─────────┐   │ │
│  │ │ TECNOLOGÍA   │ 2024    │ 2025 1/ │ 2026 2/ │   │ │
│  │ ├──────────────┼─────────┼─────────┼─────────┤   │ │
│  │ │ Hidroeléc... │ 12,612  │ 12,800  │ 13,000  │   │ │
│  │ │ Geotermo...  │ 976     │ 980     │ 985     │   │ │
│  │ │ Eólica       │ 7,512   │ 8,000   │ 8,500   │   │ │
│  │ └──────────────┴─────────┴─────────┴─────────┘   │ │
│  │                                                    │ │
│  │ [+ Agregar Fila] [+ Agregar Columna]              │ │
│  │                                                    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ NOTAS AL PIE                                       │ │
│  │                                                    │ │
│  │ 1/ [Cifras al cierre del año                    ] │ │
│  │ 2/ [No incluye autoabastecimiento               ] │ │
│  │                                                    │ │
│  │ [+ Agregar Nota]                                   │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  [Cancelar]                              [Guardar Tabla]│
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Arquitectura Técnica

### Frontend (HTML/CSS/JS)

```
proyecto/
├── web/
│   ├── index.html          # Dashboard principal
│   ├── editor.html         # Editor de documento
│   ├── css/
│   │   ├── styles.css      # Estilos generales
│   │   └── editor.css      # Estilos del editor
│   ├── js/
│   │   ├── app.js          # Lógica principal
│   │   ├── api.js          # Comunicación con Google Sheets
│   │   ├── editor.js       # Lógica del editor
│   │   └── components/
│   │       ├── tabla-editor.js
│   │       ├── seccion-editor.js
│   │       └── metadata-editor.js
│   └── lib/
│       ├── quill.js        # Editor de texto enriquecido
│       └── handsontable.js # Editor de tablas tipo Excel
```

### Backend (Google Apps Script)

```javascript
// Code.gs - API para la interfaz web

/**
 * Servir la aplicación web
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('SENER LaTeX Editor')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * API: Obtener lista de documentos
 */
function getDocumentos() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = ss.getSheetByName('Documentos');
  const datos = hoja.getDataRange().getValues();
  
  // Convertir a JSON
  const headers = datos[0];
  const documentos = [];
  
  for (let i = 1; i < datos.length; i++) {
    const doc = {};
    headers.forEach((header, j) => {
      doc[header] = datos[i][j];
    });
    documentos.push(doc);
  }
  
  return documentos;
}

/**
 * API: Obtener documento completo por ID
 */
function getDocumento(docId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  return {
    metadata: obtenerDatosDocumento(docId),
    secciones: obtenerRegistros(ss, 'Secciones', docId, 'DocumentoID'),
    tablas: obtenerRegistros(ss, 'Tablas', docId, 'DocumentoID'),
    figuras: obtenerRegistros(ss, 'Figuras', docId, 'DocumentoID'),
    bibliografia: obtenerRegistros(ss, 'Bibliografia', docId, 'DocumentoID'),
    siglas: obtenerRegistros(ss, 'Siglas', docId, 'DocumentoID'),
    glosario: obtenerRegistros(ss, 'Glosario', docId, 'DocumentoID')
  };
}

/**
 * API: Guardar cambios en documento
 */
function guardarDocumento(docId, datos) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Actualizar cada hoja según los datos recibidos
  if (datos.metadata) {
    actualizarMetadata(docId, datos.metadata);
  }
  
  if (datos.secciones) {
    actualizarSecciones(docId, datos.secciones);
  }
  
  if (datos.tablas) {
    actualizarTablas(docId, datos.tablas);
  }
  
  // ... etc
  
  return { success: true, message: 'Documento guardado correctamente' };
}

/**
 * API: Crear nueva tabla
 */
function crearTabla(docId, datosTabla) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = ss.getSheetByName('Tablas');
  
  // Agregar nueva fila
  hoja.appendRow([
    docId,
    datosTabla.seccionOrden,
    datosTabla.ordenTabla,
    datosTabla.titulo,
    datosTabla.fuente,
    datosTabla.datosCSV
  ]);
  
  return { success: true };
}

/**
 * API: Generar .tex desde la interfaz
 */
function generarTexDesdeWeb(docId) {
  // Usar la función existente generarLatex()
  // pero retornar el contenido en lugar de guardarlo
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const datosDoc = obtenerDatosDocumento(docId);
  const secciones = obtenerRegistros(ss, 'Secciones', docId, 'DocumentoID');
  // ... obtener todo
  
  const tex = construirLatex(datosDoc, secciones, bibliografia, figuras, tablas, siglas, glosario, ss);
  
  return {
    success: true,
    contenido: tex,
    nombreArchivo: `${datosDoc['DocumentoCorto']}.tex`
  };
}
```

### Frontend JavaScript (api.js)

```javascript
// Comunicación con Google Apps Script

class SenerAPI {
  
  /**
   * Obtener lista de documentos
   */
  async getDocumentos() {
    return new Promise((resolve, reject) => {
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)
        .getDocumentos();
    });
  }
  
  /**
   * Obtener documento completo
   */
  async getDocumento(docId) {
    return new Promise((resolve, reject) => {
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)
        .getDocumento(docId);
    });
  }
  
  /**
   * Guardar cambios
   */
  async guardarDocumento(docId, datos) {
    return new Promise((resolve, reject) => {
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)
        .guardarDocumento(docId, datos);
    });
  }
  
  /**
   * Generar .tex
   */
  async generarTex(docId) {
    return new Promise((resolve, reject) => {
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)
        .generarTexDesdeWeb(docId);
    });
  }
}

const api = new SenerAPI();
```

---

## 🎨 Tecnologías Recomendadas

### 1. Framework CSS
- **Bootstrap 5** o **Tailwind CSS** - Para diseño responsive
- **Material Design** - Para look & feel profesional

### 2. Editor de Texto Enriquecido
- **Quill.js** - Editor WYSIWYG ligero
- **TinyMCE** - Más completo pero más pesado

### 3. Editor de Tablas
- **Handsontable** - Excel-like en el navegador
- **AG Grid** - Más potente pero complejo

### 4. Framework JS (Opcional)
- **Vue.js** - Ligero y fácil de aprender
- **React** - Más robusto pero más complejo
- **Vanilla JS** - Sin framework, más control

---

## 📱 Características Adicionales

### 1. Preview en Tiempo Real
```javascript
// Mostrar preview del LaTeX generado
function mostrarPreview(docId) {
  const tex = generarTexDesdeWeb(docId);
  // Mostrar en modal con syntax highlighting
  document.getElementById('preview').textContent = tex.contenido;
  hljs.highlightBlock(document.getElementById('preview'));
}
```

### 2. Validación en Tiempo Real
```javascript
// Validar datos antes de guardar
function validarTabla(tabla) {
  const errores = [];
  
  if (!tabla.titulo) {
    errores.push('El título es obligatorio');
  }
  
  if (!tabla.datosCSV) {
    errores.push('Debe especificar los datos de la tabla');
  }
  
  return errores;
}
```

### 3. Autoguardado
```javascript
// Guardar automáticamente cada 30 segundos
let cambiosPendientes = false;

setInterval(() => {
  if (cambiosPendientes) {
    guardarDocumento();
    cambiosPendientes = false;
  }
}, 30000);
```

### 4. Historial de Cambios
```javascript
// Registrar cambios en una hoja "Historial"
function registrarCambio(docId, usuario, accion, detalles) {
  const hoja = ss.getSheetByName('Historial');
  hoja.appendRow([
    new Date(),
    docId,
    usuario,
    accion,
    JSON.stringify(detalles)
  ]);
}
```

---

## 🚀 Ventajas de Esta Solución

1. ✅ **Interfaz amigable** - No necesitas saber Excel
2. ✅ **Validación en tiempo real** - Evita errores
3. ✅ **Preview instantáneo** - Ves cómo quedará el LaTeX
4. ✅ **Multiusuario** - Varios editores simultáneos
5. ✅ **Historial de cambios** - Auditoría completa
6. ✅ **Responsive** - Funciona en móvil/tablet
7. ✅ **Sin instalación** - Solo navegador web
8. ✅ **Integrado con Google** - Usa autenticación de Google

---

## 📊 Estimación de Desarrollo

### Fase 1: MVP (2-3 semanas)
- Dashboard básico
- Editor de metadatos
- Editor de secciones
- Generación de .tex

### Fase 2: Tablas y Figuras (2 semanas)
- Editor de tablas
- Editor de figuras
- Preview de tablas

### Fase 3: Extras (1-2 semanas)
- Bibliografía, siglas, glosario
- Validaciones
- Autoguardado
- Historial

### Fase 4: Pulido (1 semana)
- Diseño final
- Optimizaciones
- Testing
- Documentación

**Total: 6-8 semanas de desarrollo**

---

## 💡 ¿Quieres que empiece a implementarlo?

Puedo crear:
1. **Prototipo HTML** - Interfaz estática para ver cómo se vería
2. **MVP funcional** - Versión básica que funcione con Google Sheets
3. **Versión completa** - Con todas las características

¿Por cuál empezamos?
