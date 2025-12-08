# 📄 Guía de Uso: Generador LaTeX desde Google Sheets

## 🎯 Objetivo
Este sistema permite al equipo de comunicación social generar documentos PDF profesionales sin conocer LaTeX, usando Google Sheets como interfaz.

---

## 📋 Paso 1: Configurar Google Sheets

### Estructura de Hojas Requeridas

Tu Google Sheets debe tener estas hojas (respeta los nombres exactos):

#### 1️⃣ **Hoja "Documentos"**
Columnas:
- `ID` - Identificador único (ej: D01, D02)
- `Titulo` - Título principal del documento
- `Subtitulo` - Subtítulo (opcional)
- `Autor` - Autor o área responsable
- `Fecha` - Fecha de publicación
- `Institucion` - Nombre de la institución
- `Unidad` - Unidad responsable
- `DocumentoCorto` - Nombre corto para el archivo (sin espacios)
- `PalabrasClave` - Palabras clave separadas por punto y coma
- `Version` - Número de versión (ej: 1.0)
- `ResumenEjecutivo` - Texto del resumen ejecutivo
- `DatosClave` - Datos destacados (separados por punto y coma o saltos de línea)

#### 2️⃣ **Hoja "Secciones"**
Columnas:
- `DocumentoID` - ID del documento (debe coincidir con la hoja Documentos)
- `Orden` - Número de orden (1, 2, 2.1, 2.1.1, etc.)
- `Nivel` - Tipo de sección (ver tabla abajo)
- `Titulo` - Título de la sección
- `Contenido` - Contenido de la sección (ver etiquetas especiales)

**Niveles de Sección:**
| Nivel | Descripción | Ejemplo |
|-------|-------------|---------|
| `Seccion` | Sección principal | 1. Introducción |
| `Subseccion` | Subsección | 1.1 Antecedentes |
| `Subsubsección` | Sub-subsección | 1.1.1 Marco legal |
| `Párrafo/título pequeño` | Título menor | Definiciones |
| `Portada` | Portada de sección | (Página especial) |
| `Directorio` | Página de directorio | (Página especial) |
| `Contraportada` | Datos finales | (Página especial) |

#### 3️⃣ **Hoja "Bibliografia"** (opcional)
Columnas:
- `DocumentoID` - ID del documento
- `Clave` - Clave única de la referencia (ej: sener2024)
- `Tipo` - Tipo de referencia (report, article, book, etc.)
- `Autor` - Autor(es)
- `Titulo` - Título de la publicación
- `Anio` - Año de publicación
- `Editorial` - Editorial o institución
- `Url` - URL (opcional)

---

## 🏷️ Etiquetas Especiales en Contenido

Usa estas etiquetas dentro del campo "Contenido" de las secciones:

### 📝 Formato de Texto
```
[[nota:Texto de la nota al pie]]
[[cita:clave_bibliografia]]
[[dorado:Texto en color dorado]]
[[guinda:Texto en color guinda]]
```

### 📐 Matemáticas
```
[[math:E = mc^2]]  → Fórmula inline
[[ecuacion:
  x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}
]]  → Ecuación en bloque
```

### 📦 Bloques Especiales
```
[[ejemplo]]
Contenido del ejemplo
[[/ejemplo]]

[[caja]]
Contenido del recuadro
[[/caja]]

[[alerta]]
Contenido de advertencia
[[/alerta]]

[[info]]
Contenido informativo
[[/info]]

[[destacado]]
Cita o texto destacado
[[/destacado]]
```

### 📋 Listas
Usa guiones o asteriscos:
```
- Primer elemento
- Segundo elemento
  - Sub-elemento
```

---

## ⚙️ Paso 2: Instalar el Script en Google Sheets

