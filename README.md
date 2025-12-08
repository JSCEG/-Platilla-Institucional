# Plantilla Institucional SENER 2025

Plantilla LaTeX oficial para documentos de la Secretaría de Energía de México, con identidad gráfica institucional y herramientas profesionales para publicación.

## ✨ Características Principales

✅ **Diseño institucional** con colores y logos oficiales del Gobierno de México  
✅ **5 estilos de tablas profesionales** con encabezados de color y filas alternadas  
✅ **Bibliografía en formato APA** con ejemplos completos de todos los tipos de fuentes  
✅ **Recuadros especializados** (resumen ejecutivo, datos clave, notas importantes, definiciones)  
✅ **Tipografías institucionales** (Patria y Noto Sans)  
✅ **Portada y contraportada** personalizables  
✅ **Índices automáticos** de contenido, tablas y figuras  
✅ **Metadatos PDF** para publicación en portal web  

## 📁 Estructura del Proyecto

### Documentos LaTeX
*   `sener2025.cls`: Clase LaTeX con estilos institucionales
*   `template-institucional.tex`: Ejemplo completo
*   `InformeEnergia25.tex`: Documento institucional listo para compilar
*   `referencias.bib`: Base de datos bibliográfica
*   `GUIA_USO_TEMPLATE.md`: Documentación técnica

### Recursos Web
*   `css/style.css`: Hoja de estilos

### Recursos Gráficos
*   **`tipografias/`**: Fuentes institucionales (Patria y Noto Sans)
*   **`img/`**: Logotipos oficiales (SENER, Gobierno de México)

## 🚀 Inicio Rápido

### Compilación de Documentos

```powershell
# VS Code: receta latexmk (xelatex)
# PowerShell: script de compilación
./scripts/build.ps1 -Doc InformeEnergia25.tex
./scripts/build.ps1 -All

# Manual
latexmk -xelatex InformeEnergia25.tex
latexmk -xelatex template-institucional.tex
```

### Estructura Básica de un Documento

```latex
%!TEX TS-program = xelatex
\documentclass{sener2025}

\title{Título del Documento}
\subtitle{Subtítulo descriptivo}
\author{Unidad de Planeación Energética}
\date{Noviembre 2025}
\setDocumentoCorto{Nombre corto para encabezados}
\palabrasclave{energía, renovables, planeación}

\begin{document}

% Opción 1: Portada estándar (fondo blanco)
\maketitle

% Opción 2: Portada con fondo guinda (más impactante)
% \portadafondo

\tableofcontents

\section{Introducción}
Contenido del documento...

\printbibliography
\end{document}
```

### Tipos de Portada

**Portada estándar:** `\maketitle` - Fondo blanco, ideal para documentos técnicos  
**Portada con fondo:** `\portadafondo` - Fondo guinda si existe `img/portada.png`

## 📊 Estilos de Tablas

### Tabla Guinda (datos generales)
```latex
\begin{tablaguinda}
  \caption{Capacidad instalada por región}
  \begin{tabular}{lrr}
    \toprule
    \encabezadoguinda{Región} & \encabezadoguinda{Capacidad (MW)} \\
    \midrule
    Norte & 5,200 \\
    Centro & 8,500 \\
    \bottomrule
  \end{tabular}
\end{tablaguinda}
```

### Otros Estilos Disponibles
- `\begin{tablaverde}` + `\encabezadoverde{}` - Para proyectos ambientales/renovables
- `\begin{tabladorado}` + `\encabezadodorado{}` - Para inversiones/presupuesto
- `\begin{tablagris}` + `\encabezadogris{}` - Para datos técnicos neutrales
- `\begin{tablalimpia}` - Sin filas alternadas (formal)

## 📚 Citas y Referencias (Formato APA)

### Tipos de Citas

```latex
% Cita en paréntesis (más común)
El sector ha crecido significativamente \autocite{sener2024}.
% Resultado: (SENER, 2024)

% Cita integrada en el texto
Según \textcite{sener2024}, el crecimiento es sostenido.
% Resultado: SENER (2024)

% Múltiples citas
Diversos estudios lo confirman \autocite{autor1,autor2,autor3}.
% Resultado: (Autor1, 2023; Autor2, 2024; Autor3, 2022)
```

