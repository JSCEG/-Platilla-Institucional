# Configuración de Google Sheets

## 📋 Cómo Conectar tu Google Sheets

El editor web lee los datos directamente desde un Google Sheets publicado. Sigue estos pasos:

### 1. Publicar tu Google Sheets

1. Abre tu Google Sheets
2. Ve a **Archivo → Compartir → Publicar en la web**
3. Selecciona **Documento completo**
4. Formato: **Página web**
5. Copia la URL que te da (algo como: `https://docs.google.com/spreadsheets/d/e/2PACX-...`)

### 2. Obtener los GIDs de cada Hoja

Cada pestaña de tu Google Sheets tiene un ID único llamado **GID**. Para obtenerlo:

1. Abre tu Google Sheets
2. Haz clic en la pestaña que quieres (ej: "Documentos")
3. Mira la URL en el navegador, verás algo como:
   ```
   https://docs.google.com/spreadsheets/d/ABC123.../edit#gid=0
   ```
4. El número después de `gid=` es el GID de esa hoja (en este caso: `0`)

### 3. Configurar en el Código

Edita el archivo `web/js/config.js`:

```javascript
const CONFIG = {
    // Tu URL publicada
    GOOGLE_SHEETS_BASE_URL: 'https://docs.google.com/spreadsheets/d/e/TU-URL-AQUI/pub',
    
    // GIDs de cada hoja
    HOJAS: {
        'Documentos': '0',      // GID de la pestaña "Documentos"
        'Secciones': '123456',  // GID de la pestaña "Secciones"
        'Tablas': '789012',     // GID de la pestaña "Tablas"
        'Figuras': '345678',    // GID de la pestaña "Figuras"
        'Bibliografia': '901234', // GID de la pestaña "Bibliografia"
        'Siglas': '567890',     // GID de la pestaña "Siglas"
        'Glosario': '234567'    // GID de la pestaña "Glosario"
    }
};
```

## 📊 Estructura Requerida del Google Sheets

Tu Google Sheets debe tener estas pestañas con estas columnas:

### Hoja: Documentos
- ID
- Titulo
- Subtitulo
- Autor
- Fecha
- Institucion
- Unidad
- DocumentoCorto
- PalabrasClave
- Version
- ResumenEjecutivo
- DatosClave
- PortadaRuta
- ContraportadaRuta

### Hoja: Secciones
- DocumentoID
- Orden
- Nivel (Seccion, Subseccion, Subsubseccion)
- Titulo
- Contenido

### Hoja: Tablas
- DocumentoID
- SeccionOrden
- OrdenTabla
- Titulo
- Fuente
- DatosCSV

### Hoja: Figuras
- DocumentoID
- SeccionOrden
- OrdenFigura
- RutaArchivo
- Caption
- Fuente

### Hoja: Bibliografia
- DocumentoID
- Clave
- Tipo
- Autor
- Titulo
- Anio
- Editorial
- Url

### Hoja: Siglas
- DocumentoID
- Sigla
- Significado

### Hoja: Glosario
- DocumentoID
- Termino
- Definicion

## 🔧 Solución de Problemas

### No se cargan los datos

1. **Verifica que el Google Sheets esté publicado**
   - Debe estar en modo "Publicar en la web"
   - No basta con compartir el enlace

2. **Verifica la URL en config.js**
   - Debe terminar en `/pub` (no `/edit`)
   - Ejemplo correcto: `https://docs.google.com/spreadsheets/d/e/2PACX-.../pub`

3. **Verifica los GIDs**
   - Cada pestaña tiene su propio GID
   - El GID de la primera pestaña suele ser `0`

4. **Abre la consola del navegador**
   - Presiona F12
   - Ve a la pestaña "Console"
   - Busca mensajes de error

### Los datos se ven mal

1. **Verifica que las columnas tengan los nombres exactos**
   - Deben coincidir con los nombres listados arriba
   - Son sensibles a mayúsculas/minúsculas

2. **Verifica que no haya comas en los datos**
   - Las comas pueden romper el formato CSV
   - Usa punto y coma (;) en lugar de comas

## 🚀 URL Actual Configurada

```
https://docs.google.com/spreadsheets/d/e/2PACX-1vQaJ_BNSR2R7nVPc4eKv_YM24IJnO4FyGqJEYq-oyOciFn_2mrHqP5y5ZS61lkQe8jtMEe0IEZmZUMw/pub
```

Esta es la URL que está actualmente configurada en el sistema.
