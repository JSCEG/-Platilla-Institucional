# Bootstrap Integration - SENER LaTeX Editor

## 📋 Resumen

Se ha integrado Bootstrap 5.3.2 al editor LaTeX de SENER manteniendo **100% de compatibilidad** con el diseño y funcionalidades existentes.

## ✅ Lo que se mantiene intacto

- **Todos los estilos institucionales** (colores, tipografías, gradientes)
- **Todas las funcionalidades JavaScript existentes**
- **Todos los botones y formularios** funcionan igual
- **Layout y responsive design** original
- **Fuentes institucionales** (Patria, Noto Sans)
- **Paleta de colores GobMX** completa

## 🚀 Nuevas funcionalidades agregadas

### 1. Sistema de Notificaciones (Toasts)
```javascript
// Mostrar notificaciones
showSuccess("Documento guardado correctamente");
showError("Error al conectar con Google Sheets");
showInfo("Procesando documento...");
```

### 2. Tooltips mejorados
- Todos los botones principales ahora tienen tooltips informativos
- Se pueden agregar dinámicamente:
```javascript
addTooltip('#mi-boton', 'Texto del tooltip', 'top');
```

### 3. Dropdown mejorado en botón "Generar"
- Opciones adicionales: Vista previa, Descargar, Exportar PDF
- Mantiene el estilo institucional

### 4. Validación de formularios mejorada
- Validación en tiempo real
- Feedback visual con colores institucionales
- Mensajes de error integrados

### 5. Utilidades adicionales
```javascript
// Loading en botones
setButtonLoading('btn-guardar', true);
setButtonLoading('btn-guardar', false);

// Confirmaciones con modal
confirmAction('¿Eliminar documento?', () => {
    // Acción a ejecutar
});

// Progress bars
showProgress('container-id', 75, 'Procesando...');
hideProgress('container-id');
```

## 🎨 Clases CSS disponibles

### Usar Bootstrap selectivamente
```html
<!-- Para usar estilos de Bootstrap -->
<div class="card card-bs">
    <div class="card-body">Contenido</div>
</div>

<!-- Para usar nuestros estilos (por defecto) -->
<button class="btn btn-primary">Botón institucional</button>

<!-- Para usar Bootstrap específicamente -->
<button class="btn btn-primary btn-bs">Botón Bootstrap</button>
```

### Componentes disponibles
- **Alerts**: Con colores institucionales
- **Cards**: Con sombras y hover effects
- **Modales**: Mejorados con Bootstrap
- **Tablas**: Responsive con estilos institucionales
- **Badges**: Con colores GobMX
- **Dropdowns**: Con estilos personalizados

## 📁 Archivos modificados

### Nuevos archivos
- `css/bootstrap-overrides.css` - Sobrescribe Bootstrap con estilos institucionales
- `js/bootstrap-init.js` - Inicializa componentes y utilidades

### Archivos actualizados
- `index.html` - Agregado Bootstrap CSS/JS y toasts
- `editor.html` - Agregado Bootstrap, tooltips, dropdown y toasts

## 🔧 Configuración técnica

### CDN utilizado
```html
<!-- CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">

<!-- JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
```

### Orden de carga
1. Google Fonts
2. Font Awesome
3. **Bootstrap CSS**
4. Estilos institucionales (`styles.css`)
5. Estilos del editor (`editor.css`)
6. **Overrides de Bootstrap** (`bootstrap-overrides.css`)

## 🎯 Uso recomendado

### Para desarrolladores
1. **Mantener clases existentes** - No cambiar nada que ya funciona
2. **Usar Bootstrap para nuevas funcionalidades** - Modales, tooltips, alerts
3. **Aplicar clase `.btn-bs`** solo cuando quieras usar estilos puros de Bootstrap
4. **Usar sistema de toasts** para todas las notificaciones
5. **Aprovechar utilidades de spacing** de Bootstrap (`mt-3`, `mb-2`, etc.)

### Ejemplos prácticos
```html
<!-- Mantener botón existente -->
<button class="btn btn-primary" onclick="guardarDocumento()">
    <i class="fas fa-save"></i> Guardar
</button>

<!-- Agregar tooltip -->
<button class="btn btn-primary" data-bs-toggle="tooltip" title="Guardar en Google Sheets">
    <i class="fas fa-save"></i> Guardar
</button>

<!-- Usar alert de Bootstrap con estilos institucionales -->
<div class="alert alert-info">
    <i class="fas fa-info-circle me-2"></i>
    Información importante
</div>
```

## 🚨 Importante

- **NO cambiar clases existentes** sin el sufijo `-bs`
- **NO modificar archivos JS existentes** para mantener funcionalidad
- **Usar las nuevas utilidades** para mejorar UX sin romper nada
- **Probar en todos los navegadores** antes de desplegar

## 📞 Soporte

Para dudas sobre la integración de Bootstrap:
1. Revisar `bootstrap-overrides.css` para entender las sobrescrituras
2. Usar `bootstrap-init.js` para funcionalidades adicionales
3. Mantener siempre la compatibilidad con el diseño institucional