# Script de empaquetado automático - SENER LaTeX
# Crea un paquete ZIP listo para distribución

$fecha = Get-Date -Format "yyyy-MM-dd"
$version = "1.0"
$nombrePaquete = "SENER_LaTeX_v${version}_${fecha}"
$carpetaTemporal = Join-Path $env:TEMP $nombrePaquete
$archivoZip = Join-Path (Get-Location) "$nombrePaquete.zip"

Write-Host "`n╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  SENER LaTeX - Crear Paquete Distribución ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Limpiar si existe
if (Test-Path $carpetaTemporal) {
    Remove-Item -Path $carpetaTemporal -Recurse -Force
}
if (Test-Path $archivoZip) {
    Remove-Item -Path $archivoZip -Force
}

# Crear carpeta temporal
Write-Host "📁 Creando estructura de distribución..." -ForegroundColor Green
New-Item -ItemType Directory -Path $carpetaTemporal -Force | Out-Null

# ============================================================================
# ARCHIVOS INDIVIDUALES ESENCIALES
# ============================================================================
Write-Host "`n📄 Copiando archivos esenciales:" -ForegroundColor Yellow

$archivosEsenciales = @(
    "sener2025.cls",
    "google_apps_script_FINAL.js",
    "GUIA_INSTALACION.md",
    "ESTRUCTURA_ENTREGA.md",
    "README.md"
)

$archivosCopiadosOK = 0
$archivosNoEncontrados = @()

foreach ($archivo in $archivosEsenciales) {
    if (Test-Path $archivo) {
        Copy-Item $archivo -Destination $carpetaTemporal
        Write-Host "   ✓ $archivo" -ForegroundColor Cyan
        $archivosCopiadosOK++
    }
    else {
        Write-Host "   ⚠ $archivo (no encontrado)" -ForegroundColor Red
        $archivosNoEncontrados += $archivo
    }
}

# ============================================================================
# ARCHIVOS OPCIONALES
# ============================================================================
$archivosOpcionales = @(
    "referencias.bib",
    "template-institucional.tex"
)

foreach ($archivo in $archivosOpcionales) {
    if (Test-Path $archivo) {
        Copy-Item $archivo -Destination $carpetaTemporal
        Write-Host "   ✓ $archivo (opcional)" -ForegroundColor DarkCyan
    }
}

# ============================================================================
# CARPETAS COMPLETAS
# ============================================================================
Write-Host "`n📂 Copiando carpetas:" -ForegroundColor Yellow

$carpetas = @(
    @{Nombre = "tipografias"; Esencial = $true },
    @{Nombre = "img"; Esencial = $true },
    @{Nombre = "ejemplos"; Esencial = $false }
)

foreach ($carpeta in $carpetas) {
    $nombreCarpeta = $carpeta.Nombre
    if (Test-Path $nombreCarpeta) {
        Copy-Item $nombreCarpeta -Destination $carpetaTemporal -Recurse
        $numArchivos = (Get-ChildItem -Path $nombreCarpeta -Recurse -File).Count
        Write-Host "   ✓ $nombreCarpeta/ ($numArchivos archivos)" -ForegroundColor Cyan
    }
    else {
        if ($carpeta.Esencial) {
            Write-Host "   ⚠ $nombreCarpeta/ (no encontrada - ESENCIAL)" -ForegroundColor Red
            $archivosNoEncontrados += "$nombreCarpeta/"
        }
        else {
            Write-Host "   ⊘ $nombreCarpeta/ (no encontrada - opcional)" -ForegroundColor DarkGray
        }
    }
}

# ============================================================================
# VERIFICAR ARCHIVOS CRÍTICOS
# ============================================================================
if ($archivosNoEncontrados.Count -gt 0) {
    Write-Host "`n⚠️  ADVERTENCIA: Archivos esenciales no encontrados:" -ForegroundColor Red
    foreach ($archivo in $archivosNoEncontrados) {
        Write-Host "   - $archivo" -ForegroundColor Red
    }
    Write-Host "`n¿Desea continuar de todos modos? (S/N): " -ForegroundColor Yellow -NoNewline
    $respuesta = Read-Host
    if ($respuesta -ne "S" -and $respuesta -ne "s") {
        Write-Host "`n❌ Empaquetado cancelado.`n" -ForegroundColor Red
        Remove-Item -Path $carpetaTemporal -Recurse -Force
        exit
    }
}

# ============================================================================
# CREAR ARCHIVO ZIP
# ============================================================================
Write-Host "`n📦 Creando archivo ZIP..." -ForegroundColor Green
try {
    Compress-Archive -Path "$carpetaTemporal\*" -DestinationPath $archivoZip -Force
    Write-Host "   ✓ ZIP creado exitosamente" -ForegroundColor Cyan
}
catch {
    Write-Host "   ❌ Error al crear ZIP: $_" -ForegroundColor Red
    Remove-Item -Path $carpetaTemporal -Recurse -Force
    exit
}

# ============================================================================
# VERIFICAR CONTENIDO DEL ZIP
# ============================================================================
Write-Host "`n📋 Contenido del paquete:" -ForegroundColor Yellow
$tempVerificar = Join-Path $env:TEMP "verificar_$nombrePaquete"
Expand-Archive -Path $archivoZip -DestinationPath $tempVerificar -Force

$todosArchivos = Get-ChildItem -Path $tempVerificar -Recurse
$archivos = ($todosArchivos | Where-Object { -not $_.PSIsContainer }).Count
$carpetas = ($todosArchivos | Where-Object { $_.PSIsContainer }).Count

Write-Host "   Carpetas: $carpetas" -ForegroundColor Cyan
Write-Host "   Archivos: $archivos" -ForegroundColor Cyan

# Mostrar estructura
Write-Host "`n   Estructura:" -ForegroundColor DarkGray
Get-ChildItem -Path $tempVerificar -Recurse -Name | 
ForEach-Object { Write-Host "   - $_" -ForegroundColor DarkGray } | 
Select-Object -First 20

if ((Get-ChildItem -Path $tempVerificar -Recurse -Name).Count -gt 20) {
    Write-Host "   ..." -ForegroundColor DarkGray
}

# Tamaño del ZIP
$tamañoMB = [math]::Round((Get-Item $archivoZip).Length / 1MB, 2)
Write-Host "`n   Tamaño: $tamañoMB MB" -ForegroundColor Cyan

# Limpiar temporal de verificación
Remove-Item -Path $tempVerificar -Recurse -Force
Remove-Item -Path $carpetaTemporal -Recurse -Force

# ============================================================================
# RESULTADO FINAL
# ============================================================================
Write-Host "`n╔════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║     ✅ PAQUETE CREADO EXITOSAMENTE         ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📦 Archivo: " -NoNewline -ForegroundColor White
Write-Host "$archivoZip" -ForegroundColor Yellow
Write-Host "📏 Tamaño:  $tamañoMB MB" -ForegroundColor White
Write-Host "📁 Archivos: $archivos archivos en $carpetas carpetas`n" -ForegroundColor White

Write-Host "Siguiente paso: Enviar este archivo ZIP para instalación." -ForegroundColor Cyan
Write-Host "El destinatario debe seguir las instrucciones en GUIA_INSTALACION.md`n" -ForegroundColor Cyan
