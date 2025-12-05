# 📄 Guía Completa: Generador LaTeX desde Google Sheets

## 🎯 Objetivo
Sistema completo para generar documentos PDF profesionales desde Google Sheets, incluyendo figuras, tablas, glosario, siglas y bibliografía.

---

## 📋 Estructura Completa de Hojas

### 1️⃣ **Hoja "Documentos"**
Metadatos del documento principal.

**Columnas:**
- `ID` - Identificador único (ej: D01, D02)
- `Titulo` - Título principal
- `Subtitulo` - Subtítulo (opcional)
- `Autor` - Autor o área responsable
- `Fecha` - Fecha de publicación
- `Institucion` - Nombre de la institución
- `Unidad` - Unidad responsable
- `DocumentoCorto` - Nombre corto para archivo (sin espacios ni acentos)
- `PalabrasClave` - Palabras clave separadas por punto y coma
- `Version` - Número de versión (ej: 1.0)
- `ResumenEjecutivo` - Texto del resumen ejecutivo
- `DatosClave` - Datos destacados (separados por ; o saltos de línea)

---

### 2️⃣ **Hoja "Secciones"**
Contenido del documento organizado por secciones.

**Columnas:**
- `DocumentoID` - ID del documento (debe coincidir con Documentos)
- `Orden` - Número de orden (1, 2, 2.1, 2.1.1, etc.)
- `Nivel` - Tipo de sección
- `Titulo` - Título de la sección
- `Contenido` - Contenido con etiquetas especiales

**Niveles disponibles:**
- `Seccion` - Sección principal (1, 2, 3...)
- `Subseccion` - Subsección (1.1, 2.1...)
- `Subsubsección` - Sub-subsección (1.1.1, 2.1.1...)
- `Párrafo/título pequeño` - Título menor
- `Portada` - Portada de sección especial
- `Directorio` - Página de directorio
- `Contraportada` - Datos finales

---

### 3️⃣ **Hoja "Figuras"**
Imágenes y gráficos del documento.

**Columnas:**
- `DocumentoID` - ID del documento
- `SeccionOrden` - Orden de la sección donde aparece (ej: 2, 2.1)
- `OrdenFigura` - Orden dentro de la sección (1, 2, 3...)
- `RutaArchivo` - URL de Google Drive o ruta local
- `Caption` - Descripción de la figura
- `Fuente` - Fuente de los datos (opcional)

**Ejemplo de URL de Google Drive:**
```
https://drive.google.com/file/d/1Ny_AvsRGIP-9uYfVcp3AUGMxOAbE45WN/view?usp=sharing
```

**Notas:**
- Las figuras se insertan automáticamente al final de cada sección
- El script convierte URLs de Drive a formato de descarga directa
- Soporta formatos: PNG, JPG, PDF

---

### 4️⃣ **Hoja "Tablas"**
Tablas del documento.

**Columnas:**
- `DocumentoID` - ID del documento
- `SeccionOrden` - Orden de la sección donde aparece
- `OrdenTabla` - Orden dentro de la sección
- `Titulo` - Título de la tabla
- `Fuente` - Fuente de los datos
- `DatosCSV` - Referencia a datos o CSV directo

**Formato de DatosCSV:**

**Opción 1: Referencia a hoja "Datos Tablas"**
```
Datos_Tablas!A1:E4
```

**Opción 2: CSV directo**
```
Concepto,2020,2021,2022,2023
Solar,100,150,200,250
Eólica,300,350,400,450
```

---

### 5️⃣ **Hoja "Datos Tablas"**
Almacena los datos de las tablas en formato de hoja de cálculo.

**Estructura:**
- Organiza los datos en rangos
- Cada tabla ocupa un rango específico
- La primera fila de cada rango son los encabezados

**Ejemplo:**
```
A1: Tecnología | B1: 2020 | C1: 2021 | D1: 2022
A2: Solar      | B2: 100  | C2: 150  | D2: 200
A3: Eólica     | B3: 300  | C3: 350  | D3: 400
```

---

### 6️⃣ **Hoja "Siglas"**
Siglas y acrónimos del documento.

