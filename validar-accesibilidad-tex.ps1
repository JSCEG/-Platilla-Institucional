#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Valida y mejora la accesibilidad de archivos .tex
.DESCRIPTION
    Este script analiza un archivo .tex y:
    1. Detecta figuras sin texto alternativo
    2. Valida que existan metadatos PDF/UA
    3. Sugiere mejoras de accesibilidad
    4. Puede agregar automáticamente anotaciones de accesibilidad
.PARAMETER TexFile
    Archivo .tex a validar
.PARAMETER AutoFix
    Aplicar correcciones automáticas
.EXAMPLE
    .\validar-accesibilidad-tex.ps1 -TexFile InformeEnergia25.tex
    .\validar-accesibilidad-tex.ps1 -TexFile MiDoc.tex -AutoFix
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$TexFile,
    [switch]$AutoFix
)

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

# Verificar archivo
if (-not (Test-Path $TexFile)) {
    Write-ColorOutput "✗ Archivo no encontrado: $TexFile" "Red"
    exit 1
}

Write-ColorOutput @"
╔══════════════════════════════════════════════════════════════╗
║  VALIDADOR DE ACCESIBILIDAD LATEX                            ║
║  Análisis de estructura y metadatos PDF/UA                   ║
╚══════════════════════════════════════════════════════════════╝
"@ "Cyan"

$contenido = Get-Content $TexFile -Raw
$lineas = Get-Content $TexFile

# Arrays para almacenar problemas
$problemas = @()
$advertencias = @()
$sugerencias = @()

# 1. VALIDAR PAQUETES DE ACCESIBILIDAD
Write-ColorOutput "`n==> Validando paquetes de accesibilidad..." "Yellow"

$paquetesAccesibilidad = @{
    "axessibility" = $false
    "hyperref" = $false
    "pdfcomment" = $false
}

foreach ($paquete in $paquetesAccesibilidad.Keys) {
    if ($contenido -match "\\usepackage(\[.*?\])?\{$paquete\}") {
        Write-ColorOutput "  ✓ $paquete encontrado" "Green"
        $paquetesAccesibilidad[$paquete] = $true
    } else {
        Write-ColorOutput "  ✗ $paquete NO encontrado" "Red"
        $problemas += "Falta paquete: \usepackage{$paquete}"
    }
}

# 2. VALIDAR METADATOS PDF
Write-ColorOutput "`n==> Validando metadatos PDF/UA..." "Yellow"

$metadatosRequeridos = @{
    "pdftitle" = $false
    "pdfauthor" = $false
    "pdfsubject" = $false
    "pdfkeywords" = $false
    "pdflang" = $false
}

foreach ($metadato in $metadatosRequeridos.Keys) {
    if ($contenido -match $metadato) {
        Write-ColorOutput "  ✓ $metadato configurado" "Green"
        $metadatosRequeridos[$metadato] = $true
    } else {
        Write-ColorOutput "  ⚠ $metadato NO encontrado" "Yellow"
        $advertencias += "Metadato faltante: $metadato"
    }
}

# 3. ANALIZAR FIGURAS
Write-ColorOutput "`n==> Analizando figuras..." "Yellow"

$patronFigura = '\\begin\{figure\}.*?\\end\{figure\}'
$figuras = [regex]::Matches($contenido, $patronFigura, [System.Text.RegularExpressions.RegexOptions]::Singleline)

Write-ColorOutput "  Total de figuras: $($figuras.Count)" "White"

$figurasProblematicas = 0

foreach ($figura in $figuras) {
    $textoFigura = $figura.Value
    
    $tieneCaption = $textoFigura -match '\\caption\{'
    $tieneLabel = $textoFigura -match '\\label\{'
    $tieneTextoAlt = $textoFigura -match '\\pdftooltip\{'
    
    if (-not $tieneCaption) {
        $figurasProblematicas++
        $advertencias += "Figura sin \caption detectada"
    }
    
    if (-not $tieneLabel) {
        $sugerencias += "Figura sin \label (dificulta referencias cruzadas)"
    }
    
    if (-not $tieneTextoAlt) {
        $figurasProblematicas++
        $problemas += "Figura sin texto alternativo (\pdftooltip)"
    }
}

if ($figurasProblematicas -eq 0) {
    Write-ColorOutput "  ✓ Todas las figuras tienen metadatos adecuados" "Green"
} else {
    Write-ColorOutput "  ✗ $figurasProblematicas figuras con problemas de accesibilidad" "Red"
}

# 4. ANALIZAR TABLAS
Write-ColorOutput "`n==> Analizando tablas..." "Yellow"

