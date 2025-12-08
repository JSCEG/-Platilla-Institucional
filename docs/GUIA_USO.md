# Guía de Uso de la Plantilla Institucional SENER 2025

Esta plantilla LaTeX (`sener2025.cls`) está diseñada para generar documentos oficiales con la identidad gráfica de la Secretaría de Energía.

## 1. Requisitos Previos
Asegúrate de tener instalada una distribución de LaTeX (como TeX Live o MiKTeX) y el compilador **XeLaTeX**, ya que es necesario para manejar las fuentes institucionales (Patria, Noto Sans).

## 2. Archivos Necesarios
Para crear un nuevo documento, necesitas tener en la misma carpeta:
*   `sener2025.cls`: El archivo de definición de la clase (NO modificar).
*   `img/`: La carpeta con las imágenes base (logos, fondos, plecas).
*   `tipografias/`: La carpeta con las fuentes (Patria, Noto Sans).

## 3. Pasos para Crear un Nuevo Documento

### Opción A: Usar el archivo base
1.  Copia el archivo `nuevo-documento.tex` y renómbralo (ej. `Reporte_Mensual.tex`).
2.  Abre el archivo en tu editor LaTeX favorito (VS Code, TeXShop, Overleaf local).
3.  Edita los datos del documento en el preámbulo:
    ```latex
    \title{Tu Título}
    \subtitle{Tu Subtítulo}
    \date{Fecha}
    ```
4.  Escribe tu contenido entre `\begin{document}` y `\end{document}`.
5.  **Compila usando XeLaTeX**.

### Opción B: Desde cero
Crea un archivo `.tex` nuevo con la siguiente estructura mínima:

```latex
\documentclass{sener2025}

\title{Título}
\institucion{Secretaría de Energía}

\begin{document}
\maketitle

\section{Tu Contenido}
Texto...

\contraportada{Datos de contacto...}
\end{document}
```

## 4. Elementos Clave

*   **Secciones:** Usa `\portadaseccion{Número}{Título}{Subtítulo}` para iniciar capítulos con la portada roja.
*   **Figuras:** Usa el entorno `figure` estándar. El estilo de los *captions* ya está configurado automáticamente.
*   **Tablas:** Usa `tabladorado`, `tablaguinda`, etc., para tablas con colores institucionales.
*   **Citas:** Usa `\textcite{clave}` o `\footcite{clave}`.

## 5. Solución de Problemas
*   **Error de fuentes:** Verifica que la carpeta `tipografias/` esté junto a tu archivo `.tex`.
*   **Error de compilación:** Asegúrate de estar usando **XeLaTeX** y no pdfLaTeX.