**Columnas:**
- `DocumentoID` - ID del documento
- `Sigla` - Sigla o acrónimo (ej: SENER, CFE)
- `Descripcion` - Descripción completa

**Ejemplo:**
```
CENACE | Centro Nacional de Control de Energía
SENER  | Secretaría de Energía
CFE    | Comisión Federal de Electricidad
```

**Notas:**
- Se ordenan alfabéticamente automáticamente
- Aparecen en una sección especial antes de la bibliografía

---

### 7️⃣ **Hoja "Glosario"**
Términos técnicos y definiciones.

**Columnas:**
- `DocumentoID` - ID del documento
- `Termino` - Término a definir
- `Definicion` - Definición del término

**Ejemplo:**
```
Energías Limpias | Fuentes de energía que no emiten gases de efecto invernadero
Transición Energética | Proceso de cambio hacia fuentes de energía más sostenibles
```

**Notas:**
- Se ordenan alfabéticamente automáticamente
- Aparecen en una sección especial antes de las siglas

---

### 8️⃣ **Hoja "Bibliografia"**
Referencias bibliográficas.

**Columnas:**
- `DocumentoID` - ID del documento
- `Clave` - Clave única para citar (ej: sener2024)
- `Tipo` - Tipo de referencia (report, article, book, online, etc.)
- `Autor` - Autor(es)
- `Titulo` - Título de la publicación
- `Anio` - Año de publicación
- `Editorial` - Editorial o institución
- `Url` - URL (opcional)

**Tipos de referencia:**
- `report` - Informes y reportes
- `article` - Artículos de revista
- `book` - Libros
- `online` - Recursos en línea
- `misc` - Otros

---

## 🏷️ Etiquetas Especiales en Contenido

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
```
- Primer elemento
- Segundo elemento
  - Sub-elemento
* También funciona con asteriscos
```

---

## ⚙️ Instalación del Script

1. Abre tu Google Sheets
2. Ve a **Extensiones > Apps Script**
3. Borra el código por defecto
4. Copia y pega el contenido de `google_apps_script_FINAL.js`
5. **IMPORTANTE**: Cambia el ID de la carpeta en la línea 13:
   ```javascript
   const CARPETA_SALIDA_ID = 'TU_ID_DE_CARPETA_AQUI';
   ```
6. Guarda el proyecto (Ctrl+S)
7. Cierra el editor
8. Recarga tu Google Sheets

---

## 🚀 Uso del Sistema

### Paso 1: Preparar los Datos
1. Llena la hoja **Documentos** con los metadatos
2. Agrega secciones en **Secciones** con el mismo `DocumentoID`
3. Agrega figuras en **Figuras** (opcional)
4. Agrega tablas en **Tablas** (opcional)
5. Llena **Siglas** y **Glosario** (opcional)
6. Agrega referencias en **Bibliografia** (opcional)

### Paso 2: Generar el Documento
1. Ve a la hoja **Documentos**
2. Haz clic en la fila del documento que quieres generar
3. Ve al menú **📄 SENER LaTeX**
4. Selecciona **✨ Generar .tex de este documento**
5. Espera el mensaje de confirmación

### Paso 3: Compilar a PDF
1. Descarga los archivos de tu carpeta de Drive
2. Sube a Overleaf o compila localmente
3. Asegúrate de usar **XeLaTeX** como compilador

---

## 📊 Ejemplo Completo

### Documentos
| ID | Titulo | DocumentoCorto | ... |
|----|--------|----------------|-----|
| D01 | Informe Energía 2025 | InformeEnergia25 | ... |

### Secciones
| DocumentoID | Orden | Nivel | Titulo | Contenido |
|-------------|-------|-------|--------|-----------|
| D01 | 1 | Seccion | Introducción | El sector energético...[[nota:Datos 2024]] |
| D01 | 2 | Seccion | Análisis | La capacidad instalada...[[cita:sener2024]] |
| D01 | 2.1 | Subseccion | Renovables | Las energías renovables... |