$patronTabla = '\\begin\{(table|longtable|tabular)\}.*?\\end\{(table|longtable|tabular)\}'
$tablas = [regex]::Matches($contenido, $patronTabla, [System.Text.RegularExpressions.RegexOptions]::Singleline)

Write-ColorOutput "  Total de tablas: $($tablas.Count)" "White"

$tablasConCaption = 0
foreach ($tabla in $tablas) {
    if ($tabla.Value -match '\\caption\{') {
        $tablasConCaption++
    }
}

if ($tablas.Count -gt 0) {
    $porcentaje = [math]::Round(($tablasConCaption / $tablas.Count) * 100, 1)
    Write-ColorOutput "  $tablasConCaption de $($tablas.Count) tablas tienen \caption ($porcentaje%)" "White"
    
    if ($porcentaje -lt 100) {
        $advertencias += "Algunas tablas no tienen \caption"
    }
}

# 5. VALIDAR ESTRUCTURA JERÁRQUICA
Write-ColorOutput "`n==> Validando estructura jerárquica..." "Yellow"

$tieneSection = $contenido -match '\\section\{'
$tieneSubsection = $contenido -match '\\subsection\{'
$tieneTableOfContents = $contenido -match '\\tableofcontents'

if ($tieneSection) {
    Write-ColorOutput "  ✓ Documento tiene estructura de secciones" "Green"
} else {
    Write-ColorOutput "  ⚠ No se detectaron \section{}" "Yellow"
    $advertencias += "Documento sin estructura jerárquica clara"
}

if ($tieneTableOfContents) {
    Write-ColorOutput "  ✓ Tabla de contenidos incluida" "Green"
} else {
    Write-ColorOutput "  ⚠ No hay \tableofcontents" "Yellow"
    $sugerencias += "Agregar \tableofcontents para navegación"
}

# 6. VERIFICAR ENLACES
Write-ColorOutput "`n==> Verificando enlaces..." "Yellow"

$urls = [regex]::Matches($contenido, '\\url\{[^}]+\}')
$hrefs = [regex]::Matches($contenido, '\\href\{[^}]+\}')

$totalEnlaces = $urls.Count + $hrefs.Count
Write-ColorOutput "  Total de enlaces: $totalEnlaces" "White"

if ($paquetesAccesibilidad["hyperref"]) {
    Write-ColorOutput "  ✓ Enlaces accesibles (hyperref configurado)" "Green"
} else {
    if ($totalEnlaces -gt 0) {
        Write-ColorOutput "  ✗ Hay enlaces pero hyperref no está configurado" "Red"
        $problemas += "Enlaces sin accesibilidad (falta hyperref)"
    }
}

# 7. GENERAR REPORTE
Write-ColorOutput "`n╔══════════════════════════════════════════════════════════════╗" "Magenta"
Write-ColorOutput "║  RESUMEN DE ACCESIBILIDAD                                    ║" "Magenta"
Write-ColorOutput "╚══════════════════════════════════════════════════════════════╝" "Magenta"

$reporteFile = "$([System.IO.Path]::GetFileNameWithoutExtension($TexFile))-validacion-accesibilidad.txt"

@"
===============================================================================
REPORTE DE VALIDACIÓN DE ACCESIBILIDAD
Archivo: $TexFile
Fecha: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
===============================================================================

PROBLEMAS CRÍTICOS ($($problemas.Count))
"@ | Out-File $reporteFile -Encoding UTF8

if ($problemas.Count -eq 0) {
    "  ✓ No se encontraron problemas críticos`n" | Out-File $reporteFile -Append -Encoding UTF8
    Write-ColorOutput "`n✓ PROBLEMAS CRÍTICOS: 0" "Green"
} else {
    Write-ColorOutput "`n✗ PROBLEMAS CRÍTICOS: $($problemas.Count)" "Red"
    foreach ($problema in $problemas) {
        "  - $problema" | Out-File $reporteFile -Append -Encoding UTF8
        Write-ColorOutput "  - $problema" "Red"
    }
    "`n" | Out-File $reporteFile -Append -Encoding UTF8
}

@"
ADVERTENCIAS ($($advertencias.Count))
"@ | Out-File $reporteFile -Append -Encoding UTF8

if ($advertencias.Count -eq 0) {
    "  ✓ No hay advertencias`n" | Out-File $reporteFile -Append -Encoding UTF8
    Write-ColorOutput "✓ ADVERTENCIAS: 0" "Green"
} else {
    Write-ColorOutput "⚠ ADVERTENCIAS: $($advertencias.Count)" "Yellow"
    foreach ($advertencia in $advertencias) {
        "  - $advertencia" | Out-File $reporteFile -Append -Encoding UTF8
        Write-ColorOutput "  - $advertencia" "Yellow"
    }
    "`n" | Out-File $reporteFile -Append -Encoding UTF8
}

