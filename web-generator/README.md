# 📄 Generador de Documentos SENER

Sistema web para generar documentos PDF institucionales usando Google Sheets como fuente de datos y el template LaTeX `sener2025.cls`.

## 🎯 Características

- ✅ **Lee contenido desde Google Sheets** (párrafos, tablas, metadata)
- ✅ **Actualización automática de estilos** desde GitHub
- ✅ **Generación de PDF** con LaTeX.Online
- ✅ **Sin servidor** - funciona 100% en el navegador
- ✅ **Desplegable en Cloudflare Pages**
- ✅ **Colaboración en tiempo real** vía Google Sheets

## 📊 Estructura del Google Sheet

Tu Google Sheet debe tener las siguientes pestañas:

### 1. **Metadata**
```
| Campo          | Valor                                    |
|----------------|------------------------------------------|
| Título         | PRODESEN 2025-2030                       |
| Subtítulo      | Nueva plantilla de comunicación          |
| Autor          | Dr. Jorge Marcial Islas Samperio         |
| Fecha          | Noviembre 2025                           |
| Institución    | Secretaría de Energía                    |
| Unidad         | Subsecretaría de Planeación...           |
```

### 2. **Secciones**
```
| Número | Título                    | Subtítulo              | Tipo      |
|--------|---------------------------|------------------------|-----------|
| 1      | Disposiciones de Texto    | Ortotipografía         | seccion   |
| 2      | Elementos de Plantilla    | Tipografía y Estilos   | seccion   |
```

### 3. **Contenido**
```
| Sección | Subsección | Tipo       | Contenido                           |
|---------|------------|------------|-------------------------------------|
| 1       | 1.1        | subseccion | Texto a una columna                 |
| 1       | 1.1        | parrafo    | El texto estándar se presenta...    |
| 1       | 1.2        | subseccion | Texto a dos columnas                |
| 1       | 1.2        | parrafo    | Para secciones que requieren...     |
```

### 4. **Tablas**
```
| ID    | Sección | Caption                              | Estilo   |
|-------|---------|--------------------------------------|----------|
| tab1  | 3       | Capacidad instalada por región...    | guinda   |
| tab2  | 3       | Proyectos de energías renovables...  | verde    |
```

### 5. **Tabla_tab1_Datos** (una hoja por cada tabla)
```
| Región          | Capacidad (MW) | Demanda (MW) | Factor (%) |
|-----------------|----------------|--------------|------------|
| Baja California | 3,500          | 2,300        | 68         |
| Noroeste        | 5,100          | 3,900        | 73         |
```

## 🚀 Configuración

### 1. Crear Google Sheet

1. Crea una nueva hoja de cálculo en Google Sheets
2. Crea las pestañas mencionadas arriba
3. Llena con tu contenido
4. **Importante:** Haz el sheet público o comparte con "Cualquiera con el enlace puede ver"

### 2. Obtener API Key de Google

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto
3. Habilita "Google Sheets API"
4. Ve a "Credenciales" → "Crear credenciales" → "Clave de API"
5. Copia la API Key

### 3. Configurar la aplicación

1. Abre `index.html` en tu navegador
2. Pega el ID de tu Google Sheet (está en la URL)
3. Pega tu API Key
4. Haz clic en "Guardar"

### 4. Usar

1. Haz clic en "Cargar desde Google Sheets"
2. Haz clic en "Previsualizar" para ver el código LaTeX
3. Haz clic en "Generar PDF" para obtener tu documento

## 🎨 Actualización de Estilos

El sistema **siempre usa la última versión** de `sener2025.cls` desde GitHub:

```
https://raw.githubusercontent.com/JSCEG/-Platilla-Institucional/main/sener2025.cls
```

**Cuando actualizas el template en GitHub:**
1. Haces commit de `sener2025.cls` con tus cambios
2. Haces push a GitHub
3. La próxima vez que generes un PDF, usará la nueva versión automáticamente

**No necesitas hacer nada en la aplicación web** - los estilos se actualizan solos.

## 📦 Desplegar en Cloudflare Pages

1. Sube la carpeta `web-generator` a un repositorio de GitHub
2. Ve a [Cloudflare Pages](https://pages.cloudflare.com)
3. Conecta tu repositorio
4. Configura:
   - **Build command:** (vacío)
   - **Build output directory:** `/`
5. Despliega

## 🔧 Personalización

### Agregar nuevos tipos de contenido

Edita `app.js` en la función `generarLatexDesdeSheets()`:

```javascript
if (item.Tipo === 'callout') {
    latex += `\\begin{calloutTip}\n${item.Contenido}\n\\end{calloutTip}\n\n`;
}
```

### Agregar nuevos estilos de tabla

Solo actualiza `sener2025.cls` en GitHub y haz push. Los cambios se aplicarán automáticamente.

## 📝 Ejemplo de Uso

1. **Equipo de SENER** edita contenido en Google Sheets
2. **Diseñador** actualiza estilos en `sener2025.cls` y hace push a GitHub
3. **Usuario final** abre la app web y genera PDF con contenido actualizado y estilos nuevos

## 🐛 Solución de Problemas

### "Error al cargar documentos"
- Verifica que el Sheet sea público
- Verifica que el ID del Sheet sea correcto
- Verifica que la API Key sea válida

### "Error en la compilación LaTeX"
- Revisa el código LaTeX en la previsualización
- Asegúrate de que las tablas tengan datos
- Verifica que no haya caracteres especiales sin escapar

### "Template desactualizado"
- Haz clic en "Actualizar Template"
- Verifica que `sener2025.cls` esté en GitHub

## 📚 Recursos

- [Google Sheets API](https://developers.google.com/sheets/api)
- [LaTeX.Online](https://latexonline.cc/)
- [Cloudflare Pages](https://pages.cloudflare.com/)

## 🤝 Contribuir

Para agregar funcionalidades:
1. Edita `app.js` para lógica
2. Edita `index.html` para UI
3. Edita `styles.css` para estilos
4. Haz commit y push

---

**Desarrollado para la Secretaría de Energía** 🇲🇽