1. Abre tu Google Sheets
2. Ve a **Extensiones > Apps Script**
3. Borra el código que aparece por defecto
4. Copia y pega el contenido de `google_apps_script_FINAL.js`
5. **IMPORTANTE**: En la línea 13, cambia el ID de la carpeta:
   ```javascript
   const CARPETA_SALIDA_ID = 'TU_ID_DE_CARPETA_AQUI';
   ```
   Para obtener el ID de tu carpeta de Drive:
   - Abre la carpeta en Drive
   - Copia el ID de la URL: `https://drive.google.com/drive/folders/[ESTE_ES_EL_ID]`

6. Guarda el proyecto (Ctrl+S)
7. Cierra el editor de Apps Script
8. Recarga tu Google Sheets

---

## 🚀 Paso 3: Generar el Documento

1. Abre la hoja **"Documentos"**
2. Haz clic en la fila del documento que quieres generar
3. Ve al menú **📄 SENER LaTeX** (aparece después de recargar)
4. Selecciona **✨ Generar .tex de este documento**
5. Espera unos segundos...
6. ¡Listo! Los archivos `.tex` y `.bib` estarán en tu carpeta de Drive

---

## 📥 Paso 4: Compilar a PDF

### Opción A: Overleaf (Recomendado para principiantes)
1. Ve a [overleaf.com](https://www.overleaf.com)
2. Crea un proyecto nuevo
3. Sube todos los archivos:
   - `sener2025.cls`
   - `referencias.bib`
   - El archivo `.tex` generado
   - Carpetas `img/` y `tipografias/`
4. Cambia el compilador a **XeLaTeX** (Menú > Compiler)
5. Haz clic en **Recompile**

### Opción B: Local (Requiere instalación)
1. Instala [MiKTeX](https://miktex.org/) o [TeX Live](https://www.tug.org/texlive/)
2. Abre terminal en la carpeta del proyecto
3. Ejecuta:
   ```bash
   xelatex documento.tex
   biber documento
   xelatex documento.tex
   xelatex documento.tex
   ```

---

## 🐛 Solución de Problemas

### ❌ "No se encuentra la hoja Documentos"
- Verifica que la hoja se llame exactamente **"Documentos"** (con mayúscula)

### ❌ "No se encontraron secciones"
- Verifica que el `DocumentoID` en la hoja Secciones coincida con el `ID` en Documentos
- Revisa que la columna se llame **"DocumentoID"** (no "ID")

### ❌ Error al guardar archivos
- Verifica que el `CARPETA_SALIDA_ID` sea correcto
- Asegúrate de tener permisos de escritura en la carpeta

### 📋 Ver errores detallados
- Ve al menú **📄 SENER LaTeX > 📋 Ver log de errores**

---

## 📚 Ejemplos de Contenido

### Ejemplo 1: Sección con lista y nota
```
El sistema energético mexicano enfrenta varios retos:

- Transición energética
- Seguridad de suministro
- Reducción de emisiones

[[nota:Datos del Balance Nacional de Energía 2024]]
```

### Ejemplo 2: Sección con cita y bloque destacado
```
La capacidad renovable ha crecido significativamente.[[cita:sener2024]]

[[destacado]]
La coordinación interinstitucional es clave para el éxito.
[[/destacado]]
```

### Ejemplo 3: Sección con matemáticas
```
La eficiencia energética se calcula como:

[[ecuacion:
\eta = \frac{E_{salida}}{E_{entrada}} \times 100
]]

Donde [[math:\eta]] representa la eficiencia en porcentaje.
```

---

## 📞 Soporte

Si tienes problemas:
1. Revisa el log de errores en el menú
2. Verifica que todas las columnas tengan los nombres correctos
3. Asegúrate de que los IDs coincidan entre hojas
4. Contacta al equipo técnico con el mensaje de error completo

---

## ✅ Checklist Rápido

Antes de generar:
- [ ] Todas las hojas tienen los nombres correctos
- [ ] El ID del documento existe en la hoja Documentos
- [ ] Las secciones tienen el mismo DocumentoID
- [ ] El CARPETA_SALIDA_ID está configurado
- [ ] Has seleccionado la fila correcta en Documentos

¡Listo para generar documentos profesionales! 🎉
