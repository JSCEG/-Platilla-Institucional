# Sistema de Figuras Nuevo - Desde Cero

## 🎯 Objetivo

Crear un sistema CRUD completamente nuevo para figuras, limpio y sin los problemas del anterior:
- ✅ Código simple y mantenible
- ✅ Validaciones robustas
- ✅ Modal estable
- ✅ Sin conflictos de funciones
- ✅ Manejo de errores claro

## 📁 Archivos Creados

### Backend (Google Apps Script)
- **`back/figuras_nuevo.gs`**: Script limpio con 4 operaciones CRUD básicas

### Frontend (JavaScript)
- **`web/js/figuras-nuevo.js`**: Módulo frontend completamente nuevo
- **`web/figuras-nueva-vista.html`**: Vista HTML limpia para testing
- **`web/test-figuras-nuevo.html`**: Página de pruebas y documentación

### Configuración
- **Actualizado `web/js/config.js`**: Nueva URL para el script

## 🚀 Pasos para Implementar

### 1. Desplegar Google Apps Script

1. Ve a [Google Apps Script](https://script.google.com)
2. Crea un nuevo proyecto
3. Copia todo el contenido de `back/figuras_nuevo.gs`
4. Guarda el proyecto
5. Despliega como Web App:
   - Ejecutar como: Tu cuenta
   - Acceso: Cualquiera
6. Copia la URL generada

### 2. Configurar Frontend

1. Edita `web/js/figuras-nuevo.js`
2. En la línea 12, reemplaza:
   ```javascript
   API_URL: 'https://script.google.com/macros/s/TU_SCRIPT_ID_AQUI/exec'
   ```
   Con tu URL real del paso 1

### 3. Actualizar Editor Principal

1. Edita `web/editor.html`
2. Cambia la línea:
   ```html
   <script src="js/figuras-table.js"></script>
   ```
   Por:
   ```html
   <script src="js/figuras-nuevo.js"></script>
   ```

## 🎨 Características del Nuevo Sistema

### Backend Simplificado
```javascript
// 4 operaciones básicas y claras
- LISTAR_FIGURAS: Obtener todas las figuras
- CREAR_FIGURA: Crear nueva figura
- ACTUALIZAR_FIGURA: Modificar figura existente  
- ELIMINAR_FIGURA: Eliminar figura
```

### Frontend Robusto
```javascript
// Funciones principales
- initFiguras(): Inicialización
- cargarFiguras(): Carga desde API
- renderizarFiguras(): Renderizado de tabla
- mostrarModalNuevaFigura(): Modal limpio
- crearFigura(): Creación con validaciones
- editarFigura(): Edición (por implementar)
- eliminarFigura(): Eliminación con confirmación
```

### Validaciones Mejoradas
- ✅ Campos obligatorios
- ✅ Formato de sección (1, 1.1, 1.2.1)
- ✅ Orden numérico > 0
- ✅ Duplicados (misma sección.orden)
- ✅ Manejo de errores claro

### Modal Estable
- ✅ Sin conflictos de event listeners
- ✅ Auto-sugerencia de rutas
- ✅ Validación antes de envío
- ✅ Limpieza automática al cerrar

## 📊 Estructura de Datos

### Google Sheets (Hoja "Figuras")
| Columna A | Columna B | Columna C | Columna D | Columna E | Columna F |
|-----------|-----------|-----------|-----------|-----------|-----------|
| DocumentoID | SeccionOrden | OrdenFigura | RutaArchivo | Caption | Fuente |
| D01 | 1 | 1 | img/fig1.png | Título figura | SENER, 2024 |

### Objeto Figura (JavaScript)
```javascript
{
    DocumentoID: "D01",
    SeccionOrden: "1",
    OrdenFigura: "1", 
    RutaArchivo: "img/graficos/figura_1_1.png",
    Caption: "Título de la figura",
    Fuente: "SENER, 2024",
    id: "1-1" // ID compuesto para frontend
}
```

## 🧪 Testing

### Archivo de Prueba
- **`web/test-figuras-nuevo.html`**: Documentación y tests
- **`web/figuras-nueva-vista.html`**: Vista completa funcional

### Casos de Prueba
1. **Crear figura**: Modal → Validar → Guardar → Recargar
2. **Listar figuras**: Carga automática al iniciar
3. **Eliminar figura**: Confirmación → API → Recargar
4. **Validaciones**: Campos vacíos, formatos incorrectos

## 🔄 Migración del Sistema Anterior

### Archivos a Reemplazar
- ❌ `web/js/figuras-table.js` → ✅ `web/js/figuras-nuevo.js`
- ❌ `back/figuras_debug.gs` → ✅ `back/figuras_nuevo.gs`

### Archivos a Mantener
- ✅ `web/js/config.js` (actualizado)
- ✅ `web/css/bootstrap-overrides.css`
- ✅ Estructura HTML del editor principal

## 🎯 Ventajas del Nuevo Sistema

### Código Limpio
- Sin funciones duplicadas
- Sin conflictos de nombres
- Estructura modular clara
- Comentarios descriptivos

### Robustez
- Manejo de errores completo
- Validaciones en frontend y backend
- Confirmaciones de usuario
- Feedback visual claro

### Mantenibilidad
- Funciones pequeñas y específicas
- Separación de responsabilidades
- Fácil debugging
- Extensible para nuevas funciones

## 🚀 Estado Actual

- ✅ **Backend**: Completo y funcional
- ✅ **Frontend**: CRUD básico implementado
- ✅ **Vista**: HTML limpio creado
- ✅ **Testing**: Archivos de prueba listos
- 🔄 **Pendiente**: Desplegar y configurar URLs

Una vez desplegado el Google Apps Script y actualizada la URL, el sistema estará completamente funcional y libre de los problemas anteriores.