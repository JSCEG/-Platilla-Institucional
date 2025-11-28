![alt text](image.png)# 📊 Estructura Completa de Google Sheets para Documentos SENER

Este documento explica cómo estructurar tu Google Sheet para soportar TODOS los elementos del template LaTeX `sener2025.cls`.

## 🗂️ Pestañas del Google Sheet

Tu Google Sheet debe tener estas 12 pestañas:

### 1️⃣ **Metadata** - Información del documento
### 2️⃣ **Secciones** - Estructura del documento
### 3️⃣ **Contenido** - Párrafos y texto
### 4️⃣ **Tablas** - Definición de tablas
### 5️⃣ **Tabla_[ID]_Datos** - Datos de cada tabla (una pestaña por tabla)
### 6️⃣ **Figuras** - Imágenes y gráficos
### 7️⃣ **Callouts** - Avisos y recuadros destacados
### 8️⃣ **Bibliografia** - Referencias bibliográficas
### 9️⃣ **NotasPie** - Notas al pie de página
### 🔟 **Badges** - Etiquetas y badges
### 1️⃣1️⃣ **ProgressBars** - Barras de progreso
### 1️⃣2️⃣ **Timeline** - Eventos de línea de tiempo

---

## 📝 Estructura Detallada de Cada Pestaña

### 1️⃣ **Pestaña: Metadata**

Información general del documento.

```
| Campo              | Valor                                           |
|--------------------|-------------------------------------------------|
| Título             | PRODESEN 2025-2030                              |
| Subtítulo          | Programa de Desarrollo del Sistema Eléctrico   |
| Autor              | Dr. Jorge Marcial Islas Samperio                |
| Fecha              | Noviembre 2025                                  |
| Institución        | Secretaría de Energía                           |
| Unidad             | Subsecretaría de Planeación y Transición...     |
| DocumentoCorto     | PRODESEN 2025–2039                              |
| PalabrasClave      | energía, planeación, sistema eléctrico          |
| Version            | 2.0                                             |
```

**Cómo se usa en LaTeX:**
```latex
\title{PRODESEN 2025-2030}
\subtitle{Programa de Desarrollo...}
\author{Dr. Jorge Marcial Islas Samperio}
```

---

### 2️⃣ **Pestaña: Secciones**

Define la estructura del documento (capítulos/secciones).

```
| Número | Título                    | Subtítulo              | TienePortada |
|--------|---------------------------|------------------------|--------------|
| 1      | Disposiciones de Texto    | Ortotipografía         | SI           |
| 2      | Elementos de Plantilla    | Tipografía y Estilos   | SI           |
| 3      | Tablas y Gráficos         | Visualización de Datos | SI           |
| 4      | Elementos Avanzados       | Funcionalidades Pro    | SI           |
```

**Cómo se usa en LaTeX:**
```latex
\portadaseccion{1}{Disposiciones de Texto}{Ortotipografía}
\section{Disposiciones de Texto}
```

---

### 3️⃣ **Pestaña: Contenido**

Todo el texto del documento (párrafos, subsecciones, listas).

```
| Sección | Orden | Tipo         | Contenido                                    | Opciones          |
|---------|-------|--------------|----------------------------------------------|-------------------|
| 1       | 1     | subseccion   | Texto a una columna                          |                   |
| 1       | 2     | parrafo      | El texto estándar se presenta a una...       |                   |
| 1       | 3     | subseccion   | Texto a dos columnas                         |                   |
| 1       | 4     | parrafo      | Para secciones que requieren...              | columnas=2        |
| 2       | 1     | subseccion   | Recuadros y Cajas Destacadas                 |                   |
| 2       | 2     | parrafo      | Se han diseñado recuadros específicos...     |                   |
| 2       | 3     | lista        | Portada con fondo|Portadas de sección|...    | tipo=enumerate    |
| 2       | 4     | letraCapital | E|sta es una demostración                    |                   |
```

