# 📊 Guía de la Nueva Tabla de Figuras

## 🎯 Características Principales

### ✅ **Mobile-First Design**
- **Desktop/Tablet**: Tabla completa con todas las columnas
- **Móvil**: Vista de cards optimizada para pantallas pequeñas
- **Responsive automático**: Cambia según el tamaño de pantalla

### ✅ **Edición Inline**
- **Clic directo**: Haz clic en cualquier celda para editarla
- **Guardado rápido**: Enter para guardar, Escape para cancelar
- **Feedback visual**: Animaciones de éxito/error
- **Validación**: No permite campos vacíos

### ✅ **Iconos Profesionales**
- **Font Awesome**: Iconos principales del sistema
- **Feather Icons**: Iconos adicionales más modernos
- **Colores semánticos**: Cada tipo de dato tiene su color
- **Hover effects**: Interacciones visuales mejoradas

## 🚀 **Funcionalidades**

### **1. Edición Inline**
```javascript
// Automático al hacer clic en celdas
// No requiere código adicional
```

### **2. Acciones por Fila**
- **👁️ Vista Previa**: Modal con imagen y detalles
- **✏️ Editar**: Modal completo de edición (próximamente)
- **🗑️ Eliminar**: Confirmación con modal

### **3. Estados Visuales**
- **💾 Guardando**: Spinner durante guardado
- **✅ Éxito**: Animación verde al guardar
- **❌ Error**: Animación roja en errores
- **📱 Responsive**: Automático según pantalla

## 🎨 **Iconografía**

### **Iconos por Tipo de Dato**
- **🖼️ Figura**: `fas fa-image` (azul)
- **📝 Título**: `fas fa-file-alt` (gris)
- **📁 Ruta**: `fas fa-folder` (info/azul claro)
- **📖 Fuente**: `fas fa-quote-left` (verde)
- **⚙️ Acciones**: `fas fa-tools` (gris)

### **Iconos de Acciones**
- **👁️ Vista Previa**: `fas fa-eye`
- **✏️ Editar**: `fas fa-edit` (verde al hover)
- **🗑️ Eliminar**: `fas fa-trash-alt` (rojo al hover)
- **💾 Guardar**: `fas fa-check` (verde)
- **❌ Cancelar**: `fas fa-times` (gris)

## 📱 **Responsive Breakpoints**

### **Desktop (>768px)**
```css
/* Tabla completa con todas las columnas */
.figuras-table {
    display: table;
}
.figuras-table-mobile-cards {
    display: none;
}
```

### **Tablet (768px - 576px)**
```css
/* Tabla con columna "Fuente" oculta */
.col-fuente {
    display: none;
}
```

### **Móvil (<576px)**
```css
/* Vista de cards */
.figuras-table {
    display: none;
}
.figuras-table-mobile-cards {
    display: block;
}
```

## 🔧 **API y Datos**

### **Estructura de Datos**
```javascript
const figura = {
    id: 1,                    // ID único
    seccion: 2,              // Número de sección
    orden: 1,                // Orden dentro de la sección
    titulo: "Título...",     // Descripción de la figura
    ruta: "img/graficos/...", // Ruta del archivo
    fuente: "SENER, 2024"   // Fuente de la información
};
```

### **Funciones Principales**
```javascript
// Cargar datos
loadFiguras()

// Agregar nueva figura
addNewFigura()

// Edición inline
startInlineEdit(cell)
saveEdit()
cancelEdit()

// Acciones
previewFigura(id)
editFigura(id)
deleteFigura(id)
```

## 🎯 **Mejores Prácticas**

### **Para Usuarios**
1. **Clic directo** en celdas para editar
2. **Enter** para guardar cambios rápidos
3. **Escape** para cancelar edición
4. **Vista previa** antes de editar completamente
5. **Confirmar** antes de eliminar

### **Para Desarrolladores**
1. **Mantener datos sincronizados** con backend
2. **Validar entrada** antes de guardar
3. **Manejar errores** con feedback visual
4. **Optimizar imágenes** para vista previa
5. **Usar tooltips** para guiar usuarios

## 🔄 **Estados de la Tabla**

### **1. Cargando**
```html
<div class="spinner-border text-primary">
    <span class="visually-hidden">Cargando figuras...</span>
</div>
```

### **2. Vacía**
```html
<div class="text-center py-5">
    <i class="fas fa-image text-muted"></i>
    <p>No hay figuras agregadas</p>
</div>
```

### **3. Con Datos**
- Tabla responsiva completa
- Edición inline activa
- Acciones disponibles

### **4. Editando**
```html
<input type="text" class="editable-input" value="...">
<div class="edit-actions">
    <button class="btn-save"><i class="fas fa-check"></i></button>
    <button class="btn-cancel"><i class="fas fa-times"></i></button>
</div>
```

## 🚨 **Consideraciones Técnicas**

### **Performance**
- **Debounce** en resize events (250ms)
- **Event delegation** para elementos dinámicos
- **Lazy loading** de imágenes en vista previa

### **Accesibilidad**
- **Tooltips** descriptivos en todos los botones
- **Keyboard navigation** (Enter/Escape)
- **Screen reader** friendly con aria-labels
- **Color contrast** cumple WCAG 2.1

### **Compatibilidad**
- **Bootstrap 5.3.2** requerido
- **Font Awesome 6.4.0** para iconos
- **Feather Icons** opcional para iconos adicionales
- **ES6+** JavaScript moderno

## 📈 **Próximas Mejoras**

1. **🔍 Búsqueda y filtros** en tiempo real
2. **📊 Ordenamiento** por columnas
3. **📤 Exportación** a Excel/CSV
4. **🖼️ Upload directo** de imágenes
5. **📋 Copiar/pegar** entre filas
6. **⚡ Guardado automático** cada X segundos
7. **📱 Gestos táctiles** para móvil
8. **🎨 Temas personalizables**

## 🆘 **Solución de Problemas**

### **Problema**: Iconos no aparecen
**Solución**: Verificar que Font Awesome y Feather Icons estén cargados
```javascript
// Verificar en consola
console.log(typeof feather); // debe ser 'object'
```

### **Problema**: Edición no funciona
**Solución**: Verificar que Bootstrap esté inicializado
```javascript
// Verificar en consola
console.log(typeof bootstrap); // debe ser 'object'
```

### **Problema**: Vista móvil no cambia
**Solución**: Verificar event listener de resize
```javascript
window.addEventListener('resize', debounce(checkMobileView, 250));
```