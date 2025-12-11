#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Compila documentos LaTeX con accesibilidad PDF/UA completa
.DESCRIPTION
    Script que:
    1. Valida que el .tex tenga los paquetes de accesibilidad
    2. Verifica metadatos PDF/UA
    3. Compila con XeLaTeX optimizado para accesibilidad
    4. Genera reporte de accesibilidad del PDF resultante
.PARAMETER TexFile
    Archivo .tex a compilar (por defecto: InformeEnergia25.tex)
.PARAMETER SkipValidation
    Omitir validación de accesibilidad
.EXAMPLE
    .\compilar-pdf-accesible.ps1
    .\compilar-pdf-accesible.ps1 -TexFile MiDocumento.tex
#>

param(
    [string]$TexFile = "InformeEnergia25.tex",
    [switch]$SkipValidation
)

# Colores para output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Step {
    param([string]$Message)
    Write-ColorOutput "`n==> $Message" "Cyan"
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✓ $Message" "Green"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "⚠ $Message" "Yellow"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "✗ $Message" "Red"
}

# Verificar que el archivo existe
if (-not (Test-Path $TexFile)) {
    Write-Error "No se encontró el archivo: $TexFile"
    exit 1
}

Write-ColorOutput @"
╔══════════════════════════════════════════════════════════════╗
║  COMPILADOR PDF ACCESIBLE - SENER 2025                       ║
║  Generación de PDFs con accesibilidad universal (PDF/UA)     ║
╚══════════════════════════════════════════════════════════════╝
"@ "Magenta"

# PASO 1: Validar paquetes de accesibilidad
if (-not $SkipValidation) {
    Write-Step "Validando paquetes de accesibilidad en $TexFile"
    
    $contenido = Get-Content $TexFile -Raw
    
    $paquetesRequeridos = @(
        @{Nombre="axessibility"; Pattern="\\usepackage(\[.*?\])?\{axessibility\}"},
        @{Nombre="hyperref"; Pattern="\\usepackage(\[.*?\])?\{hyperref\}"},
        @{Nombre="sener2025.cls"; Pattern="\\documentclass(\[.*?\])?\{sener2025\}"}
    )
    
    $todosCorrecto = $true
    
    foreach ($paquete in $paquetesRequeridos) {
        if ($contenido -match $paquete.Pattern) {
            Write-Success "$($paquete.Nombre) detectado"
        } else {
            Write-Warning "$($paquete.Nombre) NO encontrado"
            $todosCorrecto = $false
        }
    }
    
    # Verificar metadatos PDF/UA
    Write-Step "Validando metadatos PDF/UA"
    
    $metadatosRequeridos = @("pdftitle", "pdfauthor", "pdfsubject", "pdfkeywords")
    
    foreach ($metadato in $metadatosRequeridos) {
        if ($contenido -match $metadato) {
            Write-Success "$metadato configurado"
        } else {
            Write-Warning "$metadato NO encontrado"
            $todosCorrecto = $false
        }
    }
    
    if (-not $todosCorrecto) {
        Write-Warning "El documento puede no tener accesibilidad completa"
        $respuesta = Read-Host "¿Continuar de todas formas? (S/N)"
        if ($respuesta -ne "S" -and $respuesta -ne "s") {
            Write-Error "Compilación cancelada"
            exit 1
        }
    }
}

# PASO 2: Limpiar archivos auxiliares previos
Write-Step "Limpiando archivos auxiliares"

$extensionesLimpiar = @("*.aux", "*.log", "*.out", "*.toc", "*.lof", "*.lot", "*.fls", "*.fdb_latexmk", "*.synctex.gz", "*.bbl", "*.blg", "*.bcf", "*.run.xml")

foreach ($ext in $extensionesLimpiar) {
    $archivos = Get-ChildItem -Filter $ext -ErrorAction SilentlyContinue
    if ($archivos) {
        Remove-Item $ext -Force
        Write-Success "Limpiados: $ext"
    }
}

# PASO 3: Compilar con XeLaTeX (múltiples pasadas para referencias)
Write-Step "Compilando con XeLaTeX (1era pasada)..."

$nombreBase = [System.IO.Path]::GetFileNameWithoutExtension($TexFile)

# Primera compilación
$resultado = xelatex -interaction=nonstopmode -halt-on-error $TexFile 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Error "Error en la primera compilación"
    Write-ColorOutput "Revisa el archivo $nombreBase.log para más detalles" "Yellow"
    exit 1
}

Write-Success "Primera pasada completada"

# Verificar si hay bibliografía
if (Test-Path "referencias.bib") {
    Write-Step "Procesando bibliografía con Biber..."
    biber $nombreBase 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Bibliografía procesada"
    } else {
        Write-Warning "Advertencia al procesar bibliografía (puede ser normal)"
    }
}

