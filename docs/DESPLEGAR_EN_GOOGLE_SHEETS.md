# Cómo Desplegar en Google Apps Script

## 📋 Requisitos Previos

- Google Sheets con la estructura de hojas correcta
- Acceso al editor de Google Apps Script
- Archivos del proyecto listos

---

## 🚀 Paso 1: Preparar Google Sheets

### Estructura de Hojas Requerida

Tu Google Sheets debe tener estas hojas:

1. **Documentos** - Con columnas:
   - ID, Titulo, Subtitulo, Autor, Fecha, Institucion, Unidad
   - DocumentoCorto, PalabrasClave, Version
   - ResumenEjecutivo, DatosClave
   - **PortadaRuta**, **ContraportadaRuta** (nuevas)

2. **Secciones** - Con columnas:
   - DocumentoID, Orden, Nivel, Titulo, Contenido

3. **Tablas** - Con columnas:
   - DocumentoID, SeccionOrden, OrdenTabla, Titulo, Fuente, DatosCSV

4. **Figuras** - Con columnas:
   - DocumentoID, SeccionOrden, OrdenFigura, RutaArchivo, Caption, Fuente

5. **Datos_Tablas** - Datos de las tablas

6. **Bibliografia**, **Siglas**, **Glosario** (opcionales)

---

## 🚀 Paso 2: Actualizar Google Apps Script

### 2.1 Abrir el Editor

1. En tu Google Sheets, ve a **Extensiones > Apps Script**
2. Verás el editor de código

### 2.2 Reemplazar Code.gs

1. Selecciona todo el contenido de `Code.gs`
2. Bórralo
3. Copia todo el contenido de `google_apps_script_FINAL.js`
4. Pégalo en `Code.gs`
5. Guarda (Ctrl+S)

---

## 🚀 Paso 3: Crear Archivos HTML

### 3.1 Crear index.html

1. En el editor de Apps Script, haz clic en el **+** junto a "Archivos"
2. Selecciona **HTML**
3. Nómbralo `index`
4. Copia el contenido de `web/index.html`
5. **IMPORTANTE**: Modifica las rutas:

```html
<!-- Cambiar esto: -->
<link rel="stylesheet" href="css/styles.css">
<script src="js/api.js"></script>
<script src="js/app.js"></script>

<!-- Por esto: -->
<?!= include('styles'); ?>
<?!= include('api'); ?>
<?!= include('app'); ?>
```

### 3.2 Crear editor.html

1. Crear nuevo archivo HTML llamado `editor`
2. Copiar contenido de `web/editor.html`
3. Modificar rutas igual que en index.html:

```html
<?!= include('styles'); ?>
<?!= include('editor-css'); ?>
<?!= include('api'); ?>
<?!= include('editor-js'); ?>
```

### 3.3 Crear archivos de estilos

**Archivo: styles.html**
```html
<style>
/* Copiar TODO el contenido de web/css/styles.css aquí */
</style>
```

**Archivo: editor-css.html**
```html
<style>
/* Copiar TODO el contenido de web/css/editor.css aquí */
</style>
```

### 3.4 Crear archivos de JavaScript

**Archivo: api.html**
```html
<script>
/* Copiar TODO el contenido de web/js/api.js aquí */
</script>
```

**Archivo: app.html**
```html
<script>
/* Copiar TODO el contenido de web/js/app.js aquí */
</script>
```

**Archivo: editor-js.html**
```html
<script>
/* Copiar TODO el contenido de web/js/editor.js aquí */
</script>
```

### 3.5 Agregar función include

En `Code.gs`, agregar al inicio (después de las constantes):

```javascript
/**
 * Incluir archivos HTML
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
```

---

## 🚀 Paso 4: Desplegar como Aplicación Web

### 4.1 Configurar Despliegue

1. En el editor de Apps Script, haz clic en **Implementar > Nueva implementación**
2. Selecciona el tipo: **Aplicación web**
3. Configuración:
   - **Descripción**: "SENER LaTeX Editor v1.0"
   - **Ejecutar como**: Tu cuenta
   - **Quién tiene acceso**: 
     - "Solo yo" (para pruebas)
     - "Cualquier usuario de [tu organización]" (para producción)
4. Haz clic en **Implementar**
5. **Copia la URL** que te da (algo como: `https://script.google.com/macros/s/...`)

### 4.2 Autorizar Permisos

