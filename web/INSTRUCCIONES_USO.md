# 📖 Instrucciones de Uso - Editor Web SENER

## 🚀 Inicio Rápido

### 1. Probar la Conexión

Antes de usar el editor, verifica que la conexión con Google Sheets funcione:

1. Abre `web/test-conexion.html` en tu navegador
2. Haz clic en "🚀 Probar Conexión"
3. Deberías ver todos tus datos cargados

Si hay errores, consulta `CONFIGURACION_GOOGLE_SHEETS.md`

### 2. Usar el Dashboard

1. Abre `web/index.html` en tu navegador
2. Verás la lista de todos tus documentos
3. Haz clic en "Editar" para abrir el editor

### 3. Editar un Documento

1. El editor carga automáticamente los datos del Google Sheets
2. Puedes editar:
   - **Metadatos**: Título, autor, fecha, etc.
   - **Secciones**: Contenido de cada sección
   - **Tablas**: Configuración de tablas
   - **Figuras**: Imágenes y gráficas

## 📝 Estructura del Proyecto

```
web/
├── index.html                      # Dashboard principal
├── editor.html                     # Editor de documentos
├── test-conexion.html             # Prueba de conexión
├── css/
│   ├── styles.css                 # Estilos del dashboard
│   └── editor.css                 # Estilos del editor
├── js/
│   ├── config.js                  # ⚙️ CONFIGURACIÓN (edita aquí la URL)
│   ├── api.js                     # API (placeholder)
│   ├── app.js                     # Lógica del dashboard
│   └── editor.js                  # Lógica del editor
└── CONFIGURACION_GOOGLE_SHEETS.md # Guía de configuración
```

## 🔧 Configuración

### Cambiar la URL del Google Sheets

Edita `web/js/config.js`:

```javascript
const CONFIG = {
    GOOGLE_SHEETS_BASE_URL: 'TU-URL-AQUI',
    HOJAS: {
        'Documentos': '0',  // Cambia estos GIDs
        'Secciones': '1',
        // ...
    }
};
```

## 📊 Cómo Funciona

### Flujo de Datos

1. **Google Sheets** → Publicado en la web como CSV
2. **config.js** → Lee cada hoja por su GID
3. **app.js / editor.js** → Procesa y muestra los datos
4. **Usuario** → Edita en interfaz visual (sin LaTeX)

### Ventajas

✅ **Sin comandos LaTeX**: Todo visual y fácil
✅ **Datos en tiempo real**: Lee directamente del Google Sheets
✅ **Sin servidor**: Todo funciona en el navegador
✅ **Fácil de compartir**: Solo necesitas un navegador

## 🎯 Funcionalidades Actuales

### ✅ Implementado

- Cargar lista de documentos desde Google Sheets
- Ver metadatos de un documento
- Ver secciones organizadas por nivel
- Ver tablas y figuras
- Interfaz visual completa

### 🚧 En Desarrollo

- Editar contenido (actualmente solo lectura)
- Guardar cambios de vuelta al Google Sheets
- Agregar nuevas secciones/tablas/figuras
- Generar archivo .tex desde el editor web
- Editor WYSIWYG para contenido

## 💡 Próximos Pasos

### Para Edición Completa

Para permitir que los usuarios editen y guarden cambios, necesitarás:

1. **Opción A: Google Apps Script**
   - Desplegar el código en Google Apps Script
   - Crear funciones para guardar datos
   - Más complejo pero más potente

2. **Opción B: Solo Lectura + Edición Manual**
   - Mantener el editor como visualizador
   - Usuarios editan en Google Sheets
   - Más simple, funciona ahora mismo

### Para Generar .tex

El script Python local (`preparar_para_google_apps_script.py`) ya genera archivos .tex:

```bash
python preparar_para_google_apps_script.py
```

Esto lee el Google Sheets y genera los archivos .tex localmente.

## 🐛 Solución de Problemas

### No se cargan los datos

1. Abre `test-conexion.html` para diagnosticar
2. Verifica la consola del navegador (F12)
3. Revisa `CONFIGURACION_GOOGLE_SHEETS.md`

### Los datos se ven mal

1. Verifica que las columnas del Google Sheets tengan los nombres exactos
2. Verifica que no haya comas en los datos (usa punto y coma)
3. Verifica que el Google Sheets esté publicado

### CORS Error

Si ves errores de CORS:
- Asegúrate de que el Google Sheets esté publicado (no solo compartido)
- La URL debe terminar en `/pub` no `/edit`

## 📞 Soporte

Para más ayuda:
1. Revisa la consola del navegador (F12)
2. Consulta `CONFIGURACION_GOOGLE_SHEETS.md`
3. Prueba con `test-conexion.html`

## 🎨 Personalización

### Cambiar Colores

Edita `web/css/styles.css` y busca las variables CSS:

```css
:root {
    --color-gobmx-guinda: #621132;
    --color-gobmx-oro: #a08958;
    /* ... */
}
```

### Cambiar Logo

Reemplaza `img/logo_sener_transparente.png` con tu logo.

## 📄 Licencia

Este proyecto es para uso interno de SENER.
