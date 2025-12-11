# 📦 Guía de Instalación - Sistema SENER LaTeX

Sistema para generar documentos LaTeX institucionales desde Google Sheets.

---

## 📋 Requisitos del Sistema

### 1. **Distribución LaTeX**
El sistema **requiere XeLaTeX** (no funciona con pdfLaTeX estándar).

#### Windows
Instalar **TeX Live** o **MiKTeX**:

- **TeX Live** (Recomendado): https://tug.org/texlive/
  ```powershell
  # Descargar e instalar desde: https://tug.org/texlive/acquire-netinstall.html
  # Incluye XeLaTeX por defecto
  ```

- **MiKTeX**: https://miktex.org/download
  ```powershell
  # Descargar e instalar desde: https://miktex.org/download
  # Asegurarse de que incluya XeLaTeX
  ```

#### Verificar instalación:
```powershell
xelatex --version
```

Debe mostrar algo como: `XeTeX 3.141592653-2.6-0.999995...`

---

### 2. **Tipografías Institucionales**
El sistema usa tipografías personalizadas de la identidad SENER.

#### Ubicación
Las tipografías deben estar en: `tipografias/`

#### Archivos necesarios:
```
tipografias/
├── Patria_Regular.otf
├── Patria_Bold.otf
├── Patria_Light.otf
├── NotoSans-Regular.ttf
├── NotoSans-Bold.ttf
├── NotoSans-Italic.ttf
├── NotoSans-BoldItalic.ttf
├── NotoSans-Light.ttf
├── NotoSans-LightItalic.ttf
├── NotoSans-Medium.ttf
└── NotoSans-MediumItalic.ttf
```

**IMPORTANTE**: Si las tipografías no están disponibles, el sistema usará fuentes por defecto, pero el resultado visual no será el oficial.

---

### 3. **Google Sheets + Google Apps Script**
Para generar archivos `.tex` desde Google Sheets.

#### Configuración necesaria:
- Cuenta de Google (gmail)
- Acceso a Google Drive
- Permisos para ejecutar scripts en Google Sheets

---

## 📂 Estructura de Archivos para Distribución

### **Archivos ESENCIALES** (deben incluirse en la entrega):

```
PlantillasLatex/
│
├── sener2025.cls              # ⭐ Clase LaTeX (ESENCIAL)
├── google_apps_script_FINAL.js # ⭐ Script para Google Sheets (ESENCIAL)
├── referencias.bib            # ⭐ Bibliografía (opcional si no hay citas)
│
├── tipografias/               # ⭐ Tipografías institucionales (ESENCIAL)
│   ├── Patria_Regular.otf
│   ├── Patria_Bold.otf
│   ├── Patria_Light.otf
│   └── NotoSans-*.ttf (11 archivos)
│
├── image/                     # Imágenes para portadas/contraportadas
│   ├── portada_default.png
│   └── contraportada_default.png
│
├── img/                       # Carpeta para figuras del documento
│   └── (figuras insertadas en el documento)
│
├── ejemplos/                  # ⭐ Ejemplos de documentos (RECOMENDADO)
│   ├── ejemplo_completo.tex
│   └── ejemplo_simple.tex
│
└── GUIA_INSTALACION.md        # ⭐ Esta guía (ESENCIAL)
```

### **Archivos NO NECESARIOS** (pueden excluirse):

```
❌ web/                        # Interfaz web (ya no se usa)
❌ back/                       # Respaldos antiguos
❌ docs/                       # Documentación de desarrollo
❌ css/                        # Estilos web (ya no se usa)
❌ scripts/                    # Scripts de desarrollo
❌ temp/                       # Archivos temporales
❌ .git/                       # Control de versiones
❌ .vscode/                    # Configuración de VS Code
❌ *.aux, *.log, *.toc, etc.  # Archivos compilados de LaTeX
❌ *.md (excepto GUIA_INSTALACION.md)
```

---

## 🚀 Instalación Paso a Paso

### **PASO 1: Instalar LaTeX**

1. Descargar **TeX Live** para Windows: https://tug.org/texlive/
2. Ejecutar el instalador (puede tardar 30-60 minutos)
3. Verificar instalación:
   ```powershell
   xelatex --version
   ```

### **PASO 2: Copiar Archivos del Proyecto**

1. Crear carpeta en la computadora destino:
   ```powershell
   mkdir C:\PlantillasLatex
   ```

2. Copiar **SOLO** los archivos esenciales (ver estructura arriba):
   - `sener2025.cls`
   - `google_apps_script_FINAL.js`
   - Carpeta `tipografias/` completa
   - Carpetas `image/` e `img/` (crear vacías si no existen)
   - `ejemplos/` (opcional pero recomendado)
   - `GUIA_INSTALACION.md`

### **PASO 3: Verificar Tipografías**

```powershell
dir C:\PlantillasLatex\tipografias\
```

Debe mostrar 14 archivos (.otf y .ttf)

### **PASO 4: Configurar Google Sheets**

#### A. Crear Google Spreadsheet

1. Ir a: https://sheets.google.com
2. Crear nuevo spreadsheet
3. Nombrarlo: "SENER Documentos LaTeX"

#### B. Crear estructura de hojas

Crear las siguientes hojas (pestañas) con estos nombres exactos:

1. **Documentos** - Columnas:
   - ID, Titulo, Subtitulo, Autor, Fecha, Institucion, Unidad, DocumentoCorto, PalabrasClave, Version, ResumenEjecutivo, DatosClave