@"
SUGERENCIAS DE MEJORA ($($sugerencias.Count))
"@ | Out-File $reporteFile -Append -Encoding UTF8

if ($sugerencias.Count -eq 0) {
    "  ✓ No hay sugerencias adicionales`n" | Out-File $reporteFile -Append -Encoding UTF8
    Write-ColorOutput "💡 SUGERENCIAS: 0" "Cyan"
} else {
    Write-ColorOutput "💡 SUGERENCIAS: $($sugerencias.Count)" "Cyan"
    foreach ($sugerencia in $sugerencias) {
        "  - $sugerencia" | Out-File $reporteFile -Append -Encoding UTF8
        Write-ColorOutput "  - $sugerencia" "Cyan"
    }
    "`n" | Out-File $reporteFile -Append -Encoding UTF8
}

@"
ESTADÍSTICAS DEL DOCUMENTO
--------------------------
- Figuras totales: $($figuras.Count)
- Figuras con problemas: $figurasProblematicas
- Tablas totales: $($tablas.Count)
- Tablas con caption: $tablasConCaption
- Enlaces totales: $totalEnlaces
- Tiene estructura jerárquica: $(if ($tieneSection) {'Sí'} else {'No'})
- Tiene tabla de contenidos: $(if ($tieneTableOfContents) {'Sí'} else {'No'})

RECOMENDACIONES
---------------
1. Asegurarse de que todas las figuras tengan \pdftooltip para texto alternativo
2. Todas las tablas deben tener \caption descriptivo
3. Usar \section, \subsection para estructura clara
4. Incluir \tableofcontents para navegación
5. Configurar metadatos PDF/UA completos en \hypersetup{}
6. Compilar con XeLaTeX para mejor soporte de accesibilidad

PRÓXIMOS PASOS
--------------
1. Corregir problemas críticos marcados arriba
2. Revisar advertencias y sugerencias
3. Ejecutar: .\compilar-pdf-accesible.ps1 -TexFile $TexFile
4. Validar PDF resultante con Adobe Acrobat o PAC

===============================================================================
"@ | Out-File $reporteFile -Append -Encoding UTF8

Write-ColorOutput "`n📋 Reporte guardado en: $reporteFile" "Green"

# 8. AUTO-FIX (si se solicitó)
if ($AutoFix -and ($problemas.Count -gt 0 -or $advertencias.Count -gt 0)) {
    Write-ColorOutput "`n==> Aplicando correcciones automáticas..." "Yellow"
    
    $contenidoModificado = $contenido
    $cambiosRealizados = 0
    
    # Agregar metadatos si faltan
    if (-not $metadatosRequeridos["pdflang"]) {
        Write-ColorOutput "  + Agregando pdflang={es-MX}" "Cyan"
        $contenidoModificado = $contenidoModificado -replace '(\\hypersetup\{)', "`$1`n  pdflang={es-MX},"
        $cambiosRealizados++
    }
    
    # Crear backup
    $backupFile = "$TexFile.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item $TexFile $backupFile
    Write-ColorOutput "  💾 Backup creado: $backupFile" "Green"
    
    # Guardar cambios
    if ($cambiosRealizados -gt 0) {
        $contenidoModificado | Out-File $TexFile -Encoding UTF8
        Write-ColorOutput "  ✓ $cambiosRealizados correcciones aplicadas" "Green"
        Write-ColorOutput "  ⚠ Revisa los cambios antes de compilar" "Yellow"
    } else {
        Write-ColorOutput "  ℹ No hay correcciones automáticas disponibles" "Cyan"
        Write-ColorOutput "  💡 Revisa manualmente los problemas reportados" "Cyan"
    }
}

# Puntuación de accesibilidad
$puntuacionMax = 100
$descuento = ($problemas.Count * 15) + ($advertencias.Count * 5)
$puntuacion = [math]::Max(0, $puntuacionMax - $descuento)

Write-ColorOutput "`n╔══════════════════════════════════════════════════════════════╗" "Magenta"
Write-ColorOutput "║  PUNTUACIÓN DE ACCESIBILIDAD: $puntuacion/100" "Magenta"
Write-ColorOutput "╚══════════════════════════════════════════════════════════════╝" "Magenta"

if ($puntuacion -ge 90) {
    Write-ColorOutput "`n🏆 ¡Excelente! El documento tiene alta accesibilidad" "Green"
} elseif ($puntuacion -ge 70) {
    Write-ColorOutput "`n👍 Bien. Algunas mejoras recomendadas" "Yellow"
} else {
    Write-ColorOutput "`n⚠️ Atención. Se requieren correcciones importantes" "Red"
}

exit 0
