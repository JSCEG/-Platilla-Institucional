# 📦 ESTRUCTURA DE ENTREGA - SENER LaTeX

Este documento define qué archivos incluir en el paquete de distribución.

---

## ✅ Archivos ESENCIALES (Incluir siempre)

### 1. Sistema LaTeX
```
✓ sener2025.cls                    # Clase LaTeX con toda la plantilla
```

### 2. Script de Google Sheets
```
✓ google_apps_script_FINAL.js      # Script para generar .tex desde Sheets
```

### 3. Tipografías
```
✓ tipografias/
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

### 4. Carpetas de recursos
```
✓ image/                           # Portadas/contraportadas
  ├── portada_default.png
  └── contraportada_default.png

✓ img/                             # Figuras del documento (crear vacía)
  └── .gitkeep
```

### 5. Documentación
```
✓ GUIA_INSTALACION.md             # Guía completa de instalación
✓ ESTRUCTURA_ENTREGA.md           # Este archivo
✓ README.md                        # Descripción del proyecto
```

---

## 📚 Archivos RECOMENDADOS (Incluir si es posible)

### Ejemplos
```
✓ ejemplos/
  ├── ejemplo_completo.tex         # Ejemplo con todas las funcionalidades
  ├── ejemplo_simple.tex           # Ejemplo básico
  └── ejemplo_completo.pdf         # PDF compilado de ejemplo
```

### Plantillas base
```
✓ template-institucional.tex       # Plantilla base institucional
✓ referencias.bib                  # Ejemplo de bibliografía
```

---

## ❌ Archivos EXCLUIR (No incluir)

### Archivos de desarrollo
```
❌ .git/                           # Control de versiones Git
❌ .gitignore                      # Configuración Git
❌ .vscode/                        # Configuración VS Code
❌ .latexmkrc                      # Configuración latexmk
```

### Archivos web (ya no se usan)
```
❌ web/                            # Toda la carpeta web/
❌ css/                            # Estilos CSS
❌ scripts/                        # Scripts de desarrollo
```

### Archivos temporales y compilados
```
❌ *.aux                           # Archivos auxiliares LaTeX
❌ *.log                           # Logs de compilación
❌ *.toc                           # Tabla de contenidos temporal
❌ *.lof                           # Lista de figuras temporal
❌ *.lot                           # Lista de tablas temporal
❌ *.out                           # Salida temporal
❌ *.bbl                           # Bibliografía temporal
❌ *.blg                           # Log de bibliografía
❌ *.bcf                           # Archivo de control biblatex
❌ *.run.xml                       # Archivo de ejecución
❌ *.fdb_latexmk                   # Base de datos latexmk
❌ *.fls                           # Lista de archivos
❌ *.synctex.gz                    # Sincronización editor-PDF
❌ *.xdv                           # Salida XeTeX
```

### Documentación de desarrollo
```
❌ docs/                           # Documentación técnica
❌ back/                           # Respaldos de desarrollo
❌ temp/                           # Archivos temporales
❌ ACCESIBILIDAD-SENER.md
❌ CODIGO_PARA_GOOGLE_APPS_SCRIPT.txt
❌ compilar-*.ps1                  # Scripts de compilación
❌ compilar_accesible.bat
❌ crear-plantilla-word.ps1
❌ FLUJO-PUBLICACION-ACCESIBLE.md
❌ InformeEnergia25*.* (archivos compilados)
❌ INSTRUCCIONES_*.md
❌ LIMPIEZA_*.md
❌ MEJORAS_*.md
❌ PASOS_SOLUCION.md
❌ pdfa.xmpi
❌ README_PROYECTO.md
❌ SISTEMA_*.md
❌ SOLUCION_*.md
❌ validar-accesibilidad-tex.ps1
❌ verificar-script-gas.js
```

---

## 📦 Crear Paquete de Distribución

### Opción 1: Crear ZIP manualmente (Windows)

```powershell
# Crear carpeta temporal
New-Item -ItemType Directory -Path "C:\SENER_LaTeX_Distribucion" -Force

# Copiar archivos esenciales
Copy-Item "sener2025.cls" -Destination "C:\SENER_LaTeX_Distribucion\"
Copy-Item "google_apps_script_FINAL.js" -Destination "C:\SENER_LaTeX_Distribucion\"
Copy-Item "GUIA_INSTALACION.md" -Destination "C:\SENER_LaTeX_Distribucion\"
Copy-Item "README.md" -Destination "C:\SENER_LaTeX_Distribucion\"

# Copiar carpetas completas
Copy-Item "tipografias" -Destination "C:\SENER_LaTeX_Distribucion\" -Recurse
Copy-Item "image" -Destination "C:\SENER_LaTeX_Distribucion\" -Recurse
Copy-Item "ejemplos" -Destination "C:\SENER_LaTeX_Distribucion\" -Recurse

# Crear carpeta img vacía
New-Item -ItemType Directory -Path "C:\SENER_LaTeX_Distribucion\img" -Force

