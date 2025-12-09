@echo off
echo ========================================
echo Compilando PDF con etiquetas de accesibilidad
echo ========================================
echo.

REM Compilar con LuaLaTeX para soporte completo de PDF/UA
lualatex -interaction=nonstopmode InformeEnergia25.tex

REM Ejecutar biber para bibliografía
biber InformeEnergia25

REM Segunda compilación para referencias
lualatex -interaction=nonstopmode InformeEnergia25.tex

REM Tercera compilación para asegurar todas las referencias
lualatex -interaction=nonstopmode InformeEnergia25.tex

echo.
echo ========================================
echo Compilación completada
echo ========================================
echo.
echo El PDF generado debe tener etiquetas de accesibilidad.
echo Puedes verificarlo en Adobe Acrobat:
echo   - Herramientas ^> Accesibilidad ^> Verificación completa
echo.
pause
