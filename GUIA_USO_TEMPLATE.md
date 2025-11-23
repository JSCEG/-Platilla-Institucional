# Guía de Uso - Plantilla Institucional SENER 2025

## Elementos Profesionales para Documentos Oficiales

### 1. Tablas con Estilos Institucionales

#### Estilos de Tabla Disponibles

**Tabla estilo guinda (predeterminada):**
```latex
\begin{tablaguinda}
  \caption{Título de la tabla}
  \begin{tabular}{lrr}
    \toprule
    \encabezadoguinda{Col 1} & \encabezadoguinda{Col 2} \\
    \midrule
    Dato 1 & Dato 2 \\
    \bottomrule
  \end{tabular}
\end{tablaguinda}
```

**Tabla estilo verde:**
```latex
\begin{tablaverde}
  \caption{Proyectos ambientales}
  \begin{tabular}{lrr}
    \toprule
    \encabezadoverde{Col 1} & \encabezadoverde{Col 2} \\
    \midrule
    Dato 1 & Dato 2 \\
    \bottomrule
  \end{tabular}
\end{tablaverde}
```

**Tabla estilo dorado:**
```latex
\begin{tabladorado}
  \caption{Inversiones y presupuesto}
  \begin{tabular}{lrr}
    \toprule
    \encabezadodorado{Col 1} & \encabezadodorado{Col 2} \\
    \midrule
    Dato 1 & Dato 2 \\
    \bottomrule
  \end{tabular}
\end{tabladorado}
```

**Tabla estilo gris (neutral):**
```latex
\begin{tablagris}
  \caption{Datos técnicos}
  \begin{tabular}{lrr}
    \toprule
    \encabezadogris{Col 1} & \encabezadogris{Col 2} \\
    \midrule
    Dato 1 & Dato 2 \\
    \bottomrule
  \end{tabular}
\end{tablagris}
```

**Tabla limpia (sin stripes):**
```latex
\begin{tablalimpia}
  \caption{Tabla sin rayas alternadas}
  \begin{tabular}{lrr}
    \toprule
    \encabezadoguinda{Col 1} & \encabezadoguinda{Col 2} \\
    \midrule
    Dato 1 & Dato 2 \\
    \bottomrule
  \end{tabular}
\end{tablalimpia}
```

#### Combinación de Estilos

Puedes mezclar encabezados y stripes:
```latex
\begin{tablaverde}
  \begin{tabular}{lrr}
    \toprule
    \encabezadodorado{Col 1} & \encabezadodorado{Col 2} \\
    \midrule
    Dato 1 & Dato 2 \\
    \bottomrule
  \end{tabular}
\end{tablaverde}
```

**Características:**
- Filas alternadas con colores institucionales
- 4 comandos de encabezado: `\encabezadoguinda`, `\encabezadoverde`, `\encabezadodorado`, `\encabezadogris`
- 5 estilos de tabla: `tablaguinda`, `tablaverde`, `tabladorado`, `tablagris`, `tablalimpia`
- Texto blanco en encabezados
- Aspecto profesional tipo Bootstrap

### 2. Resumen Ejecutivo

```latex
\begin{resumenejecutivo}
Contenido del resumen ejecutivo con los puntos más importantes del documento.
\end{resumenejecutivo}
```

**Uso recomendado:**
- Al inicio de documentos extensos
- Para destacar conclusiones principales
- En reportes ejecutivos

### 3. Datos Clave

```latex
\begin{datosclave}
\begin{itemize}
  \item \textbf{Indicador:} \highlight{Valor destacado}
  \item \textbf{Otro indicador:} \highlight{Otro valor}
\end{itemize}
\end{datosclave}
```

**Uso recomendado:**
- Cifras importantes del sector
- Indicadores de desempeño
- Datos estadísticos relevantes

### 4. Metadatos para Publicación

```latex
\title{Título del Documento}
\subtitle{Subtítulo descriptivo}
\author{Unidad responsable}
\date{Mes Año}
\institucion{Secretaría de Energía}
\unidad{Unidad de Planeación Energética}
\setDocumentoCorto{Nombre corto para encabezados}
\palabrasclave{palabra1, palabra2, palabra3}
\version{1.0}
```

**Beneficios:**
- Metadatos embebidos en el PDF
- Mejor indexación en buscadores
- Información de autoría clara
- Control de versiones

### 5. Tipos de Columnas Personalizadas

```latex
% Columna alineada a la izquierda con ancho fijo
\begin{tabular}{L{3cm}C{2cm}R{2cm}}

% Columna que se expande automáticamente
\begin{tabularx}{\textwidth}{lXrr}
```