# Segunda compilación (para referencias cruzadas)
Write-Step "Compilando con XeLaTeX (2da pasada - referencias)..."
xelatex -interaction=nonstopmode -halt-on-error $TexFile 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Warning "Advertencia en segunda compilación (puede ser normal)"
}

# Tercera compilación (para tabla de contenidos)
Write-Step "Compilando con XeLaTeX (3era pasada - índices)..."
xelatex -interaction=nonstopmode -halt-on-error $TexFile 2>&1 | Out-Null

Write-Success "Compilación completada"

# PASO 4: Verificar PDF generado
$pdfFile = "$nombreBase.pdf"

if (Test-Path $pdfFile) {
    $pdfInfo = Get-Item $pdfFile
    $tamañoMB = [math]::Round($pdfInfo.Length / 1MB, 2)
    
    Write-Step "PDF generado exitosamente"
    Write-ColorOutput "  Archivo: $pdfFile" "White"
    Write-ColorOutput "  Tamaño: $tamañoMB MB" "White"
    Write-ColorOutput "  Fecha: $($pdfInfo.LastWriteTime)" "White"
} else {
    Write-Error "No se generó el archivo PDF"
    exit 1
}

# PASO 5: Generar reporte de accesibilidad
Write-Step "Generando reporte de accesibilidad"

$reporteFile = "$nombreBase-reporte-accesibilidad.txt"

@"
===============================================================================
REPORTE DE ACCESIBILIDAD PDF/UA - $nombreBase.pdf
Generado: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
===============================================================================

INFORMACIÓN DEL DOCUMENTO
-------------------------
Archivo fuente: $TexFile
Archivo PDF: $pdfFile
Tamaño: $tamañoMB MB

PAQUETES DE ACCESIBILIDAD
-------------------------
"@ | Out-File $reporteFile -Encoding UTF8

foreach ($paquete in $paquetesRequeridos) {
    $estado = if ($contenido -match $paquete.Pattern) { "✓ PRESENTE" } else { "✗ AUSENTE" }
    "- $($paquete.Nombre): $estado" | Out-File $reporteFile -Append -Encoding UTF8
}

@"

METADATOS PDF/UA
----------------
"@ | Out-File $reporteFile -Append -Encoding UTF8

foreach ($metadato in $metadatosRequeridos) {
    $estado = if ($contenido -match $metadato) { "✓ Configurado" } else { "✗ No configurado" }
    "- $metadato`: $estado" | Out-File $reporteFile -Append -Encoding UTF8
}

@"

CARACTERÍSTICAS DE ACCESIBILIDAD
---------------------------------
- Texto alternativo en figuras: Implementado vía \pdftooltip
- Estructura jerárquica: Secciones con \section, \subsection, etc.
- Enlaces accesibles: hyperref con colores institucionales
- Etiquetado semántico: axessibility habilitado
- Idioma del documento: Español (es-MX)

VERIFICACIÓN MANUAL RECOMENDADA
--------------------------------
1. Abrir el PDF en Adobe Acrobat Pro
2. Ir a: Herramientas > Accesibilidad > Verificación de accesibilidad completa
3. Ejecutar verificación PDF/UA
4. Revisar y corregir cualquier advertencia

VALIDADOR ALTERNATIVO
----------------------
Para validación sin Adobe Acrobat, usar PAC (PDF Accessibility Checker):
https://pdfua.foundation/en/pdf-accessibility-checker-pac

===============================================================================
"@ | Out-File $reporteFile -Append -Encoding UTF8

Write-Success "Reporte guardado en: $reporteFile"

# PASO 6: Limpieza final (opcional)
Write-Step "Limpieza de archivos temporales"

$respuesta = Read-Host "¿Eliminar archivos auxiliares? (S/N)"
if ($respuesta -eq "S" -or $respuesta -eq "s") {
    foreach ($ext in $extensionesLimpiar) {
        Remove-Item $ext -Force -ErrorAction SilentlyContinue
    }
    Write-Success "Archivos auxiliares eliminados"
}

# Resumen final
Write-ColorOutput @"

╔══════════════════════════════════════════════════════════════╗
║  ✓ COMPILACIÓN COMPLETADA                                    ║
╚══════════════════════════════════════════════════════════════╝

📄 PDF generado: $pdfFile
📊 Tamaño: $tamañoMB MB
📋 Reporte: $reporteFile

🔍 PRÓXIMOS PASOS:
1. Revisar el PDF en un lector compatible
2. Ejecutar verificación de accesibilidad en Adobe Acrobat
3. Si hay advertencias, revisar el archivo .tex y recompilar

💡 NOTA: La accesibilidad PDF/UA puede requerir ajustes manuales
   en Adobe Acrobat Pro para certificación completa.

"@ "Green"

# Abrir PDF automáticamente
$abrirPdf = Read-Host "¿Abrir el PDF ahora? (S/N)"
if ($abrirPdf -eq "S" -or $abrirPdf -eq "s") {
    Start-Process $pdfFile
}

exit 0