### Figuras
| DocumentoID | SeccionOrden | OrdenFigura | RutaArchivo | Caption | Fuente |
|-------------|--------------|-------------|-------------|---------|--------|
| D01 | 2 | 1 | https://drive.google.com/... | Capacidad instalada | SENER 2024 |

### Tablas
| DocumentoID | SeccionOrden | OrdenTabla | Titulo | Fuente | DatosCSV |
|-------------|--------------|------------|--------|--------|----------|
| D01 | 2 | 1 | Capacidad por tecnología | SENER | Datos_Tablas!A1:E4 |

### Siglas
| DocumentoID | Sigla | Descripcion |
|-------------|-------|-------------|
| D01 | SENER | Secretaría de Energía |
| D01 | CFE | Comisión Federal de Electricidad |

### Glosario
| DocumentoID | Termino | Definicion |
|-------------|---------|------------|
| D01 | Energías Limpias | Fuentes sin emisiones GEI |

### Bibliografia
| DocumentoID | Clave | Tipo | Autor | Titulo | Anio | ... |
|-------------|-------|------|-------|--------|------|-----|
| D01 | sener2024 | report | SENER | Balance Nacional | 2024 | ... |

---

## 🎨 Resultado Final

El documento generado incluirá:

✅ Portada institucional  
✅ Tabla de contenidos  
✅ Resumen ejecutivo  
✅ Datos clave destacados  
✅ Secciones con formato correcto  
✅ Figuras insertadas automáticamente  
✅ Tablas con estilo institucional  
✅ Notas al pie  
✅ Citas bibliográficas  
✅ Glosario ordenado alfabéticamente  
✅ Siglas y acrónimos  
✅ Bibliografía completa  
✅ Contraportada  

---

## 🐛 Solución de Problemas

### ❌ "No se encontraron secciones"
- Verifica que `DocumentoID` en Secciones coincida con `ID` en Documentos
- Revisa que la columna se llame exactamente **"DocumentoID"**

### ❌ Las figuras no aparecen
- Verifica que la URL de Google Drive sea correcta
- Asegúrate de que el archivo tenga permisos de visualización pública
- Revisa que `SeccionOrden` coincida con el `Orden` de una sección

### ❌ Las tablas están vacías
- Si usas referencia a `Datos_Tablas`, verifica que el rango sea correcto
- Prueba con CSV directo primero para verificar el formato

### ❌ Error al compilar PDF
- Verifica que uses **XeLaTeX** (no pdfLaTeX)
- Asegúrate de tener las carpetas `img/` y `tipografias/`
- Revisa que `sener2025.cls` esté en la misma carpeta

### 📋 Ver log detallado
Menú: **📄 SENER LaTeX > 📋 Ver log de errores**

---

## 💡 Tips Avanzados

### Figuras desde Drive
1. Sube la imagen a Google Drive
2. Haz clic derecho > Obtener enlace
3. Cambia a "Cualquier persona con el enlace"
4. Copia la URL completa en `RutaArchivo`

### Tablas complejas
Para tablas con formato especial, usa CSV directo:
```
Concepto,Valor 1,Valor 2
"Dato con, coma",100,200
Dato normal,300,400
```

### Orden de secciones
Usa decimales para control fino:
```
1    - Introducción
1.1  - Antecedentes
1.2  - Objetivos
2    - Metodología
2.1  - Enfoque
```

### Múltiples documentos
Puedes tener varios documentos en el mismo Sheet:
- D01, D02, D03...
- Cada uno con sus propias secciones, figuras, etc.
- Genera uno a la vez seleccionando la fila correspondiente

---

## ✅ Checklist Pre-Generación

- [ ] Todas las hojas tienen nombres correctos
- [ ] El `ID` del documento existe en Documentos
- [ ] Todas las secciones tienen el mismo `DocumentoID`
- [ ] Las figuras tienen URLs válidas
- [ ] Las tablas tienen datos o referencias correctas
- [ ] El `CARPETA_SALIDA_ID` está configurado
- [ ] Has seleccionado la fila correcta en Documentos
- [ ] Las siglas y glosario están completos (si aplica)

🎉 **¡Listo para generar documentos profesionales completos!**