**Tipos disponibles:**
- `L{ancho}` - Izquierda con ancho fijo
- `C{ancho}` - Centrado con ancho fijo
- `R{ancho}` - Derecha con ancho fijo
- `X` - Expansión automática (solo con tabularx)

### 6. Recuadros Existentes

#### Recuadro General
```latex
\begin{recuadro}
Información general
\end{recuadro}
```

#### Nota Importante
```latex
\begin{notaimportante}
Advertencia o información crítica
\end{notaimportante}
```

#### Definición
```latex
\begin{definicion}
\textbf{Término:} Definición del término técnico
\end{definicion}
```

#### Ejemplo
```latex
\begin{ejemplo}
Ejemplo práctico con ecuaciones o casos de uso
\end{ejemplo}
```

### 7. Valores Destacados

```latex
\highlight{92,000 MW}
```

\highlight{92,000 MW}
```

Crea un recuadro naranja con texto blanco para destacar cifras importantes.

### 8. Inserción de Gráficos (PNG/JPG)

Para incluir gráficos generados en Excel, Python o D3.js, se recomienda exportarlos como imagen (PNG de alta resolución) e insertarlos así:

```latex
\begin{figure}[H]
  \centering
  \includegraphics[width=0.8\textwidth]{img/mi_grafico.png}
  \caption{Título del gráfico}
  \label{fig:mi-grafico}
\end{figure}
```

**Recomendaciones:**
- Usar PNG para gráficos con texto y líneas (mejor nitidez).
- Usar JPG solo para fotografías.
- Ancho recomendado: `0.8\textwidth` o `1.0\textwidth`.

## Tipos de Portada

### Portada Estándar (sin fondo)
```latex
\maketitle
```
- Fondo blanco
- Logos institucionales
- Colores guinda y dorado para títulos
- Ideal para documentos técnicos y reportes

### Portada con Fondo Guinda
```latex
\portadafondo
```
- Imagen de fondo institucional (`img/fondo_guinda.png`)
- Texto en blanco y dorado sobre fondo guinda
- Aspecto más impactante
- Recomendada para documentos principales (PRODESEN, PLADESE, etc.)

## Recomendaciones para Documentos Oficiales

### Estructura Sugerida

1. **Portada** - `\maketitle` o `\portadafondo`
2. **Página de créditos** - `\paginacreditos{...}`
3. **Tabla de contenidos** - `\tableofcontents`
4. **Índices** - `\listatablas` y `\listafiguras`
5. **Resumen ejecutivo** - Usar `resumenejecutivo`
6. **Contenido principal** - Secciones con tablas profesionales
7. **Anexos** - `\anexos`
8. **Bibliografía** - `\printbibliography`
9. **Contraportada** - `\contraportada{...}`

### Colores Institucionales

- **Guinda:** `#691B32` - Títulos principales, tablas de datos generales
- **Verde:** `#006B5C` - Subtítulos, tablas de proyectos ambientales/renovables
- **Dorado:** `#C99700` - Acentos, tablas de inversión/presupuesto
- **Gris:** `#6C6C6C` - Texto secundario, tablas técnicas/neutrales
- **Gris Claro:** `#F5F5F5` - Fondos, filas alternadas

### Guía de Uso de Colores en Tablas

| Tipo de Contenido | Estilo Recomendado |
|-------------------|-------------------|
| Datos generales, estadísticas | `tablaguinda` |
| Proyectos renovables, ambientales | `tablaverde` |
| Inversiones, presupuestos, financiero | `tabladorado` |
| Datos técnicos, indicadores neutrales | `tablagris` |
| Tablas formales sin énfasis | `tablalimpia` |

### Compilación

```bash
xelatex documento.tex
biber documento
xelatex documento.tex
xelatex documento.tex
```

O usar latexmk:
```bash
latexmk -xelatex documento.tex
```

## Citas y Referencias Bibliográficas

### Comandos de Citación (Formato APA)

```latex
% Cita en paréntesis (más común)
\autocite{clave2024}
% Resultado: (Autor, 2024)

% Cita integrada en el texto
\textcite{clave2024}
% Resultado: Autor (2024)

% Citas múltiples
\autocite{clave1,clave2,clave3}
% Resultado: (Autor1, 2024; Autor2, 2023; Autor3, 2022)
```

### Tipos de Fuentes en referencias.bib

#### Libro
```bibtex
@book{clave,
  author    = {Apellido, Nombre},
  title     = {Título del Libro},
  year      = {2024},
  publisher = {Editorial},
  address   = {Ciudad},
  edition   = {2}
}
```