**Tipos de contenido soportados:**
- `parrafo` - Texto normal
- `subseccion` - Subsección (\subsection)
- `subsubseccion` - Sub-subsección (\subsubsection)
- `lista` - Lista (enumerate o itemize)
- `letraCapital` - Drop cap (formato: "Letra|resto del texto")
- `notaMargen` - Nota al margen
- `destacado` - Cita destacada (pull quote)

**Opciones especiales:**
- `columnas=2` - Texto a dos columnas
- `tipo=enumerate` o `tipo=itemize` - Tipo de lista

**Cómo se usa en LaTeX:**
```latex
\subsection{Texto a una columna}
El texto estándar se presenta a una...

\letraCapital{E}{sta es una demostración}
```

---

### 4️⃣ **Pestaña: Tablas**

Define las tablas del documento.

```
| ID    | Sección | Orden | Caption                              | Estilo   | Label      |
|-------|---------|-------|--------------------------------------|----------|------------|
| tab1  | 3       | 1     | Capacidad instalada por región 2024  | guinda   | tab:cap    |
| tab2  | 3       | 2     | Proyectos de energías renovables...  | verde    | tab:ren    |
| tab3  | 3       | 3     | Inversión programada por sector...   | dorado   | tab:inv    |
```

**Estilos disponibles:**
- `guinda` - Tabla con encabezado guinda
- `verde` - Tabla con encabezado verde
- `dorado` - Tabla con encabezado dorado
- `gris` - Tabla con encabezado gris
- `limpia` - Tabla sin color de fondo

**Cómo se usa en LaTeX:**
```latex
\begin{tablaguinda}
  \caption{Capacidad instalada por región 2024}
  \label{tab:cap}
  ...
\end{tablaguinda}
```

---

### 5️⃣ **Pestaña: Tabla_tab1_Datos**

Datos de cada tabla (crea una pestaña por cada tabla, usando el ID).

**Ejemplo para tabla "tab1":**
```
| Región          | Capacidad (MW) | Demanda (MW) | Factor (%) |
|-----------------|----------------|--------------|------------|
| Baja California | 3,500          | 2,300        | 68         |
| Noroeste        | 5,100          | 3,900        | 73         |
| Norte           | 6,800          | 4,500        | 71         |
| Occidental      | 7,200          | 5,100        | 75         |
| Central         | 12,400         | 9,800        | 79         |
| **Total**       | **35,000**     | **25,600**   | **73**     |
```

**Nota:** Usa `**texto**` para negritas en la última fila (totales).

---

### 6️⃣ **Pestaña: Figuras**

Define las imágenes y gráficos.

```
| ID    | Sección | Orden | Archivo                    | Caption                              | Ancho  | Label      |
|-------|---------|-------|----------------------------|--------------------------------------|--------|------------|
| fig1  | 3       | 1     | mapa_sen_2025.png          | Regiones y enlaces del SEN en 2025   | 1.0    | fig:sen    |
| fig2  | 3       | 2     | adicion_capacidad.png      | Adición de capacidad 2025-2030       | 1.0    | fig:cap    |
| fig3  | 3       | 3     | mapa_gasoductos_2024.png   | Red nacional de gasoductos 2024      | 1.0    | fig:gas    |
```

**Ancho:**
- `1.0` = 100% del ancho de texto
- `0.5` = 50% del ancho de texto
- etc.

**Cómo se usa en LaTeX:**
```latex
\begin{figure}[H]
  \centering
  \includegraphics[width=1.0\textwidth]{img/graficos/mapa_sen_2025.png}
  \caption{Regiones y enlaces del SEN en 2025}
  \label{fig:sen}
\end{figure}
```

---

### 7️⃣ **Pestaña: Callouts**

Recuadros destacados (avisos, advertencias, información importante).

