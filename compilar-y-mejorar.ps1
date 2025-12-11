# ============================================================================
# Script Completo: Compilar LaTeX + Mejorar Accesibilidad
# ============================================================================
# Uso: .\compilar-y-mejorar.ps1 -Archivo "InformeEnergia25"

param(
    [Parameter(Mandatory = $true)]
    [string]$Archivo,
    
    [switch]$SoloCompilacion,
    
    [switch]$SoloAccesibilidad
)

$ArchivoBase = $Archivo -replace '\.tex$', ''
$ArchivoTex = "$ArchivoBase.tex"
$ArchivoPdf = "$ArchivoBase.pdf"

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   COMPILADOR LATEX + ACCESIBILIDAD - SENER 2025           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# PASO 1: Compilar con LaTeX
# ============================================================================

if (-not $SoloAccesibilidad) {
    Write-Host "📝 PASO 1: Compilando documento LaTeX..." -ForegroundColor Yellow
    Write-Host ""
    
    if (-not (Test-Path $ArchivoTex)) {
        Write-Host "❌ ERROR: No se encuentra $ArchivoTex" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "   Ejecutando XeLaTeX (1/3)..." -ForegroundColor Gray
    xelatex -interaction=nonstopmode $ArchivoTex | Out-Null
    
    Write-Host "   Ejecutando Biber..." -ForegroundColor Gray
    biber $ArchivoBase | Out-Null
    
    Write-Host "   Ejecutando XeLaTeX (2/3)..." -ForegroundColor Gray
    xelatex -interaction=nonstopmode $ArchivoTex | Out-Null
    
    Write-Host "   Ejecutando XeLaTeX (3/3)..." -ForegroundColor Gray
    xelatex -interaction=nonstopmode $ArchivoTex | Out-Null
    
    if (Test-Path $ArchivoPdf) {
        Write-Host "✅ Compilación completada: $ArchivoPdf" -ForegroundColor Green
    }
    else {
        Write-Host "❌ ERROR: La compilación falló" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
}

# ============================================================================
# PASO 2: Mejorar accesibilidad
# ============================================================================

if (-not $SoloCompilacion) {
    Write-Host "♿ PASO 2: Mejorando accesibilidad..." -ForegroundColor Yellow
    Write-Host ""
    
    if (-not (Test-Path $ArchivoPdf)) {
        Write-Host "❌ ERROR: No se encuentra $ArchivoPdf" -ForegroundColor Red
        exit 1
    }
    
    # Ejecutar script de accesibilidad
    if (Test-Path "arreglar-accesibilidad.ps1") {
        .\arreglar-accesibilidad.ps1 `
            -InputPDF $ArchivoPdf `
            -Titulo "Informe Institucional de Energía 2025" `
            -Autor "Secretaría de Energía" `
            -Idioma "es-MX" `
            -PalabrasClave "energía, SENER, accesibilidad, transición energética"
    }
    else {
        Write-Host "⚠️  Script arreglar-accesibilidad.ps1 no encontrado" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   PROCESO COMPLETADO                                      ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📂 Archivos generados:" -ForegroundColor Cyan
Get-ChildItem "$ArchivoBase*" -Include "*.pdf", "*.log" | ForEach-Object {
    Write-Host "   - $($_.Name) ($([math]::Round($_.Length/1KB, 2)) KB)" -ForegroundColor Gray
}
Write-Host ""
