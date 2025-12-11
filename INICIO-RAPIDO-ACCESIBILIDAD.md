# 🚀 SISTEMA DE ACCESIBILIDAD PDF/UA - GUÍA RÁPIDA

## ✅ LO QUE SE HA IMPLEMENTADO

### 1. **Clase LaTeX Mejorada** (`sener2025.cls`)
```latex
✓ Paquete axessibility (etiquetado semántico automático)
✓ Hyperref con configuración PDF/UA
✓ Pdfcomment para textos alternativos
✓ Metadatos: idioma, colores accesibles, navegación
```

### 2. **Generador Apps Script Actualizado** (`google_apps_script_FINAL.js`)
```javascript
✓ Función generarFechaPDF() para metadatos temporales
✓ Metadatos PDF/UA en \hypersetup{}:
  - pdftitle (título del documento)
  - pdfauthor (autor)
  - pdfsubject (tema)
  - pdfkeywords (palabras clave)
  - pdfcreationdate (fecha de creación)
  
✓ Textos alternativos en figuras:
  - Campo TextoAlternativo en Google Sheets
  - \pdftooltip{imagen}{texto descriptivo}
  - \label{fig:...} para referencias cruzadas
```

### 3. **Scripts de Compilación y Validación**

#### `compilar-pdf-accesible.ps1`
```powershell
✓ Valida paquetes de accesibilidad
✓ Verifica metadatos PDF/UA
✓ Compila con XeLaTeX (3 pasadas)
✓ Procesa bibliografía con Biber
✓ Genera reporte de accesibilidad
✓ Limpia archivos auxiliares
```

#### `validar-accesibilidad-tex.ps1`
```powershell
✓ Analiza estructura del .tex
✓ Detecta figuras sin texto alternativo
✓ Verifica metadatos
✓ Puntúa accesibilidad (0-100)
✓ Genera reporte detallado
✓ Modo AutoFix para correcciones automáticas
```

### 4. **Documentación Completa** (`ACCESIBILIDAD-SENER.md`)
```markdown
✓ Arquitectura del sistema
✓ Guía de configuración
✓ Flujo de trabajo completo
✓ Checklist de validación
✓ Solución de problemas
✓ Mejores prácticas
```

---

## 📋 FLUJO DE TRABAJO

### **PASO 1: Preparar Datos en Google Sheets**

Agregar columna **TextoAlternativo** en hoja "Figuras":

| Caption | **TextoAlternativo** |
|---------|---------------------|
| Consumo 2024 | Gráfica de barras que muestra el consumo energético mensual... |

### **PASO 2: Generar .tex desde Google Sheets**

```
1. Copiar código de google_apps_script_FINAL.js a Apps Script
2. Menú: 📄 SENER LaTeX > ✨ Generar .tex
3. Descargar archivo .tex generado
4. Colocar en carpeta del proyecto
```

El .tex generado incluirá automáticamente:
```latex
\hypersetup{
  pdftitle={Tu Título},
  pdfauthor={Tu Autor},
  pdfsubject={Tu Tema},
  pdfkeywords={tus, palabras, clave},
  pdfcreationdate={D:20251210...}
}

% En cada figura:
\pdftooltip{\includegraphics{...}}{Descripción accesible}
\caption{Título visible}
\label{fig:nombre}
```

### **PASO 3: Validar Accesibilidad (Opcional)**

```powershell
.\validar-accesibilidad-tex.ps1 -TexFile InformeEnergia25.tex
```

**Resultado esperado:**
```
✓ axessibility encontrado (desde sener2025.cls)
✓ hyperref encontrado
✓ Todas las figuras tienen metadatos
PUNTUACIÓN: 95/100 🏆
```

### **PASO 4: Compilar PDF Accesible**

```powershell
.\compilar-pdf-accesible.ps1
```

**El script ejecuta:**
```
1. Validación de paquetes ✓
2. Limpieza de auxiliares ✓
3. XeLaTeX (1era pasada) ✓
4. Biber (bibliografía) ✓
5. XeLaTeX (2da pasada) ✓
6. XeLaTeX (3era pasada) ✓
7. Reporte de accesibilidad ✓
```

**Salida:**
- `InformeEnergia25.pdf` (PDF accesible)
- `InformeEnergia25-reporte-accesibilidad.txt` (reporte)