2. **Secciones** - Columnas:
   - DocumentoID, Orden, Nivel, Titulo, Contenido

3. **Tablas** - Columnas:
   - DocumentoID, SeccionOrden, OrdenTabla, Titulo, DatosCSV, Fuente

4. **Figuras** - Columnas:
   - DocumentoID, SeccionOrden, OrdenFigura, RutaArchivo, Caption, Fuente, TextoAlternativo

5. **Bibliografia** - Columnas:
   - DocumentoID, Clave, Tipo, Autor, Titulo, Anio, Editorial, Url

6. **Siglas** - Columnas:
   - DocumentoID, Sigla, Descripcion

7. **Glosario** - Columnas:
   - DocumentoID, Termino, Definicion

8. **Directorio** - Columnas:
   - Nombre, Cargo

#### C. Instalar el script

1. En Google Sheets, ir a: **Extensiones > Apps Script**
2. Borrar el código por defecto
3. Copiar TODO el contenido de `google_apps_script_FINAL.js`
4. Pegar en el editor de Apps Script
5. **IMPORTANTE**: Cambiar la línea 14:
   ```javascript
   const CARPETA_SALIDA_ID = 'TU_ID_DE_CARPETA_AQUI';
   ```
   
   Para obtener el ID:
   - Crear carpeta en Google Drive llamada "Salida LaTeX"
   - Abrir la carpeta
   - Copiar el ID de la URL: `https://drive.google.com/drive/folders/ESTE_ES_EL_ID`

6. Guardar el proyecto (Ctrl+S)
7. Cerrar y recargar el Google Sheets

#### D. Autorizar el script

1. Aparecerá un nuevo menú: **📄 SENER LaTeX**
2. Click en: **✨ Generar .tex de este documento**
3. Google pedirá permisos:
   - Click en "Revisar permisos"
   - Seleccionar tu cuenta
   - Click en "Avanzado"
   - Click en "Ir a SENER LaTeX Generator (no seguro)"
   - Click en "Permitir"

---

## 📝 Uso del Sistema

### **1. Crear documento en Google Sheets**

1. Ir a la hoja **Documentos**
2. Agregar una fila con los datos del documento
3. Rellenar las demás hojas (Secciones, Figuras, Tablas, etc.)

### **2. Generar archivo .tex**

1. Seleccionar la fila del documento en la hoja **Documentos**
2. Ir al menú: **📄 SENER LaTeX > ✨ Generar .tex de este documento**
3. Esperar a que aparezca el mensaje de éxito
4. Los archivos se guardan en la carpeta de Google Drive configurada

### **3. Descargar y compilar**

1. Ir a la carpeta "Salida LaTeX" en Google Drive
2. Descargar los archivos:
   - `nombre_documento.tex`
   - `referencias.bib` (si hay bibliografía)

3. Colocarlos en la carpeta del proyecto junto a `sener2025.cls`

4. Compilar con XeLaTeX:
   ```powershell
   cd C:\PlantillasLatex
   xelatex documento.tex
   ```

5. Si hay bibliografía:
   ```powershell
   xelatex documento.tex
   biber documento
   xelatex documento.tex
   xelatex documento.tex
   ```

---

## 🔧 Resolución de Problemas

### Error: "XeLaTeX no encontrado"
```
Solución: Agregar TeX Live al PATH de Windows
1. Panel de Control > Sistema > Configuración avanzada
2. Variables de entorno
3. Agregar: C:\texlive\2024\bin\win64
```

### Error: "Tipografía Patria no encontrada"
```
Solución: Verificar que la carpeta tipografias/ esté en la misma ubicación que el .tex
- La ruta debe ser relativa: tipografias/Patria_Regular.otf
```

### Error: "No se encuentra sener2025.cls"
```
Solución: Copiar sener2025.cls a la misma carpeta del documento .tex
```

### Error de permisos en Google Apps Script
```
Solución: Volver a autorizar el script
1. Extensiones > Apps Script
2. Ejecutar > Run
3. Autorizar de nuevo
```

---

## 📊 Estructura de Google Sheets - Ejemplo

### Hoja: Documentos
| ID | Titulo | Subtitulo | Autor | Fecha | DocumentoCorto |
|----|--------|-----------|-------|-------|----------------|
| 1  | Informe 2025 | Energía Renovable | SENER | 2025-01-15 | InformeEnergia25 |

### Hoja: Secciones
| DocumentoID | Orden | Nivel | Titulo | Contenido |
|-------------|-------|-------|--------|-----------|
| 1 | 1 | Seccion | Introducción | Este documento presenta... |
| 1 | 2 | Seccion | Metodología | Se aplicó el método... |

### Hoja: Directorio
| Nombre | Cargo |
|--------|-------|
| Mtra. Luz Elena González Escobar | Secretaria de Energía |
| Mtro. Juan José Vidal Amaro | Subsecretario de Hidrocarburos |

---

## 📞 Soporte

Para problemas técnicos:
1. Verificar que todos los archivos esenciales estén presentes
2. Verificar versión de XeLaTeX: `xelatex --version`
3. Revisar logs de compilación: `documento.log`
4. Verificar permisos de Google Apps Script

---

## 📄 Licencia y Uso

Este sistema es de uso exclusivo para la **Secretaría de Energía (SENER)**.
La identidad gráfica y tipografías son propiedad del Gobierno de México.
