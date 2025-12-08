Param(
  [string]$Doc = "InformeEnergia25.tex",
  [switch]$All
)

function Build-Doc([string]$file) {
  if (Test-Path $file) {
    Write-Host "Compilando $file" -ForegroundColor Cyan
    latexmk -xelatex -interaction=nonstopmode -file-line-error $file
    if ($LASTEXITCODE -ne 0) {
      Write-Host "Error compilando $file" -ForegroundColor Red
    } else {
      Write-Host "OK: $file" -ForegroundColor Green
    }
  } else {
    Write-Host "No existe: $file" -ForegroundColor Yellow
  }
}

if ($All) {
  Build-Doc "InformeEnergia25.tex"
  Build-Doc "template-institucional.tex"
} else {
  Build-Doc $Doc
}