# Comprimir todo en ZIP
Compress-Archive -Path "C:\SENER_LaTeX_Distribucion\*" -DestinationPath "C:\SENER_LaTeX_v1.0.zip" -Force
```

### Opción 2: Script automático

Crear archivo `crear-paquete-distribucion.ps1`:

```powershell
# Script de empaquetado automático
$fecha = Get-Date -Format "yyyy-MM-dd"
$version = "1.0"
$nombrePaquete = "SENER_LaTeX_v${version}_${fecha}"
$carpetaTemporal = "C:\temp\$nombrePaquete"
$archivoZip = "C:\$nombrePaquete.zip"

# Crear carpeta temporal
Write-Host "Creando estructura de distribución..." -ForegroundColor Green
New-Item -ItemType Directory -Path $carpetaTemporal -Force | Out-Null

# Archivos individuales esenciales
$archivosEsenciales = @(
    "sener2025.cls",
    "google_apps_script_FINAL.js",
    "GUIA_INSTALACION.md",
    "ESTRUCTURA_ENTREGA.md",
    "README.md",
    "referencias.bib"
)

foreach ($archivo in $archivosEsenciales) {
    if (Test-Path $archivo) {
        Copy-Item $archivo -Destination $carpetaTemporal
        Write-Host "✓ $archivo" -ForegroundColor Cyan
    }
}

# Carpetas completas
$carpetas = @("tipografias", "image", "ejemplos")
foreach ($carpeta in $carpetas) {
    if (Test-Path $carpeta) {
        Copy-Item $carpeta -Destination $carpetaTemporal -Recurse
        Write-Host "✓ $carpeta/" -ForegroundColor Cyan
    }
}

# Crear carpeta img vacía
New-Item -ItemType Directory -Path "$carpetaTemporal\img" -Force | Out-Null
Write-Host "✓ img/ (vacía)" -ForegroundColor Cyan

# Crear archivo ZIP
Write-Host "`nCreando archivo ZIP..." -ForegroundColor Green
Compress-Archive -Path "$carpetaTemporal\*" -DestinationPath $archivoZip -Force

# Limpiar temporal
Remove-Item -Path $carpetaTemporal -Recurse -Force

# Resultado
Write-Host "`n✅ Paquete creado exitosamente:" -ForegroundColor Green
Write-Host "   $archivoZip" -ForegroundColor Yellow
Write-Host "`nContenido:" -ForegroundColor White
Expand-Archive -Path $archivoZip -DestinationPath "C:\temp\verificar_$nombrePaquete" -Force
Get-ChildItem -Path "C:\temp\verificar_$nombrePaquete" -Recurse -Name | ForEach-Object { Write-Host "   $_" }
Remove-Item -Path "C:\temp\verificar_$nombrePaquete" -Recurse -Force
```

Ejecutar:
```powershell
.\crear-paquete-distribucion.ps1
```

---

## 📊 Checklist de Verificación

Antes de entregar, verificar:

### ✅ Estructura de archivos
- [ ] `sener2025.cls` presente
- [ ] `google_apps_script_FINAL.js` presente
- [ ] Carpeta `tipografias/` con 14 archivos
- [ ] Carpetas `image/` e `img/` presentes
- [ ] `GUIA_INSTALACION.md` presente

### ✅ Funcionalidad
- [ ] Script de Google Sheets funciona (probado)
- [ ] Compilación con XeLaTeX exitosa
- [ ] Tipografías se cargan correctamente
- [ ] PDF generado tiene formato correcto

### ✅ Documentación
- [ ] Guía de instalación completa
- [ ] Ejemplos incluidos y funcionales
- [ ] README actualizado

### ✅ Limpieza
- [ ] Sin archivos `.aux`, `.log`, `.toc`
- [ ] Sin carpeta `web/`
- [ ] Sin carpeta `.git/`
- [ ] Sin archivos de desarrollo

---

## 📏 Tamaño Estimado del Paquete

```
Archivos                    Tamaño
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
sener2025.cls              ~80 KB
google_apps_script.js      ~60 KB
tipografias/               ~5 MB
image/                     ~2 MB
Documentación             ~50 KB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL                      ~7-8 MB
```

---

## 🚀 Instrucciones de Instalación para el Usuario Final

**Ver archivo completo:** [GUIA_INSTALACION.md](GUIA_INSTALACION.md)

Resumen rápido:
1. Instalar TeX Live (XeLaTeX)
2. Descomprimir paquete
3. Configurar Google Apps Script
4. Generar .tex desde Google Sheets
5. Compilar con `xelatex documento.tex`

---

## 📝 Notas de Versión

### Versión 1.0 (Actual)
- ✅ Sistema simplificado (solo generación LaTeX)
- ✅ Eliminada interfaz web
- ✅ Documentación completa
- ✅ Script optimizado de Google Sheets
- ✅ Soporte para Directorio desde hoja de Google Sheets

---

## 📞 Contacto y Soporte

Para actualizaciones futuras del sistema, contactar al equipo de desarrollo.