### **PASO 5: Verificar PDF**

**Opción A: Adobe Acrobat Pro**
```
Herramientas > Accesibilidad > Verificación completa
Marcar: "PDF/UA"
Ejecutar
```

**Opción B: PAC 2024**
```
https://pdfua.foundation/
Abrir PDF > Ejecutar verificación
```

---

## 🎯 EJEMPLO COMPLETO

### Entrada: Google Sheets

**Hoja Documentos:**
| ID | Titulo | Autor | PalabrasClave |
|----|--------|-------|---------------|
| 1 | Informe 2024 | SENER | energía, México, consumo |

**Hoja Figuras:**
| DocumentoID | Caption | TextoAlternativo |
|-------------|---------|------------------|
| 1 | Consumo mensual | Gráfica de barras verticales mostrando consumo de energía eléctrica mensual en México durante 2024. Enero: 500 GWh, Febrero: 520 GWh... |

### Salida: .tex Generado

```latex
\documentclass{sener2025}

% Metadatos PDF/UA
\hypersetup{
  pdftitle={Informe 2024},
  pdfauthor={SENER},
  pdfsubject={Informe 2024},
  pdfkeywords={energía, México, consumo},
  pdfcreationdate={D:20251210143022}
}

\begin{document}
% ...

\begin{figure}[H]
  \centering
  \pdftooltip{\includegraphics[width=0.8\textwidth]{img/consumo.png}}{Gráfica de barras verticales mostrando consumo de energía eléctrica mensual en México durante 2024. Enero: 500 GWh, Febrero: 520 GWh...}
  \caption{Consumo mensual}
  \label{fig:consumo_mensual}
\end{figure}

% ...
\end{document}
```

### Resultado: PDF Accesible

```
✓ Metadatos completos (título, autor, tema, palabras clave)
✓ Idioma declarado (es-MX)
✓ Figuras con texto alternativo
✓ Estructura jerárquica (secciones)
✓ Enlaces con colores accesibles
✓ Navegación con bookmarks
✓ Compatible con lectores de pantalla
```

---

## ⚠️ IMPORTANTE: Limitaciones de LaTeX

### Lo que LaTeX + axessibility SÍ hace:
✅ Estructura semántica básica  
✅ Metadatos PDF completos  
✅ Textos alternativos en figuras  
✅ Enlaces accesibles  
✅ Idioma declarado  
✅ Navegación con bookmarks  

### Lo que LaTeX NO puede hacer (requiere Acrobat Pro):
❌ Certificación PDF/UA oficial al 100%  
❌ Orden de lectura perfecto en layouts complejos  
❌ Etiquetado de elementos decorativos vs. contenido  
❌ Ajustes manuales de accesibilidad fina  

### Recomendación:

**Para documentos internos:** El PDF generado es suficiente  
**Para publicación oficial:** Requiere ajustes manuales en Adobe Acrobat Pro

---

## 📞 CHECKLIST FINAL

Antes de compilar, verificar:

- [ ] Google Sheets tiene columna **TextoAlternativo** en Figuras
- [ ] Todas las figuras tienen descripción detallada (50+ palabras)
- [ ] Metadatos completos en hoja Documentos (Titulo, Autor, PalabrasClave)
- [ ] Apps Script actualizado con código nuevo
- [ ] Clase `sener2025.cls` actualizada con paquetes de accesibilidad
- [ ] Scripts de compilación copiados a carpeta del proyecto

Para compilar:

```powershell
# 1. Validar (opcional)
.\validar-accesibilidad-tex.ps1 -TexFile InformeEnergia25.tex

# 2. Compilar
.\compilar-pdf-accesible.ps1

# 3. Verificar salida
# Revisar: InformeEnergia25.pdf
# Revisar: InformeEnergia25-reporte-accesibilidad.txt
```

---

## 🎓 RECURSOS

- **Documentación completa:** `ACCESIBILIDAD-SENER.md`
- **Validador PAC:** https://pdfua.foundation/
- **Adobe Accessibility:** https://www.adobe.com/accessibility/
- **axessibility docs:** https://ctan.org/pkg/axessibility

---

**¡El sistema está listo para generar PDFs accesibles!** 🎉

Siguiente paso: Ejecutar desde Google Sheets y compilar el primer PDF accesible.
