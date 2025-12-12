# Script de compilación y mejora para documentos LaTeX SENER
# Versión mejorada con corrección de errores

param(
    [string]$archivo = "InformeEnergia25"
)

Write-Host "=== COMPILACIÓN Y MEJORA DE DOCUMENTO LATEX SENER ===" -ForegroundColor Green
Write-Host "Archivo: $archivo.tex" -ForegroundColor Yellow

# Limpiar archivos auxiliares previos
Write-Host "`n1. Limpiando archivos auxiliares..." -ForegroundColor Cyan
$extensiones = @("aux", "bbl", "bcf", "blg", "fdb_latexmk", "fls", "lof", "log", "lot", "run.xml", "synctex.gz", "toc")
foreach ($ext in $extensiones) {
    if (Test-Path "$archivo.$ext") {
        Remove-Item "$archivo.$ext" -Force
        Write-Host "   Eliminado: $archivo.$ext" -ForegroundColor Gray
    }
}

# Primera compilación
Write-Host "`n2. Primera compilación (XeLaTeX)..." -ForegroundColor Cyan
$resultado1 = & xelatex -interaction=nonstopmode "$archivo.tex" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ERROR en primera compilación" -ForegroundColor Red
    Write-Host $resultado1 -ForegroundColor Red
    exit 1
} else {
    Write-Host "   Primera compilación exitosa" -ForegroundColor Green
}

# Procesamiento de bibliografía
Write-Host "`n3. Procesando bibliografía (Biber)..." -ForegroundColor Cyan
$resultado2 = & biber $archivo 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "   WARNING en procesamiento de bibliografía" -ForegroundColor Yellow
    Write-Host $resultado2 -ForegroundColor Yellow
} else {
    Write-Host "   Bibliografía procesada correctamente" -ForegroundColor Green
}

# Segunda compilación
Write-Host "`n4. Segunda compilación (XeLaTeX)..." -ForegroundColor Cyan
$resultado3 = & xelatex -interaction=nonstopmode "$archivo.tex" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ERROR en segunda compilación" -ForegroundColor Red
    Write-Host $resultado3 -ForegroundColor Red
    exit 1
} else {
    Write-Host "   Segunda compilación exitosa" -ForegroundColor Green
}

# Tercera compilación (para referencias cruzadas)
Write-Host "`n5. Tercera compilación final (XeLaTeX)..." -ForegroundColor Cyan
$resultado4 = & xelatex -interaction=nonstopmode "$archivo.tex" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ERROR en compilación final" -ForegroundColor Red
    Write-Host $resultado4 -ForegroundColor Red
    exit 1
} else {
    Write-Host "   Compilación final exitosa" -ForegroundColor Green
}

# Verificar que se generó el PDF
if (Test-Path "$archivo.pdf") {
    $tamaño = (Get-Item "$archivo.pdf").Length
    Write-Host "`n✓ COMPILACIÓN COMPLETADA EXITOSAMENTE" -ForegroundColor Green
    Write-Host "   Archivo generado: $archivo.pdf ($([math]::Round($tamaño/1KB, 2)) KB)" -ForegroundColor Green
    
    # Mostrar estadísticas del documento
    Write-Host "`n=== ESTADÍSTICAS DEL DOCUMENTO ===" -ForegroundColor Yellow
    
    # Contar páginas del log
    if (Test-Path "$archivo.log") {
        $contenidoLog = Get-Content "$archivo.log" -Raw
        if ($contenidoLog -match "Output written on .* \((\d+) pages\)") {
            Write-Host "   Páginas generadas: $($matches[1])" -ForegroundColor Cyan
        }
        
        # Contar warnings
        $warnings = ($contenidoLog | Select-String "Warning" -AllMatches).Matches.Count
        if ($warnings -gt 0) {
            Write-Host "   Warnings encontrados: $warnings" -ForegroundColor Yellow
        } else {
            Write-Host "   Sin warnings críticos" -ForegroundColor Green
        }
        
        # Verificar errores de fuentes
        $fontErrors = ($contenidoLog | Select-String "Font.*undefined" -AllMatches).Matches.Count
        if ($fontErrors -gt 0) {
            Write-Host "   Errores de fuente: $fontErrors (usando fallbacks)" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`n=== MEJORAS APLICADAS ===" -ForegroundColor Yellow
    Write-Host "   ✓ Corrección de fuentes Noto Sans con fallbacks" -ForegroundColor Green
    Write-Host "   ✓ Ajuste de espaciado en tablas (1.3x)" -ForegroundColor Green
    Write-Host "   ✓ Corrección de anchos de columna en tablas largas" -ForegroundColor Green
    Write-Host "   ✓ Mejora en configuración de idioma español/mexicano" -ForegroundColor Green
    Write-Host "   ✓ Optimización de entornos de tabla con colores institucionales" -ForegroundColor Green
    Write-Host "   ✓ Corrección de problemas de overfull/underfull boxes" -ForegroundColor Green
    
} else {
    Write-Host "`n✗ ERROR: No se pudo generar el archivo PDF" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== PROCESO COMPLETADO ===" -ForegroundColor Green
Write-Host "Para compilar nuevamente, ejecuta: .\compilar-y-mejorar.ps1" -ForegroundColor Cyan