#### Artículo de revista
```bibtex
@article{clave,
  author  = {Apellido, Nombre and Apellido2, Nombre2},
  title   = {Título del artículo},
  journal = {Nombre de la Revista},
  year    = {2024},
  volume  = {10},
  number  = {2},
  pages   = {123-145},
  doi     = {10.1234/ejemplo}
}
```

#### Reporte técnico
```bibtex
@techreport{clave,
  author      = {{Nombre de la Institución}},
  title       = {Título del Reporte},
  year        = {2024},
  institution = {Institución},
  address     = {Ciudad}
}
```

#### Página web
```bibtex
@online{clave,
  author  = {{Organización}},
  title   = {Título de la Página},
  year    = {2024},
  url     = {https://ejemplo.com},
  urldate = {2024-11-20}
}
```

#### Tesis
```bibtex
@phdthesis{clave,
  author  = {Apellido, Nombre},
  title   = {Título de la Tesis},
  school  = {Universidad},
  year    = {2024},
  type    = {Tesis doctoral}
}
```

#### Ley o norma
```bibtex
@misc{clave,
  author = {{Congreso de la Unión}},
  title  = {Nombre de la Ley},
  year   = {2024},
  note   = {Diario Oficial de la Federación}
}
```

### Compilación con Bibliografía

```bash
xelatex documento.tex
biber documento
xelatex documento.tex
xelatex documento.tex
```

O usar latexmk:
```bash
latexmk -xelatex documento.tex
```

## Ejemplos de Uso

Ver archivos:
- `template-institucional.tex` - Ejemplo completo con todas las funcionalidades (portada estándar)
- `ejemplo-portada-fondo.tex` - Ejemplo con portada de fondo guinda
- `ejemplo-tablas-profesionales.tex` - Enfoque en tablas y recuadros oficiales
- `ejemplo-citas-bibliografia.tex` - Guía completa de citas y referencias en formato APA
- `referencias.bib` - Ejemplos de todos los tipos de fuentes bibliográficas

## Guía de Imágenes y Gráficos (Calidad Premium)

Para asegurar que los documentos impresos y digitales mantengan una calidad profesional, es crítico utilizar los formatos de archivo correctos.

### Regla de Oro: Vectores vs. Pixeles

*   **Gráficos Vectoriales (PDF, EPS, SVG):** Son fórmulas matemáticas. Se pueden escalar infinitamente sin perder calidad. **Úsalos siempre para gráficos generados por computadora (Excel, Python, R, Illustrator).**
*   **Gráficos de Mapa de Bits (JPG, PNG):** Son rejillas de pixeles. Si los agrandas, se ven borrosos ("pixelados"). **Úsalos solo para fotografías o capturas de pantalla.**

### Recomendaciones por Tipo de Contenido

| Tipo de Imagen | Formato Recomendado | Resolución Mínima | Herramienta de Origen |
| :--- | :--- | :--- | :--- |
| **Gráficos de datos** (Barras, Líneas, Pastel) | **PDF** (Vectorial) | N/A (Infinito) | Excel ("Guardar como PDF"), Python (Matplotlib `savefig('plot.pdf')`), R |
| **Diagramas y Esquemas** | **PDF** o **EPS** | N/A (Infinito) | Adobe Illustrator, Inkscape, Visio ("Exportar a PDF") |
| **Fotografías** | **JPG** (Alta calidad) | 300 DPI | Cámara, Stock Photos |
| **Capturas de Pantalla** (Software, Web) | **PNG** | 72-96 DPI (Nativo) | Recortes de Windows, Snagit |
| **Logotipos** | **PDF** o **EPS** | N/A (Infinito) | Archivos oficiales de identidad gráfica |

### Cómo Exportar Gráficos Correctamente

#### Desde Excel
1.  Selecciona tu gráfico.
2.  Ve a `Archivo > Guardar como`.
3.  Elige formato **PDF**.
4.  Usa `\includegraphics{grafico.pdf}` en LaTeX.

#### Desde Python (Matplotlib/Seaborn)
```python
plt.savefig('mi_grafico.pdf', bbox_inches='tight')
```

#### Desde R (ggplot2)
```r
ggsave("mi_grafico.pdf", width = 10, height = 6)
```

### Problemas Comunes y Soluciones

*   **"Mi imagen se ve borrosa":** Probablemente estás usando un JPG de baja resolución o tomaste una captura de pantalla de un gráfico en lugar de exportarlo.
*   **"El archivo PDF pesa demasiado":** Revisa si tienes imágenes PNG/JPG innecesariamente grandes (ej. 4000px de ancho para una imagen pequeña).
*   **"Los colores se ven diferentes":** Asegúrate de que tus imágenes estén en modo de color **RGB** para pantalla o **CMYK** para impresión profesional. LaTeX maneja ambos, pero la mezcla puede variar.

