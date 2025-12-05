# 📄 Sistema Generador de Documentos LaTeX desde Google Sheets

## 🎯 Descripción del Proyecto

Sistema automatizado que permite al equipo de comunicación social de SENER generar documentos PDF profesionales sin conocer LaTeX, utilizando Google Sheets como interfaz amigable.

---

## 📦 Archivos del Proyecto

### Scripts
- **`google_apps_script_FINAL.js`** - Script principal (usar este)
- `google_apps_script_fixed.js` - Versión intermedia (no usar)
- `google_apps_script.js` - Versión original (no usar)

### Documentación
- **`INSTRUCCIONES_COMPLETAS.md`** - Guía completa de uso
- **`PRUEBA_RAPIDA.md`** - Prueba rápida del sistema
- `INSTRUCCIONES_GOOGLE_SHEETS.md` - Guía básica (versión anterior)
- `EJEMPLO_ESTRUCTURA.md` - Ejemplos de datos

### Template LaTeX
- **`sener2025.cls`** - Clase LaTeX institucional
- `referencias.bib` - Ejemplo de bibliografía
- `Template-comunicacionsocial.tex` - Template de ejemplo
- `template-institucional.tex` - Template institucional

### Carpetas
- **`img/`** - Imágenes institucionales (logos, fondos, etc.)
- **`tipografias/`** - Fuentes Patria y Noto Sans
- `css/` - Estilos (no usado en LaTeX)
- `back/` - Archivos de respaldo

### Otros
- `Dumentos LaText (1).xlsx` - Ejemplo de estructura de datos
- `GUIA_USO.md` - Guía de uso del template
- `README.md` - Este archivo

---

## 🚀 Inicio Rápido

### 1. Configurar Google Sheets

Crea un Google Sheets con estas hojas:
- **Documentos** - Metadatos del documento
- **Secciones** - Contenido organizado por secciones
- **Figuras** - Imágenes y gráficos (opcional)
- **Tablas** - Tablas de datos (opcional)
- **Datos Tablas** - Datos de las tablas (opcional)
- **Siglas** - Siglas y acrónimos (opcional)
- **Glosario** - Términos y definiciones (opcional)
- **Bibliografia** - Referencias bibliográficas (opcional)

### 2. Instalar el Script

1. Abre tu Google Sheets
2. Ve a **Extensiones > Apps Script**
3. Copia el contenido de `google_apps_script_FINAL.js`
4. **Cambia el ID de la carpeta** en la línea 13:
   ```javascript
   const CARPETA_SALIDA_ID = 'TU_ID_AQUI';
   ```
5. Guarda y recarga el Sheet

### 3. Generar Documento

1. Llena los datos en las hojas
2. Selecciona la fila del documento en "Documentos"
3. Menú: **📄 SENER LaTeX > ✨ Generar .tex**
4. Descarga los archivos de Drive
5. Compila con XeLaTeX

---

## 📊 Estructura de Datos

### Hoja "Documentos"
```
ID | Titulo | Subtitulo | Autor | Fecha | Institucion | Unidad | DocumentoCorto | ...
D01 | Informe 2025 | Subtítulo | DGPE | 30/06/2025 | SENER | UPE | Informe25 | ...
```

### Hoja "Secciones"
```
DocumentoID | Orden | Nivel | Titulo | Contenido
D01 | 1 | Seccion | Introducción | Texto con [[nota:...]] y [[cita:...]]
D01 | 2 | Seccion | Desarrollo | Más contenido...
D01 | 2.1 | Subseccion | Detalles | Subsección...
```

### Hoja "Figuras"
```
DocumentoID | SeccionOrden | OrdenFigura | RutaArchivo | Caption | Fuente
D01 | 2 | 1 | https://drive.google.com/... | Descripción | Fuente
```

### Hoja "Tablas"
```
DocumentoID | SeccionOrden | OrdenTabla | Titulo | Fuente | DatosCSV
D01 | 2 | 1 | Título tabla | Fuente | Datos_Tablas!A1:E4
```

---

## 🏷️ Etiquetas Especiales

### En el contenido de secciones:

**Formato:**
- `[[nota:texto]]` - Nota al pie
- `[[cita:clave]]` - Cita bibliográfica
- `[[dorado:texto]]` - Texto en color dorado
- `[[guinda:texto]]` - Texto en color guinda

**Matemáticas:**
- `[[math:formula]]` - Fórmula inline
- `[[ecuacion:formula]]` - Ecuación en bloque

**Bloques:**
- `[[ejemplo]]...[[/ejemplo]]` - Bloque de ejemplo
- `[[caja]]...[[/caja]]` - Recuadro
- `[[alerta]]...[[/alerta]]` - Advertencia
- `[[info]]...[[/info]]` - Información
- `[[destacado]]...[[/destacado]]` - Texto destacado

