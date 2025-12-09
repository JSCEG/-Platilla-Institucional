# Instrucciones para generar PDF con etiquetas de accesibilidad

## ¿Qué se ha configurado?

Tu plantilla LaTeX ya tiene soporte para PDF/UA (accesibilidad), pero necesitas compilar con **LuaLaTeX** en lugar de XeLaTeX.

## Cambios realizados:

1. **`.latexmkrc`** - Actualizado para usar LuaLaTeX por defecto
2. **`InformeEnergia25.xmpdata`** - Metadatos XMP para PDF/A-3u
3. **`compilar_accesible.bat`** - Script de compilación con todas las pasadas necesarias

## Cómo compilar:

### Opción 1: Usar el script (Recomendado)
```cmd
compilar_accesible.bat
```

### Opción 2: Usar latexmk
```cmd
latexmk -lualatex InformeEnergia25.tex
```

### Opción 3: Compilación manual
```cmd
lualatex InformeEnergia25.tex
biber InformeEnergia25
lualatex InformeEnergia25.tex
lualatex InformeEnergia25.tex
```

## Verificar accesibilidad en Adobe Acrobat:

1. Abre el PDF generado en Adobe Acrobat Pro
2. Ve a **Herramientas** > **Accesibilidad** > **Verificación completa**
3. O usa **Herramientas** > **Accesibilidad** > **Comprobar accesibilidad**

## Agregar etiquetas manualmente (si es necesario):

Si el PDF no tiene todas las etiquetas, puedes:

1. **Avanzadas** > **Accesibilidad** > **Agregar etiquetas al documento**
2. **Avanzadas** > **Accesibilidad** > **Herramienta Retocar orden de lectura**
3. Crear el árbol de etiquetas manualmente con el panel **Etiquetas**

## Elementos ya configurados en tu plantilla:

- ✅ Metadatos del documento (título, autor, palabras clave)
- ✅ Idioma del documento (es-MX)
- ✅ Texto alternativo para imágenes (usando `\BeginAccSupp` y `\EndAccSupp`)
- ✅ Estructura de encabezados jerárquica
- ✅ Soporte para PDF/A-3u
- ✅ Configuración de hyperref para accesibilidad

## Notas importantes:

- **LuaLaTeX** es necesario para generar las etiquetas automáticamente
- XeLaTeX no soporta completamente la generación de etiquetas PDF/UA
- El paquete `pdfmanagement-testphase` solo funciona con LuaLaTeX
- Asegúrate de tener una distribución TeX actualizada (TeX Live 2023 o posterior)

## Solución de problemas:

### Si obtienes errores de compilación:
1. Verifica que tienes LuaLaTeX instalado: `lualatex --version`
2. Actualiza tu distribución TeX
3. Limpia archivos auxiliares: `del *.aux *.log *.out *.toc`

### Si el PDF no tiene etiquetas:
1. Verifica que compilaste con LuaLaTeX (no XeLaTeX)
2. Revisa el log de compilación en busca de advertencias
3. Usa Adobe Acrobat para agregar etiquetas manualmente

## Recursos adicionales:

- [PDF/UA Standard](https://www.pdfa.org/pdfua-the-iso-standard-for-universal-accessibility/)
- [LaTeX Accessibility](https://www.latex-project.org/publications/indexbytopic/pdf/)
- [pdfmanagement Documentation](https://ctan.org/pkg/pdfmanagement-testphase)