### Tipos de Fuentes en `referencias.bib`

El archivo incluye ejemplos de:
- 📖 Libros y capítulos de libro
- 📄 Artículos de revista (con y sin DOI)
- 📊 Reportes técnicos e informes gubernamentales
- 🌐 Páginas web y recursos en línea
- 🎓 Tesis (doctorado y maestría)
- 🎤 Conferencias y proceedings
- ⚖️ Leyes y normas oficiales
- 🎥 Videos y multimedia
- 💾 Bases de datos

## 🎨 Recuadros Especiales

```latex
% Resumen ejecutivo (para inicio de documentos)
\begin{resumenejecutivo}
Puntos clave del documento...
\end{resumenejecutivo}

% Datos clave (cifras importantes)
\begin{datosclave}
\item \textbf{Capacidad:} \highlight{55,770 MW}
\item \textbf{Inversión:} \highlight{\$435,500 MDP}
\end{datosclave}

% Nota importante (advertencias)
\begin{notaimportante}
Información crítica que el lector debe considerar.
\end{notaimportante}

% Definición (términos técnicos)
\begin{definicion}
\textbf{SEN:} Sistema Eléctrico Nacional...
\end{definicion}

% Ejemplo (casos prácticos)
\begin{ejemplo}
Cálculo de capacidad instalada: C = ...
\end{ejemplo}
```

## 🎨 Colores Institucionales

| Color | Código | Uso Recomendado |
|-------|--------|-----------------|
| **Guinda** | `#691B32` | Títulos principales, datos generales |
| **Verde** | `#006B5C` | Subtítulos, proyectos ambientales |
| **Dorado** | `#C99700` | Acentos, inversiones/presupuesto |
| **Gris** | `#6C6C6C` | Texto secundario, datos técnicos |
| **Gris Claro** | `#F5F5F5` | Fondos, filas alternadas |

## 📋 Requisitos del Sistema

### Software Necesario
*   **LaTeX:** TeX Live 2023+ o MiKTeX 2023+
*   **Compilador:** XeLaTeX o LuaLaTeX (⚠️ NO usar pdfLaTeX)
*   **Bibliografía:** Biber (incluido en distribuciones modernas)

### Paquetes LaTeX Requeridos
- biblatex-apa (bibliografía formato APA)
- booktabs (tablas profesionales)
- tcolorbox (recuadros)
- colortbl (colores en tablas)
- hyperref (enlaces y metadatos PDF)
- fontspec (tipografías personalizadas)

### Tipografías
*   **Patria** (títulos y encabezados) - Incluida en `tipografias/`
*   **Noto Sans** (cuerpo de texto) - Incluida en `tipografias/`

## 📖 Documentación

- **`GUIA_USO_TEMPLATE.md`** - Guía técnica completa con todos los comandos
- **`ejemplo-tablas-profesionales.tex`** - Ejemplos de todos los estilos de tablas
- **`ejemplo-citas-bibliografia.tex`** - Guía completa de citas APA
- **`template-institucional.tex`** - Documento de ejemplo con todas las funcionalidades

## 🌐 Desarrollo Web

`css/style.css` contiene tokens de diseño básicos.

## 📝 Ejemplos de Uso

```powershell
./scripts/build.ps1 -Doc template-institucional.tex
```

## 🆘 Solución de Problemas

**Error: "File ended while scanning use of..."**
- Verifica que todas las llaves `{}` estén balanceadas
- Asegúrate de compilar con XeLaTeX, no pdfLaTeX

**Las citas no aparecen**
- Ejecuta `biber documento` después del primer `xelatex`
- Verifica que las claves en `\autocite{}` existan en `referencias.bib`

**Las fuentes no se ven correctamente**
- Confirma que estás usando XeLaTeX o LuaLaTeX
- Verifica que las fuentes estén en la carpeta `tipografias/`

---

**Secretaría de Energía - Gobierno de México**  
Versión 1.0 - Noviembre 2025

Para soporte técnico o sugerencias, consulte la documentación completa en `GUIA_USO_TEMPLATE.md`

# -Platilla-Institucional