1. La primera vez te pedirá autorizar permisos
2. Haz clic en **Revisar permisos**
3. Selecciona tu cuenta
4. Haz clic en **Avanzado**
5. Haz clic en **Ir a [nombre del proyecto] (no seguro)**
6. Haz clic en **Permitir**

---

## 🚀 Paso 5: Probar la Aplicación

### 5.1 Abrir el Dashboard

1. Abre la URL de tu aplicación web
2. Deberías ver el dashboard con tus documentos
3. Si no ves documentos, verifica que la hoja "Documentos" tenga datos

### 5.2 Probar el Editor

1. Haz clic en "Editar" en cualquier documento
2. Deberías ver el editor con los datos cargados
3. Prueba editar los metadatos
4. Haz clic en "Guardar"
5. Verifica en Google Sheets que se guardaron los cambios

### 5.3 Probar Generación de .tex

1. En el editor, haz clic en "Generar .tex"
2. Debería descargarse un archivo .tex
3. Abre el archivo y verifica que tenga el contenido correcto

---

## 🐛 Solución de Problemas

### Error: "No se encuentra la hoja Documentos"

**Solución:**
- Verifica que la hoja se llame exactamente "Documentos" (con mayúscula)
- Verifica que tenga datos (al menos una fila de encabezados)

### Error: "Script function not found"

**Solución:**
- Verifica que todas las funciones estén en `Code.gs`
- Guarda el proyecto (Ctrl+S)
- Recarga la página de la aplicación web

### Los estilos no se cargan

**Solución:**
- Verifica que los archivos HTML de estilos existan
- Verifica que la función `include()` esté en `Code.gs`
- Verifica que las llamadas `<?!= include('styles'); ?>` estén correctas

### Los datos no se cargan

**Solución:**
- Abre la consola del navegador (F12)
- Busca errores en rojo
- Verifica que las funciones de API existan en `Code.gs`
- Verifica que los nombres de las hojas sean correctos

### Error: "Exception: Service invoked too many times"

**Solución:**
- Google Apps Script tiene límites de ejecución
- Reduce la cantidad de datos en las hojas
- Optimiza las consultas

---

## 📊 Estructura Final en Apps Script

```
Tu Proyecto
├── Code.gs                 # Script principal con API
├── index.html              # Dashboard
├── editor.html             # Editor
├── styles.html             # Estilos base
├── editor-css.html         # Estilos del editor
├── api.html                # API JavaScript
├── app.html                # Lógica del dashboard
└── editor-js.html          # Lógica del editor
```

---

## 🎯 Verificación Final

### Checklist de Despliegue

- [ ] Google Sheets tiene todas las hojas requeridas
- [ ] `Code.gs` tiene todo el código de `google_apps_script_FINAL.js`
- [ ] Función `include()` agregada
- [ ] Archivos HTML creados (index, editor)
- [ ] Archivos de estilos creados (styles, editor-css)
- [ ] Archivos JS creados (api, app, editor-js)
- [ ] Rutas modificadas para usar `<?!= include() ?>`
- [ ] Aplicación web desplegada
- [ ] Permisos autorizados
- [ ] Dashboard carga correctamente
- [ ] Editor carga datos de Google Sheets
- [ ] Guardar funciona
- [ ] Generar .tex funciona

---

## 🔄 Actualizar la Aplicación

Cuando hagas cambios:

1. Edita los archivos en Apps Script
2. Guarda (Ctrl+S)
3. **NO necesitas redesplegar** - Los cambios se aplican automáticamente
4. Recarga la página de la aplicación web

Si cambias la configuración de permisos:

1. Ve a **Implementar > Administrar implementaciones**
2. Haz clic en el ícono de lápiz (editar)
3. Cambia la configuración
4. Haz clic en **Implementar**

---

## 📱 Compartir con tu Equipo

1. Copia la URL de la aplicación web
2. Compártela con tu equipo
3. Asegúrate de que tengan acceso al Google Sheets
4. Configura "Quién tiene acceso" en el despliegue

---

## 🎉 ¡Listo!

Ahora tienes:
- ✅ Dashboard web conectado a Google Sheets
- ✅ Editor que lee y guarda datos reales
- ✅ Generación de .tex funcional
- ✅ Interfaz accesible desde cualquier navegador
- ✅ Sin necesidad de instalación

**¡Tu equipo puede empezar a usar el editor!** 🚀