```
| Sección | Orden | Tipo       | Título      | Contenido                                    |
|---------|-------|------------|-------------|----------------------------------------------|
| 2       | 1     | recuadro   |             | Este es un recuadro informativo general...   |
| 2       | 2     | importante |             | Las notas importantes utilizan el color...   |
| 2       | 3     | definicion |             | Sistema Eléctrico Nacional (SEN): Conjunto...|
| 2       | 4     | datosclave |             | Capacidad instalada: 91,800 MW...            |
| 4       | 1     | calloutTip | Consejo     | Para maximizar la eficiencia energética...   |
| 4       | 2     | calloutWarning | Atención | Los plazos de entrega deben cumplirse...     |
| 4       | 3     | calloutImportant | Crítico | La meta de 35% requiere acción inmediata...  |
```

**Tipos disponibles:**
- `recuadro` - Recuadro informativo general
- `importante` - Nota importante (guinda)
- `definicion` - Definición (verde)
- `ejemplo` - Ejemplo (dorado)
- `datosclave` - Datos clave
- `calloutTip` - Consejo (verde, estilo GitHub)
- `calloutWarning` - Advertencia (ámbar, estilo GitHub)
- `calloutImportant` - Importante (guinda, estilo GitHub)

**Cómo se usa en LaTeX:**
```latex
\begin{calloutTip}[Consejo]
Para maximizar la eficiencia energética...
\end{calloutTip}
```

---

### 8️⃣ **Pestaña: Bibliografia**

Referencias bibliográficas en formato BibTeX.

```
| ID                    | Tipo     | Autor                | Título                           | Año  | Editorial/Journal    | Otros                |
|-----------------------|----------|----------------------|----------------------------------|------|----------------------|----------------------|
| rodriguez2023planeacion | book    | Rodríguez, A.        | Planeación Energética en México  | 2023 | Editorial Académica  | pages={1-300}        |
| gomez2023renovables   | article  | Gómez, L.            | Energías Renovables en México    | 2023 | Revista Energía      | volume={15},number={2}|
| sener2024pladese      | report   | SENER                | PLADESE 2024-2030                | 2024 | SENER                | type={Reporte Técnico}|
| sener2024portal       | online   | SENER                | Portal Oficial                   | 2024 |                      | url={www.gob.mx/sener}|
```

**Tipos soportados:**
- `book` - Libro
- `article` - Artículo de revista
- `report` - Reporte técnico
- `online` - Recurso en línea

**Cómo se usa en LaTeX:**
```latex
% Se genera automáticamente el archivo .bib
\printbibliography[title={Referencias Bibliográficas}]
```

---

### 9️⃣ **Pestaña: NotasPie**

Notas al pie de página.

```
| Sección | Orden | Referencia | Texto                                        |
|---------|-------|------------|----------------------------------------------|
| 2       | 1     | 1          | Según el artículo 27 constitucional...       |
| 2       | 2     | 2          | Datos actualizados al 31 de diciembre 2024   |
| 3       | 1     | 3          | Fuente: CFE, Reporte Anual 2024              |
```

**Cómo se usa en LaTeX:**
```latex
El sector energético\footnote{Según el artículo 27 constitucional...}
```

---

### 🔟 **Pestaña: Badges**

Etiquetas visuales tipo "pills".

```
| Sección | Orden | Texto      | Color      |
|---------|-------|------------|------------|
| 4       | 1     | NUEVO      | guinda     |
| 4       | 2     | APROBADO   | verde      |
| 4       | 3     | 2025       | dorado     |
| 4       | 4     | PRIORITARIO| gris       |
```

**Colores disponibles:**
- `guinda`, `verde`, `dorado`, `gris`

**Cómo se usa en LaTeX:**
```latex
\badge{NUEVO} \badge[gobmxVerde]{APROBADO}
```

---

### 1️⃣1️⃣ **Pestaña: ProgressBars**

Barras de progreso para visualizar metas.