**Listas:**
```
- Elemento 1
- Elemento 2
  - Sub-elemento
```

---

## 🎨 Características del Sistema

### ✅ Funcionalidades Implementadas

**Básicas:**
- ✅ Generación automática de .tex desde Sheets
- ✅ Metadatos del documento
- ✅ Portada institucional
- ✅ Tabla de contenidos
- ✅ Resumen ejecutivo
- ✅ Datos clave destacados

**Contenido:**
- ✅ Secciones jerárquicas (hasta 4 niveles)
- ✅ Listas con viñetas
- ✅ Notas al pie
- ✅ Citas bibliográficas
- ✅ Bloques especiales (ejemplos, cajas, alertas)
- ✅ Texto con formato (colores institucionales)
- ✅ Fórmulas matemáticas

**Elementos Visuales:**
- ✅ Figuras desde Google Drive
- ✅ Tablas con estilo institucional
- ✅ Fuentes de datos automáticas

**Complementos:**
- ✅ Glosario ordenado alfabéticamente
- ✅ Siglas y acrónimos
- ✅ Bibliografía en formato BibTeX
- ✅ Contraportada institucional

**Sistema:**
- ✅ Log de errores detallado
- ✅ Validación de datos
- ✅ Soporte para múltiples documentos
- ✅ Guardado automático en Drive

---

## 📁 Archivos Generados

Al ejecutar el script se generan:

1. **`[DocumentoCorto].tex`** - Documento LaTeX completo
2. **`referencias.bib`** - Bibliografía (si hay referencias)

Estos archivos, junto con:
- `sener2025.cls`
- Carpeta `img/`
- Carpeta `tipografias/`

Se compilan para producir el PDF final.

---

## 🔧 Compilación

### Opción A: Overleaf (Recomendado)
1. Crear proyecto nuevo en overleaf.com
2. Subir todos los archivos
3. Cambiar compilador a **XeLaTeX**
4. Compilar

### Opción B: Local
```bash
xelatex documento.tex
biber documento
xelatex documento.tex
xelatex documento.tex
```

**Requisitos:**
- TeX Live o MiKTeX
- XeLaTeX
- Biber (para bibliografía)

---

## 🐛 Solución de Problemas Comunes

### Script no aparece en el menú
- Recarga el Google Sheets (F5)
- Verifica que guardaste el script
- Revisa la consola de Apps Script

### "No se encuentra la hoja X"
- Verifica nombres exactos de las hojas
- Respeta mayúsculas/minúsculas

### "No se encontraron secciones"
- Verifica que `DocumentoID` coincida con `ID`
- Revisa que la columna se llame "DocumentoID" (no "ID")

### Figuras no aparecen
- Verifica permisos de la URL de Drive
- Asegúrate de que sea una URL válida
- Revisa que `SeccionOrden` coincida con una sección

### Error al compilar PDF
- Usa **XeLaTeX** (no pdfLaTeX)
- Verifica que tengas todas las carpetas (img, tipografias)
- Revisa que `sener2025.cls` esté presente

---

## 📚 Documentación Adicional

- **INSTRUCCIONES_COMPLETAS.md** - Guía detallada de todas las funcionalidades
- **PRUEBA_RAPIDA.md** - Datos de prueba para verificar el sistema
- **GUIA_USO.md** - Guía de uso del template LaTeX
- **GUIA_USO_TEMPLATE.md** - Guía técnica del template

---

## 👥 Equipo y Soporte

**Desarrollado para:**
- Secretaría de Energía (SENER)
- Equipo de Comunicación Social

**Tecnologías:**
- Google Apps Script
- LaTeX (XeLaTeX)
- Clase personalizada sener2025

**Soporte:**
- Revisa el log de errores en el menú
- Consulta la documentación completa
- Contacta al equipo técnico con el mensaje de error

---

## 📝 Notas Importantes

1. **Siempre usa XeLaTeX** para compilar (no pdfLaTeX)
2. **Respeta los nombres de columnas** exactamente como se indican
3. **El DocumentoID debe coincidir** entre todas las hojas
4. **Las URLs de Drive** deben tener permisos de visualización
5. **El DocumentoCorto** no debe tener espacios ni caracteres especiales

---

## 🎉 Resultado Final

El sistema genera documentos PDF profesionales con:

- Diseño institucional SENER
- Tipografías oficiales (Patria y Noto Sans)
- Colores institucionales
- Formato consistente
- Elementos visuales integrados
- Referencias bibliográficas
- Glosario y siglas
- Calidad de publicación

**Todo sin escribir una línea de LaTeX** ✨

---

## 📄 Licencia y Uso

Este sistema es de uso interno para la Secretaría de Energía.
Desarrollado en diciembre de 2024.

---

## 🔄 Versión

**Versión:** 1.0 Final  
**Fecha:** Diciembre 2024  
**Estado:** ✅ Operativo y probado
