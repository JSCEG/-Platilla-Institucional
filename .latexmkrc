$pdf_mode = 4; # Force lualatex (mejor soporte para PDF/UA)
$postscript_mode = $dvi_mode = 0;
$dvi_previewer = 'start %O %S';
$pdf_previewer = 'start %O %S';

# Opciones adicionales para LuaLaTeX
$lualatex = 'lualatex %O --shell-escape %S';
