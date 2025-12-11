# Sistema de Accesibilidad PDF/UA para SENER 2025

## 📋 Índice

1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Configuración](#configuración)
4. [Uso](#uso)
5. [Validación](#validación)
6. [Solución de Problemas](#solución-de-problemas)

---

## 🎯 Introducción

Este sistema implementa **accesibilidad universal (PDF/UA)** en documentos LaTeX generados desde Google Sheets, cumpliendo con estándares internacionales de accesibilidad para personas con discapacidad.

### Características Principales

- ✅ **Paquete axessibility**: Etiquetado semántico automático
- ✅ **Metadatos PDF/UA completos**: Título, autor, tema, palabras clave, idioma
- ✅ **Textos alternativos**: Todas las figuras tienen descripción accesible
- ✅ **Estructura jerárquica**: Navegación clara con secciones y subsecciones
- ✅ **Enlaces accesibles**: URLs con color y descripción
- ✅ **Tablas etiquetadas**: Captions descriptivos en todas las tablas
- ✅ **Idioma declarado**: Español de México (es-MX)

---

## 🏗️ Arquitectura del Sistema

### Componentes

```
┌─────────────────────────────────────────────────────────────┐
│  GOOGLE SHEETS (Datos)                                      │
│  - Documentos, Secciones, Figuras, Tablas, Bibliografía    │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  GOOGLE APPS SCRIPT (Generación)                           │
│  - google_apps_script_FINAL.js                             │
│  - Genera .tex con metadatos PDF/UA                        │
│  - Agrega textos alternativos a figuras                    │
│  - Configura hyperref para accesibilidad                   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  ARCHIVO .TEX (Documento LaTeX)                            │
│  - InformeEnergia25.tex                                    │
│  - Incluye: \usepackage{axessibility}                      │
│  - Metadatos en \hypersetup{}                              │
│  - \pdftooltip en figuras                                  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  VALIDACIÓN (Opcional)                                      │
│  - validar-accesibilidad-tex.ps1                           │
│  - Verifica paquetes, metadatos, textos alt.               │
│  - Genera reporte de puntuación                            │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  COMPILACIÓN                                                │
│  - compilar-pdf-accesible.ps1                              │
│  - XeLaTeX con 3 pasadas                                   │
│  - Genera reporte de accesibilidad                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  PDF ACCESIBLE (Salida)                                    │
│  - InformeEnergia25.pdf                                    │
│  - Cumple estándares PDF/UA                                │
│  - Navegable con lectores de pantalla                      │
└─────────────────────────────────────────────────────────────┘
```

### Archivos del Sistema

| Archivo | Propósito |
|---------|-----------|
| `sener2025.cls` | Clase LaTeX con paquetes de accesibilidad |
| `google_apps_script_FINAL.js` | Generador de .tex con metadatos PDF/UA |
| `compilar-pdf-accesible.ps1` | Script de compilación con validación |
| `validar-accesibilidad-tex.ps1` | Validador de estructura accesible |
| `ACCESIBILIDAD-SENER.md` | Esta documentación |

---

## ⚙️ Configuración

### 1. Clase LaTeX (sener2025.cls)

La clase ya incluye los paquetes necesarios:

```latex
% Paquetes de accesibilidad
\RequirePackage{axessibility}
\RequirePackage[pdfa,pdfusetitle]{hyperref}
\RequirePackage{pdfcomment}

% Configuración de hyperref
\hypersetup{
  colorlinks=true,
  linkcolor=gobmxGuinda,
  urlcolor=gobmxDorado,
  pdflang={es-MX},
  unicode=true
}
```

### 2. Google Apps Script

El script genera automáticamente:

```javascript
// Metadatos PDF/UA
tex += `\\hypersetup{\n`;
tex += `  pdftitle={${escaparLatex(datosDoc['Titulo'])}},\n`;
tex += `  pdfauthor={${escaparLatex(datosDoc['Autor'])}},\n`;
tex += `  pdfsubject={${escaparLatex(datosDoc['Subtitulo'])}},\n`;
tex += `  pdfkeywords={${escaparLatex(datosDoc['PalabrasClave'])}}\n`;
tex += `}\n\n`;

// Textos alternativos en figuras
tex += `\\pdftooltip{\\includegraphics[width=0.8\\textwidth]{${ruta}}}{${textoAlt}}\n`;
```

### 3. Estructura de Google Sheets

Agregar columna **TextoAlternativo** en la hoja "Figuras":

| DocumentoID | SeccionOrden | OrdenFigura | RutaArchivo | Caption | **TextoAlternativo** | Fuente |
|-------------|--------------|-------------|-------------|---------|---------------------|--------|
| 1 | 2.1 | 1 | img/graf1.png | Gráfica consumo | Gráfica de barras que muestra... | SENER 2024 |

---

## 🚀 Uso

### Flujo Completo

#### 1. Generar .tex desde Google Sheets

```
1. Abre tu Google Sheet
2. Menú: 📄 SENER LaTeX > ✨ Generar .tex de este documento
3. Descarga el archivo .tex generado
4. Colócalo en: C:\Proyectos\40.-PlantillasLatex\
```

#### 2. Validar Accesibilidad (Opcional)

```powershell
.\validar-accesibilidad-tex.ps1 -TexFile InformeEnergia25.tex
```

**Salida esperada:**
```
✓ axessibility encontrado
✓ hyperref encontrado
✓ pdftitle configurado
✓ pdfauthor configurado
Total de figuras: 15
✓ Todas las figuras tienen metadatos adecuados

PUNTUACIÓN DE ACCESIBILIDAD: 95/100
🏆 ¡Excelente! El documento tiene alta accesibilidad
```

#### 3. Compilar PDF Accesible

```powershell
.\compilar-pdf-accesible.ps1
```

**El script:**
- ✅ Valida paquetes de accesibilidad
- ✅ Verifica metadatos PDF/UA
- ✅ Compila con XeLaTeX (3 pasadas)
- ✅ Procesa bibliografía con Biber
- ✅ Genera reporte de accesibilidad
- ✅ Crea PDF con etiquetado semántico

#### 4. Verificar PDF Generado

**Opción A: Adobe Acrobat Pro**
```
1. Abrir InformeEnergia25.pdf
2. Herramientas > Accesibilidad > Verificación de accesibilidad completa
3. Marcar: "PDF/UA"
4. Ejecutar verificación
5. Revisar resultados
```

**Opción B: PAC (PDF Accessibility Checker)**
```
1. Descargar PAC desde: https://pdfua.foundation/
2. Abrir InformeEnergia25.pdf en PAC
3. Ejecutar verificación automática
4. Revisar errores y advertencias
```

---

## ✅ Validación

### Checklist de Accesibilidad

Use esta lista para verificar manualmente:

- [ ] **Metadatos PDF**
  - [ ] Título del documento (`pdftitle`)
  - [ ] Autor (`pdfauthor`)
  - [ ] Tema/asunto (`pdfsubject`)
  - [ ] Palabras clave (`pdfkeywords`)
  - [ ] Idioma (`pdflang=es-MX`)

- [ ] **Figuras**
  - [ ] Todas tienen `\caption{...}`
  - [ ] Todas tienen `\pdftooltip{...}{texto alternativo}`
  - [ ] Todas tienen `\label{fig:...}` para referencias

- [ ] **Tablas**
  - [ ] Todas tienen `\caption{...}`
  - [ ] Encabezados claros en primera fila
  - [ ] Uso de `\toprule`, `\midrule`, `\bottomrule`

- [ ] **Estructura**
  - [ ] Hay `\tableofcontents`
  - [ ] Secciones con `\section{}`, `\subsection{}`, etc.
  - [ ] Jerarquía lógica (no saltar niveles)

- [ ] **Enlaces**
  - [ ] URLs con `\url{...}` o `\href{...}{...}`
  - [ ] Colores accesibles (contraste adecuado)
  - [ ] Hyperref configurado

- [ ] **Compilación**
  - [ ] Compilado con XeLaTeX (no pdfLaTeX)
  - [ ] Sin errores en el log
  - [ ] PDF generado correctamente

### Criterios de Puntuación

| Puntuación | Nivel | Descripción |
|------------|-------|-------------|
| 90-100 | 🏆 Excelente | Cumple todos los estándares PDF/UA |
| 70-89 | 👍 Bien | Algunos detalles menores |
| 50-69 | ⚠️ Regular | Requiere mejoras importantes |
| 0-49 | ❌ Deficiente | No cumple accesibilidad básica |

---

## 🔧 Solución de Problemas

### Problema: "axessibility no encontrado"

**Síntoma:**
```
! LaTeX Error: File `axessibility.sty' not found.
```

**Solución:**
```powershell
# Actualizar MiKTeX
miktex update

# Instalar paquete manualmente
miktex packages install axessibility
```

### Problema: "Figuras sin texto alternativo"

**Síntoma:**
```
✗ Figura sin texto alternativo (\pdftooltip)
```

**Solución:**

1. Agregar columna `TextoAlternativo` en Google Sheets (hoja Figuras)
2. Llenar con descripciones detalladas:
   ```
   Gráfica de barras verticales que muestra el consumo energético mensual de 2024, 
   con valores entre 500 y 1200 GWh. Enero tiene el pico más alto con 1150 GWh.
   ```
3. Regenerar .tex desde Apps Script
4. Recompilar

### Problema: "PDF sin metadatos"

**Síntoma:**
Al abrir Propiedades del PDF, título aparece como "InformeEnergia25.pdf"

**Solución:**

Verificar que el .tex tenga:
```latex
\hypersetup{
  pdftitle={Título del Documento},
  pdfauthor={Autor},
  pdfsubject={Tema},
  pdfkeywords={palabra1, palabra2}
}
```

Si falta, ejecutar:
```powershell
.\validar-accesibilidad-tex.ps1 -TexFile InformeEnergia25.tex -AutoFix
```

### Problema: "Errores en compilación"

**Síntoma:**
```
! Emergency stop.
```

**Solución:**

1. Revisar log:
   ```powershell
   Get-Content InformeEnergia25.log | Select-String "Error"
   ```

2. Problemas comunes:
   - **Imagen no encontrada**: Verificar ruta en `\includegraphics{...}`
   - **Caracteres especiales**: Asegurarse de usar `escaparLatex()` en Apps Script
   - **Bibliografía faltante**: Verificar que exista `referencias.bib`

3. Limpiar auxiliares y reintentar:
   ```powershell
   Remove-Item *.aux, *.log, *.out, *.toc
   .\compilar-pdf-accesible.ps1
   ```

### Problema: "Adobe Acrobat reporta errores"

**Síntoma:**
Verificación de accesibilidad muestra 100+ errores

**Realidad:**
LaTeX + axessibility genera **estructura básica**, pero PDF/UA completo requiere:

1. **Ajustes manuales en Acrobat Pro**
   - Herramientas > Accesibilidad > Agregar etiquetas al documento
   - Orden de lectura
   - Texto alternativo adicional

2. **Limitaciones de LaTeX**
   - No puede generar 100% PDF/UA automáticamente
   - axessibility ayuda, pero no es certificación completa
   - Para certificación oficial: proceso manual en Adobe

**Alternativa:**
Para documentos internos, el PDF generado es **suficientemente accesible** para:
- ✅ Lectores de pantalla básicos
- ✅ Navegación con teclado
- ✅ Zoom sin perder contenido
- ✅ Búsqueda de texto

---

## 📚 Referencias

### Estándares

- **PDF/UA**: ISO 14289-1:2014 (PDF/Universal Accessibility)
- **WCAG 2.1**: Web Content Accessibility Guidelines
- **Section 508**: US Accessibility Standards

### Documentación

- [axessibility package (CTAN)](https://ctan.org/pkg/axessibility)
- [Hyperref package (CTAN)](https://ctan.org/pkg/hyperref)
- [PDF Accessibility Checker PAC](https://pdfua.foundation/)
- [Adobe Acrobat Accessibility](https://www.adobe.com/accessibility/pdf.html)

### Herramientas

| Herramienta | Propósito | Enlace |
|-------------|-----------|--------|
| MiKTeX | Distribución LaTeX | https://miktex.org/ |
| PAC 2024 | Validador PDF/UA | https://pdfua.foundation/ |
| Adobe Acrobat Pro | Certificación PDF/UA | https://adobe.com/ |
| NVDA | Lector de pantalla | https://www.nvaccess.org/ |

---

## 💡 Mejores Prácticas

### Para Textos Alternativos

✅ **Bueno:**
```
Gráfica de líneas que muestra la tendencia de consumo eléctrico residencial 
en México de 2020 a 2024. La línea inicia en 45 TWh en enero 2020 y 
termina en 52 TWh en diciembre 2024, con una pendiente ascendente constante.
```

❌ **Malo:**
```
Gráfica
```

### Para Captions

✅ **Bueno:**
```latex
\caption{Consumo eléctrico residencial en México (2020-2024) por sector geográfico}
```

❌ **Malo:**
```latex
\caption{Gráfica 1}
```

### Para Estructura

✅ **Bueno:**
```latex
\section{Introducción}
  \subsection{Contexto}
  \subsection{Objetivos}
\section{Metodología}
  \subsection{Recopilación de datos}
```

❌ **Malo:**
```latex
\section{Introducción}
  \subsubsection{Algo} % ← Saltó \subsection
```

---

## 🎓 Capacitación

### Para Editores de Contenido

1. **Agregar columna TextoAlternativo en Figuras**
2. **Escribir descripciones detalladas** (50-200 palabras)
3. **Verificar que Caption sea descriptivo**
4. **Incluir palabras clave relevantes**

### Para Desarrolladores

1. **Mantener actualizado Apps Script**
2. **Verificar que `escaparLatex()` funcione correctamente**
3. **Agregar validaciones antes de generar .tex**
4. **Documentar cambios en la estructura**

### Para Compiladores

1. **Usar siempre XeLaTeX** (no pdfLaTeX)
2. **Ejecutar validación antes de compilar**
3. **Revisar log de errores**
4. **Verificar PDF con PAC o Acrobat**

---

## 📞 Soporte

Para problemas o dudas:

1. Revisar esta documentación
2. Ejecutar `validar-accesibilidad-tex.ps1` para diagnóstico
3. Revisar log de compilación: `InformeEnergia25.log`
4. Contactar al equipo de desarrollo

---

**Última actualización:** Diciembre 2025  
**Versión:** 1.0  
**Autor:** SENER - Secretaría de Energía
