# latexmk configuration for SENER LaTeX
# Forces XeLaTeX (required by fontspec) and uses biber when bibliography is present.

$pdf_mode = 5; # 5 = xelatex

$pdflatex = 'xelatex -synctex=1 -interaction=nonstopmode -file-line-error %O %S';

# Make latexmk use biber even if it thinks it's bibtex
$biber  = 'biber %O %B';
$bibtex = 'biber %O %B';

# Optional: keep going even with minor errors; set to 0 if you prefer strict mode
$max_repeat = 5;
