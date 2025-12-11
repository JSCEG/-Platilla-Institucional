# ============================================================================
# Script para Crear Plantilla Word con Estilos Institucionales SENER
# ============================================================================
# Genera una plantilla .docx con colores y tipografías institucionales
# Luego Pandoc la usará automáticamente en las conversiones

param(
    [string]$NombrePlantilla = "plantilla-sener.docx"
)

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   GENERADOR DE PLANTILLA WORD - SENER 2025                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Verificar Pandoc
if (-not (Get-Command pandoc -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Pandoc no está instalado" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Generando plantilla base..." -ForegroundColor Yellow

# Generar plantilla por defecto de Pandoc
pandoc --print-default-data-file reference.docx > $NombrePlantilla

if (Test-Path $NombrePlantilla) {
    Write-Host "✅ Plantilla base creada: $NombrePlantilla" -ForegroundColor Green
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
    Write-Host "║   INSTRUCCIONES - PERSONALIZAR EN WORD                    ║" -ForegroundColor Magenta
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "1️⃣  Abre: $NombrePlantilla" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2️⃣  Inicio → Estilos → Botón expandir → Administrar estilos" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "3️⃣  Modificar cada estilo:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   📌 Título 1 (Heading 1):" -ForegroundColor Yellow
    Write-Host "      - Fuente: Noto Sans Bold, 20pt" -ForegroundColor Gray
    Write-Host "      - Color: RGB(156, 35, 72) - Guinda" -ForegroundColor Gray
    Write-Host "      - Espaciado antes: 24pt, después: 12pt" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   📌 Título 2 (Heading 2):" -ForegroundColor Yellow
    Write-Host "      - Fuente: Noto Sans Bold, 16pt" -ForegroundColor Gray
    Write-Host "      - Color: RGB(30, 91, 79) - Verde" -ForegroundColor Gray
    Write-Host "      - Espaciado antes: 18pt, después: 6pt" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   📌 Título 3 (Heading 3):" -ForegroundColor Yellow
    Write-Host "      - Fuente: Noto Sans Bold, 14pt" -ForegroundColor Gray
    Write-Host "      - Color: RGB(166, 128, 45) - Dorado" -ForegroundColor Gray
    Write-Host "      - Espaciado antes: 12pt, después: 6pt" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   📌 Párrafo Normal:" -ForegroundColor Yellow
    Write-Host "      - Fuente: Noto Sans Regular, 12pt" -ForegroundColor Gray
    Write-Host "      - Color: Negro" -ForegroundColor Gray
    Write-Host "      - Interlineado: 1.5 líneas" -ForegroundColor Gray
    Write-Host "      - Alineación: Justificado" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   📌 Hipervínculo:" -ForegroundColor Yellow
    Write-Host "      - Color: RGB(156, 35, 72) - Guinda" -ForegroundColor Gray
    Write-Host "      - Subrayado: Sí" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   📌 Título de Tabla (Table Caption):" -ForegroundColor Yellow
    Write-Host "      - Fuente: Noto Sans Bold, 11pt" -ForegroundColor Gray
    Write-Host "      - Color: RGB(152, 152, 154) - Gris" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   📌 Título de Figura (Image Caption):" -ForegroundColor Yellow
    Write-Host "      - Fuente: Noto Sans Bold, 11pt" -ForegroundColor Gray
    Write-Host "      - Color: RGB(152, 152, 154) - Gris" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4️⃣  Configurar página:" -ForegroundColor Cyan
    Write-Host "   - Diseño → Márgenes → Personalizar" -ForegroundColor Gray
    Write-Host "   - Superior: 3.5cm, Inferior: 3.5cm" -ForegroundColor Gray
    Write-Host "   - Izquierdo: 2.5cm, Derecho: 2.5cm" -ForegroundColor Gray
    Write-Host "   - Tamaño: Carta (21.59 × 27.94 cm)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "5️⃣  Guardar y cerrar" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║   COLORES INSTITUCIONALES SENER                           ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "🟥 Guinda:  RGB(156, 35, 72)   - Títulos principales" -ForegroundColor DarkRed
    Write-Host "🟩 Verde:   RGB(30, 91, 79)    - Subtítulos" -ForegroundColor DarkGreen
    Write-Host "🟨 Dorado:  RGB(166, 128, 45)  - Títulos nivel 3" -ForegroundColor DarkYellow
    Write-Host "⬜ Gris:    RGB(152, 152, 154) - Captions y secundario" -ForegroundColor Gray
    Write-Host ""
    Write-Host "💡 TIP: Si no tienes Noto Sans instalada, usa Arial como alternativa" -ForegroundColor Cyan
    Write-Host ""
    
    # Abrir plantilla en Word
    $respuesta = Read-Host "¿Abrir plantilla en Word para personalizarla ahora? (S/N)"
    if ($respuesta -eq "S" -or $respuesta -eq "s") {
        Start-Process $NombrePlantilla
        Write-Host ""
        Write-Host "📝 Cuando termines de personalizar, guarda y cierra Word" -ForegroundColor Yellow
        Write-Host "   Luego ejecuta:" -ForegroundColor Gray
        Write-Host "   .\latex-to-markdown.ps1 -Archivo 'InformeEnergia25'" -ForegroundColor Cyan
        Write-Host "   .\md-to-word-con-estilos.ps1" -ForegroundColor Cyan
    }
    
}
else {
    Write-Host "❌ ERROR: No se pudo crear la plantilla" -ForegroundColor Red
    exit 1
}

Write-Host ""