```
| Sección | Orden | Porcentaje | Etiqueta                        | Color   |
|---------|-------|------------|---------------------------------|---------|
| 4       | 1     | 31.2       | Energías Limpias: 31.2% de 35%  | verde   |
| 4       | 2     | 68         | Cobertura Eléctrica: 68%        | dorado  |
| 4       | 3     | 85         | Modernización de Red: 85%       | guinda  |
```

**Cómo se usa en LaTeX:**
```latex
\progressbar{31.2}{Energías Limpias: 31.2\% de 35\%}
\progressbar[gobmxDorado]{68}{Cobertura Eléctrica: 68\%}
```

---

### 1️⃣2️⃣ **Pestaña: Timeline**

Eventos para líneas de tiempo.

```
| Sección | TimelineID | Posicion | Año  | Descripción           |
|---------|------------|----------|------|-----------------------|
| 4       | tl1        | 0        | 2020 | Inicio del PRODESEN   |
| 4       | tl1        | 3        | 2022 | Primera Revisión      |
| 4       | tl1        | 6        | 2024 | Evaluación Intermedia |
| 4       | tl1        | 9        | 2027 | Segunda Revisión      |
| 4       | tl1        | 12       | 2030 | Meta Final            |
```

**Cómo se usa en LaTeX:**
```latex
\begin{timeline}
  \draw[timeline] (0,0) -- (12,0);
  \evento{0}{2020}{Inicio del PRODESEN}
  \evento{3}{2022}{Primera Revisión}
  ...
\end{timeline}
```

---

## 🎯 Flujo de Trabajo Normal

### 1. **Crear el documento**
1. Llena la pestaña **Metadata** con la información del documento
2. Define la estructura en **Secciones**
3. Escribe el contenido en **Contenido**

### 2. **Agregar elementos**
- ¿Necesitas una tabla? → Agrega en **Tablas** y crea pestaña **Tabla_[ID]_Datos**
- ¿Necesitas una figura? → Agrega en **Figuras**
- ¿Necesitas un aviso? → Agrega en **Callouts**
- ¿Necesitas bibliografía? → Agrega en **Bibliografia**

### 3. **Generar PDF**
1. Abre la aplicación web
2. Carga desde Google Sheets
3. Previsualiza
4. Genera PDF

### 4. **Actualizar estilos**
1. Edita `sener2025.cls` en GitHub
2. Haz commit y push
3. La próxima vez que generes PDF, usará los estilos nuevos automáticamente

---

## 📋 Template de Google Sheet Listo para Copiar

Puedes copiar este Google Sheet de ejemplo:
👉 [Próximamente: Link al template]

O crear uno nuevo siguiendo esta estructura.

---

## 💡 Tips y Mejores Prácticas

### ✅ **Orden de contenido**
- Usa la columna "Orden" para controlar el orden de aparición
- Numera de 10 en 10 (10, 20, 30...) para poder insertar elementos después

### ✅ **IDs únicos**
- Usa IDs descriptivos: `tab_capacidad`, `fig_mapa_sen`, etc.
- No uses espacios ni caracteres especiales

### ✅ **Caracteres especiales en LaTeX**
- `%` → Escribe `\%`
- `&` → Escribe `\&`
- `$` → Escribe `\$`
- `_` → Escribe `\_`

### ✅ **Negritas y cursivas**
- Negritas: `**texto**` → `\textbf{texto}`
- Cursivas: `*texto*` → `\textit{texto}`

### ✅ **Listas**
- Separa items con `|`
- Ejemplo: `Item 1|Item 2|Item 3`

---

## 🔄 Actualización de Estilos

Cuando actualizas `sener2025.cls`:
1. Editas el archivo en tu computadora
2. `git add sener2025.cls`
3. `git commit -m "Actualizar estilos"`
4. `git push`
5. ✅ La app web usa automáticamente la nueva versión

**No necesitas tocar el Google Sheet** para actualizar estilos.

---

¿Listo para crear tu Google Sheet? 🚀
