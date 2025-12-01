%!TEX TS-program = xelatex
\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{sener2025}[2025/11/21 Plantilla institucional SENER - Versión completa]

% Basado en article tamaño carta, 12pt
\LoadClass[12pt,letterpaper,twoside]{article}

% ============================================================================
% PAQUETES BÁSICOS
% ============================================================================
\RequirePackage[spanish,es-tabla]{babel}
% \\RequirePackage[utf8]{inputenc} % Not needed for XeLaTeX
\RequirePackage[T1]{fontenc}
\RequirePackage[left=2.5cm,right=2.5cm,top=3.5cm,bottom=3.5cm,headheight=15pt,headsep=1cm,footskip=1.5cm]{geometry}
\RequirePackage[final]{graphicx}
% Configuración para evitar compresión agresiva de imágenes
\ifdefined\XeTeXversion
  \special{pdf:minorversion 7} % Usar PDF 1.7 (mejor soporte de transparencias y calidad)
  \special{pdf:objcompresslevel 0} % Evitar compresión de objetos que pueda degradar calidad
\fi
\RequirePackage[table]{xcolor}
\RequirePackage{titlesec}
\RequirePackage{fontawesome5}
\RequirePackage{fancyhdr}
\setlength{\headheight}{45pt}

% ============================================================================
% COLORES INSTITUCIONALES
% ============================================================================
\definecolor{gobmxGuinda}{RGB}{156,35,72}
\definecolor{gobmxVerde}{RGB}{30,91,79}
\definecolor{gobmxDorado}{RGB}{166,128,45}
\definecolor{gobmxGris}{RGB}{152,152,154}
\definecolor{gobmxGrisClaro}{HTML}{F5F5F5}
\definecolor{gobmxAmbarClaro}{RGB}{231,210,149}

% ============================================================================
% TIPOGRAFÍAS INSTITUCIONALES
% ============================================================================
% Nota: Para usar las tipografías personalizadas, compila con XeLaTeX o LuaLaTeX
% Si usas pdfLaTeX, estas líneas se ignorarán y usará las fuentes por defecto

\IfFileExists{fontspec.sty}{
  \RequirePackage{fontspec}
  
  % Tipografía principal: Patria (para títulos y encabezados)
  \IfFileExists{tipografias/Patria_Regular.otf}{
    \newfontfamily\patriafont[
      Path = tipografias/,
      Extension = .otf,
      UprightFont = *_Regular,
      BoldFont = *_Bold,
      ItalicFont = *_Light
    ]{Patria}
  }{}
  
  % Tipografía secundaria: Noto Sans (para cuerpo de texto)
  \IfFileExists{tipografias/NotoSans-Regular.ttf}{
    \setmainfont{NotoSans}[
      Path = tipografias/,
      Extension = .ttf,
      UprightFont = *-Regular,
      BoldFont = *-Bold,
      ItalicFont = *-Italic,
      BoldItalicFont = *-BoldItalic
    ]
    
    \setsansfont{NotoSans}[
      Path = tipografias/,
      Extension = .ttf,
      UprightFont = *-Regular,
      BoldFont = *-Bold,
      ItalicFont = *-Italic,
      BoldItalicFont = *-BoldItalic
    ]
  }{}
}{}


% Fallback if fontspec or fonts are missing
\ifdefined\patriafont
\else
  \newcommand{\patriafont}{\bfseries}
\fi

% ============================================================================
% Packages for functionality and bibliography
% ============================================================================
\RequirePackage{enumitem}
\RequirePackage{tcolorbox}
\tcbuselibrary{skins,breakable}
\RequirePackage{caption}
\RequirePackage{subcaption}
\RequirePackage{csquotes}
\RequirePackage{booktabs}
\RequirePackage{array}
\RequirePackage{longtable}
\RequirePackage{multirow}
\RequirePackage{tocloft}
\renewcommand{\cftsecleader}{\cftdotfill{\cftdotsep}}
\setlength{\cftbeforesecskip}{0.5em}
\RequirePackage{colortbl}
\RequirePackage{tabularx}
\RequirePackage{pdfpages}
\RequirePackage{eso-pic}
\RequirePackage{tikz}
\RequirePackage{multicol}
\RequirePackage{microtype}
\RequirePackage{lettrine}
\RequirePackage{qrcode}
\RequirePackage{marginnote}

% Definición de tamaño de fuente 10.5pt para tablas y glosario
\newcommand{\notosanssmall}{\fontsize{10.5pt}{12.6pt}\selectfont}

% ============================================================================
% CONFIGURACIÓN DE CAPTIONS
% ============================================================================
% Usa Patria para el título de tablas y figuras
% Definir fuente Patria para captions
\DeclareCaptionFont{patria}{\patriafont}

\captionsetup{
  font={small,patria},             % Título en Patria (aprox 12 pt)
  labelfont={bf,patria,color=gobmxGuinda},
  labelsep=space,                       % "Figura 1 Título ..." (sin punto tras el número)
  justification=raggedright,
  singlelinecheck=false
}

\captionsetup[table]{position=top, skip=8pt}
\captionsetup[figure]{position=bottom, skip=8pt}

\captionsetup[table]{
  position=top,
  skip=8pt
}

\captionsetup[figure]{
  position=bottom,
  skip=8pt
}
% Bibliography (APA style)
\RequirePackage[
  backend=biber,
  style=verbose-ibid,
  sorting=nyt,
  citestyle=verbose-ibid
]{biblatex}
\addbibresource{referencias.bib}
% Hyperref (load after biblatex)
\RequirePackage{hyperref}
\hypersetup{
  colorlinks=true,
  linkcolor=gobmxGris,
  filecolor=gobmxDorado,
  urlcolor=gobmxGuinda,
  citecolor=gobmxVerde,
  bookmarksnumbered=true,
  pdfborder={0 0 0}
}
% ============================================================================
% DATOS DEL DOCUMENTO
% ============================================================================
\newcommand{\@subtitle}{}
\newcommand{\subtitle}[1]{\gdef\@subtitle{#1}}

\newcommand{\@institucion}{Secretaría de Energía}
\newcommand{\institucion}[1]{\gdef\@institucion{#1}}

\newcommand{\@unidad}{Unidad de Planeación Energética}
\newcommand{\unidad}[1]{\gdef\@unidad{#1}}

\newcommand{\DocumentoCorto}{}
\newcommand{\setDocumentoCorto}[1]{\renewcommand{\DocumentoCorto}{#1}}

% Metadatos PDF para publicación oficial
\newcommand{\@palabrasclave}{}
\newcommand{\palabrasclave}[1]{\gdef\@palabrasclave{#1}}

\newcommand{\@version}{1.0}
\newcommand{\version}[1]{\gdef\@version{#1}}

\AtBeginDocument{
  \hypersetup{
    pdftitle={\@title},
    pdfauthor={\@institucion},
    pdfsubject={\@subtitle},
    pdfkeywords={\@palabrasclave},
    pdfproducer={Secretaría de Energía - Gobierno de México},
    pdfcreator={LaTeX con clase sener2025}
  }
}

% ============================================================================
% COMANDO PARA VALORES DESTACADOS (Recuadros naranjas)
% ============================================================================
\definecolor{highlightOrange}{RGB}{166,128,45}
\newcommand{\highlight}[1]{%
  \colorbox{highlightOrange}{%
    \strut\textbf{\textcolor{white}{#1}}%
  }%
}

% ============================================================================
% ENCABEZADOS Y PIES DE PÁGINA
% ============================================================================
\fancypagestyle{plain}{
  \fancyhf{}
  \fancyhead[L]{\small\textcolor{gobmxGuinda}{\DocumentoCorto}}
  \fancyhead[R]{\small\textcolor{gobmxGuinda}{\leftmark}}
  
  % Pie de página alternado (Par/Impar)
  \fancyfoot[LE]{\makebox[\headwidth][l]{\small\bfseries\thepage\quad\textcolor{gobmxGuinda}{\DocumentoCorto}\ \textcolor{gobmxDorado}{\hrulefill}}}
  \fancyfoot[RO]{\makebox[\headwidth][r]{\small\textcolor{gobmxDorado}{\hrulefill}\ \textcolor{gobmxGuinda}{\DocumentoCorto}\quad\bfseries\thepage}}
  
  \renewcommand{\headrulewidth}{1pt}
  \renewcommand{\headrule}{\vspace{10pt}{\color{gobmxDorado}\hrule width\headwidth height\headrulewidth}}
  \renewcommand{\footrulewidth}{0pt}
}

\fancypagestyle{fancy}{
  \fancyhf{}
  \fancyhead[L]{\small\textcolor{gobmxGuinda}{\DocumentoCorto}}
  \fancyhead[R]{\small\textcolor{gobmxGuinda}{\leftmark}}
  
  % Pie de página alternado (Par/Impar)
  \fancyfoot[LE]{\makebox[\headwidth][l]{\small\bfseries\thepage\quad\textcolor{gobmxGuinda}{\DocumentoCorto}\ \textcolor{gobmxDorado}{\hrulefill}}}
  \fancyfoot[RO]{\makebox[\headwidth][r]{\small\textcolor{gobmxDorado}{\hrulefill}\ \textcolor{gobmxGuinda}{\DocumentoCorto}\quad\bfseries\thepage}}
  
  \renewcommand{\headrulewidth}{1pt}
  \renewcommand{\headrule}{\vspace{10pt}{\color{gobmxDorado}\hrule width\headwidth height\headrulewidth}}
  \renewcommand{\footrulewidth}{0pt}
}

\fancypagestyle{portada}{
  \fancyhf{}
  \renewcommand{\headrulewidth}{0pt}
  \renewcommand{\footrulewidth}{0pt}
}

\pagestyle{fancy}

% Agregar fondo a todas las páginas con estilo plain
\AddToShipoutPictureBG{%
  \IfFileExists{img/foja_blanca.jpg}{%
    \AtPageLowerLeft{%
      \includegraphics[width=\paperwidth,height=\paperheight]{img/foja_blanca.jpg}%
    }%
  }{}%
}

% Configuración de párrafo y espaciado moderno
\setlength{\parindent}{0pt}
\setlength{\parskip}{0.5em}
\linespread{1.15}

% ============================================================================
% ESTILOS DE TÍTULOS Y SECCIONES  (A–E de la plantilla Word)
% ============================================================================

% Título A  -> \section  (Patria 17 pt, negritas)
\titleformat{\section}
  {\patriafont\bfseries\fontsize{17pt}{20pt}\selectfont\color{gobmxGuinda}}
  {\thesection}{0.3em}{}

% Título B  -> \subsection  (Patria 14 pt, negritas)
\titleformat{\subsection}
  {\patriafont\bfseries\fontsize{14pt}{17pt}\selectfont\color{gobmxGuinda}}
  {\thesubsection}{0.3em}{}

% Título C  -> \subsubsection  (Noto Sans 12 pt, negritas)
\titleformat{\subsubsection}
  {\sffamily\bfseries\fontsize{12pt}{14pt}\selectfont\color{gobmxGuinda}}
  {\thesubsubsection}{0.3em}{}

% Título D  -> \paragraph  (Noto Sans 12 pt, normal)
\titleformat{\paragraph}
  {\sffamily\fontsize{12pt}{14pt}\selectfont\color{gobmxGris}}
  {\theparagraph}{0.3em}{}
\titlespacing*{\paragraph}{0pt}{0.8em}{0.5em}

% Título E  -> \subparagraph  (Noto Sans 10 pt, negritas)
\titleformat{\subparagraph}
  {\sffamily\bfseries\fontsize{10pt}{12pt}\selectfont\color{gobmxGris}}
  {\thesubparagraph}{0.3em}{}
\titlespacing*{\subparagraph}{0pt}{0.6em}{0.4em}

% Espaciados que ya tenías (ajusta si quieres)
\titlespacing*{\section}{0pt}{2em}{1em}
\titlespacing*{\subsection}{0pt}{1.5em}{0.8em}
\titlespacing*{\subsubsection}{0pt}{1em}{0.5em}

% ============================================================================
% LISTAS PERSONALIZADAS (alineado a la plantilla Word)
% ============================================================================

% 1er nivel: viñeta
\setlist[itemize,1]{%
  label=\textbullet,
  leftmargin=*,
  itemsep=0.3em
}

% 2do nivel: guión
\setlist[itemize,2]{%
  label=--,
  leftmargin=2em,
  itemsep=0.2em
}

% 3er nivel: viñeta
\setlist[itemize,3]{%
  label=\textbullet,
  leftmargin=3em,
  itemsep=0.15em
}

% 4to nivel: guión
\setlist[itemize,4]{%
  label=--,
  leftmargin=4em,
  itemsep=0.15em
}

% ============================================================================
% ESTILOS DE TABLAS PROFESIONALES
% ============================================================================

% Tipos de columnas personalizadas
\newcolumntype{L}[1]{>{\raggedright\arraybackslash}p{#1}}
\newcolumntype{C}[1]{>{\centering\arraybackslash}p{#1}}
\newcolumntype{R}[1]{>{\raggedleft\arraybackslash}p{#1}}

% ============================================================================
% ESTILOS DE ENCABEZADOS DE TABLA
% ============================================================================
% NOTA: Los comandos de encabezado ahora solo dan formato al texto.
% Para colorear la fila, use \rowcolor{<color>} al inicio de la fila.
% Ejemplo: \rowcolor{gobmxGuinda} \encabezadoguinda{Celda 1} & ...

% Encabezado guinda (predeterminado)
\newcommand{\encabezadoguinda}[1]{%
  \textcolor{white}{\textbf{#1}}%
}

% Encabezado verde
\newcommand{\encabezadoverde}[1]{%
  \textcolor{white}{\textbf{#1}}%
}

% Encabezado dorado
\newcommand{\encabezadodorado}[1]{%
  \textcolor{white}{\textbf{#1}}%
}

% Encabezado gris
\newcommand{\encabezadogris}[1]{%
  \textcolor{white}{\textbf{#1}}%
}

% Alias para compatibilidad
\newcommand{\encabezadotabla}[1]{\encabezadoguinda{#1}}

% ============================================================================
% TABLAS CON ESTILOS PREDEFINIDOS
% ============================================================================

% Tabla estilo guinda (predeterminada)
\newenvironment{tablaguinda}[1][]{
  \rowcolors{2}{gobmxGuinda!10}{white}
  \begin{table}[H]
  \centering
  \renewcommand{\arraystretch}{1.2} % Más aire
  \sffamily\notosanssmall % Fuente sans-serif 10.5pt
  #1
}{
  \end{table}
}

% Tabla estilo verde
\newenvironment{tablaverde}[1][]{
  \rowcolors{2}{gobmxVerde!15}{white}
  \begin{table}[H]
  \centering
  \renewcommand{\arraystretch}{1.2}
  \sffamily\notosanssmall
  #1
}{
  \end{table}
}

% Tabla estilo dorado
\newenvironment{tabladorado}[1][]{
  \rowcolors{2}{gobmxDorado!12}{white}
  \begin{table}[H]
  \centering
  \renewcommand{\arraystretch}{1.2}
  \sffamily\notosanssmall
  #1
}{
  \end{table}
}

% Tabla estilo gris (neutral)
\newenvironment{tablagris}[1][]{
  \rowcolors{2}{gobmxGrisClaro}{white}
  \begin{table}[H]
  \centering
  \renewcommand{\arraystretch}{1.2}
  \sffamily\notosanssmall
  #1
}{
  \end{table}
}

% Tabla sin stripes (solo encabezado con color)
\newenvironment{tablalimpia}[1][]{
  \begin{table}[H]
  \centering
  \renewcommand{\arraystretch}{1.2}
  \sffamily\notosanssmall
  #1
}{
  \end{table}
}

% Alias para compatibilidad con código existente
\newenvironment{tablainstitucional}[1][]{
  \rowcolors{2}{gobmxGrisClaro}{white}
  \begin{table}[H]
  \centering
  \renewcommand{\arraystretch}{1.2}
  \sffamily\notosanssmall
  #1
}{
  \end{table}
}

% ============================================================================
% RECUADROS Y CAJAS DESTACADAS
% ============================================================================

% Recuadro informativo general
\newtcolorbox{recuadro}[1][]{
  colback=gobmxGrisClaro,
  colframe=gobmxGuinda,
  boxrule=1.5pt,
  arc=3mm,
  left=10pt,
  right=10pt,
  top=10pt,
  bottom=10pt,
  breakable,
  #1
}

% Recuadro de nota importante
\newtcolorbox{notaimportante}[1][]{
  colback=gobmxGuinda!5,
  colframe=gobmxGuinda,
  boxrule=2pt,
  arc=2mm,
  left=10pt,
  right=10pt,
  top=10pt,
  bottom=10pt,
  bottom=10pt,
  title={\faExclamationTriangle\ \ \textbf{Nota importante}},
  fonttitle=\bfseries\color{white},
  coltitle=white,
  colbacktitle=gobmxGuinda,
  breakable,
  #1
}

% Recuadro de definición
\newtcolorbox{definicion}[1][]{
  colback=gobmxVerde!5,
  colframe=gobmxVerde,
  boxrule=1.5pt,
  arc=2mm,
  left=10pt,
  right=10pt,
  top=10pt,
  bottom=10pt,
  bottom=10pt,
  title={\faBook\ \ \textbf{Definición}},
  fonttitle=\bfseries\color{white},
  coltitle=white,
  colbacktitle=gobmxVerde,
  breakable,
  #1
}

% Recuadro de ejemplo
\newtcolorbox{ejemplo}[1][]{
  colback=gobmxAmbarClaro!10,
  colframe=gobmxDorado,
  boxrule=1.5pt,
  arc=2mm,
  left=10pt,
  right=10pt,
  top=10pt,
  bottom=10pt,
  bottom=10pt,
  title={\faLightbulb\ \ \textbf{Ejemplo}},
  fonttitle=\bfseries\color{white},
  coltitle=white,
  colbacktitle=gobmxDorado,
  breakable,
  #1
}

% Recuadro de resumen ejecutivo
\newtcolorbox{resumenejecutivo}[1][]{
  enhanced,
  colback=gobmxGuinda!3,
  colframe=gobmxGuinda,
  boxrule=2pt,
  arc=0mm,
  left=15pt,
  right=15pt,
  top=15pt,
  bottom=15pt,
  title={\Large\textbf{Resumen Ejecutivo}},
  fonttitle=\bfseries\color{white},
  coltitle=white,
  colbacktitle=gobmxGuinda,
  attach boxed title to top left={yshift=-3mm,xshift=5mm},
  boxed title style={sharp corners},
  breakable,
  #1
}

% Recuadro de datos clave
\newtcolorbox{datosclave}[1][]{
  enhanced,
  colback=gobmxAmbarClaro!10,
  colframe=gobmxDorado,
  boxrule=2pt,
  arc=1mm,
  left=12pt,
  right=12pt,
  top=12pt,
  bottom=12pt,
  title={\faKey\ \ \textbf{Datos Clave}},
  fonttitle=\bfseries\color{white},
  coltitle=white,
  colbacktitle=gobmxDorado,
  breakable,
  #1
}

% ============================================================================
% NUEVOS ENTORNOS PREMIUM
% ============================================================================

% Cita destacada (Pull Quote)
\newenvironment{destacado}[1][]{
  \begin{center}
  \begin{tikzpicture}
    \node[
      text width=0.85\textwidth,
      align=center,
      font=\Large\itshape\color{gobmxGuinda},
      inner sep=20pt
    ] (quote) {``#1''};
    \node[opacity=0.2, scale=4, color=gobmxDorado] at (quote.north west) {``};
    \node[opacity=0.2, scale=4, color=gobmxDorado] at (quote.south east) {''};
  \end{tikzpicture}
  \end{center}
}{}

% Línea de tiempo / Pasos
\newenvironment{pasos}{
  \begin{center}
  \begin{tikzpicture}[
    node distance=3cm,
    every node/.style={
      rectangle,
      rounded corners,
      draw=gobmxGuinda,
      very thick,
      fill=gobmxGrisClaro,
      text width=2.5cm,
      align=center,
      minimum height=1.5cm
    },
    arrow/.style={
      ->,
      >=stealth,
      very thick,
      color=gobmxDorado
    }
  ]
}{
  \end{tikzpicture}
  \end{center}
}

% Comando auxiliar para pasos
\newcommand{\paso}[3]{
  \node (#1) [#2] {#3};
}
\newcommand{\conectar}[2]{
  \draw[arrow] (#1) -- (#2);
}

% ============================================================================
% COMANDOS AVANZADOS (PRO)
% ============================================================================

% Letra Capital (Drop Cap)
\newcommand{\letraCapital}[2]{%
  \lettrine[lines=3, lhang=0.33, nindent=0em, findent=3pt, realheight=true]{\color{gobmxGuinda}#1}{#2}%
}

% Código QR
\newcommand{\qrlink}[1]{%
  \qrcode[height=2.5cm]{#1}%
}

% Nota al Margen
\newcommand{\notaMargen}[1]{%
  \marginnote{%
    \footnotesize\color{gobmxGuinda}\sffamily%
    \raggedright%
    \faInfoCircle\ #1%
  }%
}

% ============================================================================
% ELEMENTOS VISUALES MODERNOS
% ============================================================================

% Badges/Etiquetas (Pills)
\newcommand{\badge}[2][gobmxGuinda]{%
  \tikz[baseline=(badge.base)]{%
    \node[%
      inner sep=3pt,%
      outer sep=0pt,%
      rounded corners=3pt,%
      fill=#1,%
      text=white,%
      font=\tiny\sffamily\bfseries,%
      minimum height=1.2em%
    ] (badge) {#2};%
  }%
}

% Callouts Mejorados (GitHub-style)
\newtcolorbox{calloutTip}[1][Consejo]{%
  colback=gobmxVerde!5,%
  colframe=gobmxVerde,%
  boxrule=0pt,%
  leftrule=4pt,%
  arc=0mm,%
  left=8pt,%
  right=8pt,%
  top=8pt,%
  bottom=8pt,%
  title={\faLightbulb\ \ \textbf{#1}},%
  fonttitle=\bfseries\color{gobmxVerde},%
  coltitle=gobmxVerde,%
  colbacktitle=gobmxVerde!5,%
  breakable%
}

\newtcolorbox{calloutWarning}[1][Advertencia]{%
  colback=gobmxAmbarClaro,%
  colframe=gobmxDorado,%
  boxrule=0pt,%
  leftrule=4pt,%
  arc=0mm,%
  left=8pt,%
  right=8pt,%
  top=8pt,%
  bottom=8pt,%
  title={\faExclamationTriangle\ \ \textbf{#1}},%
  fonttitle=\bfseries\color{gobmxDorado},%
  coltitle=gobmxDorado,%
  colbacktitle=gobmxDorado!5,%
  breakable%
}

\newtcolorbox{calloutImportant}[1][Importante]{%
  colback=gobmxGuinda!5,%
  colframe=gobmxGuinda,%
  boxrule=0pt,%
  leftrule=4pt,%
  arc=0mm,%
  left=8pt,%
  right=8pt,%
  top=8pt,%
  bottom=8pt,%
  title={\faExclamationCircle\ \ \textbf{#1}},%
  fonttitle=\bfseries\color{gobmxGuinda},%
  coltitle=gobmxGuinda,%
  colbacktitle=gobmxGuinda!5,%
  breakable%
}

% Barra de Progreso
\newcommand{\progressbar}[3][gobmxVerde]{%
  % #1 = color (opcional, default verde)
  % #2 = porcentaje (0-100)
  % #3 = etiqueta
  \begin{tikzpicture}[baseline=-0.5ex]
    % Fondo
    \fill[gobmxGrisClaro] (0,0) rectangle (4,0.3);
    % Barra de progreso
    \fill[#1] (0,0) rectangle ({4*#2/100},0.3);
    % Borde
    \draw[gobmxGris,line width=0.5pt] (0,0) rectangle (4,0.3);
    % Texto
    \node[right,font=\small\sffamily] at (4.1,0.15) {#3};
  \end{tikzpicture}%
}

% Timeline (Línea de Tiempo)
\newenvironment{timeline}{%
  \begin{center}
  \begin{tikzpicture}[
    timeline/.style={%
      draw=gobmxGuinda,%
      line width=2pt%
    },%
    event/.style={%
      circle,%
      fill=gobmxDorado,%
      inner sep=3pt,%
      minimum size=8pt%
    },%
    eventlabel/.style={%
      font=\small\sffamily,%
      text width=3cm,%
      align=center%
    }
  ]
}{%
  \end{tikzpicture}
  \end{center}
}

% Comando auxiliar para eventos en timeline
\newcommand{\evento}[3]{%
  % #1 = posición x
  % #2 = año/fecha
  % #3 = descripción
  \node[event] at (#1,0) {};
  \node[eventlabel,above] at (#1,0.3) {\textbf{#2}};
  \node[eventlabel,below] at (#1,-0.3) {#3};
}

% ============================================================================
% AMBIENTE PARA ANEXOS
% ============================================================================
\newcommand{\anexos}{
  \clearpage
  \appendix
  \renewcommand{\thesection}{Anexo \Alph{section}}
  
  % Ajuste dinámico de anchos en ToC para Anexos (evita empalmes)
  \addtocontents{toc}{\protect\setlength{\cftsecnumwidth}{5.5em}}
  \addtocontents{toc}{\protect\setlength{\cftsubsecnumwidth}{6.5em}}
  \addtocontents{toc}{\protect\setlength{\cftsubsubsecnumwidth}{7.5em}}
  
  \titleformat{\section}
    {\Large\bfseries\color{gobmxGuinda}}
    {\thesection:}{0.3em}{}
    [\vspace{-0.5em}\textcolor{gobmxGuinda}{\titlerule[1pt]}]

  \titleformat{\subsection}
    {\patriafont\bfseries\fontsize{14pt}{17pt}\selectfont\color{gobmxGuinda}}
    {\thesubsection}{0.3em}{}
}

% ============================================================================
% PORTADA INSTITUCIONAL
% ============================================================================

% Portada estándar (sin fondo)
\renewcommand{\maketitle}{%
  \begin{titlepage}
    \thispagestyle{portada}
    % Agregar imagen de fondo de portada
    \AddToShipoutPictureBG*{%
      \AtPageLowerLeft{%
        \includegraphics[width=\paperwidth,height=\paperheight]{img/portada.png}%
      }%
    }
    \begin{center}
      \vspace*{1.5cm}

      \vspace*{2cm}

      % "PLAN DE" o texto superior
      {\Large\bfseries\color{gobmxGris} PLAN DE}\\[1cm]

      % Título principal
      {\Huge\bfseries\color{gobmxDorado}\@title}\\[0.8cm]

      % Subtítulo (si existe)
      \ifx\@subtitle\empty
      \else
        {\LARGE\color{gobmxGuinda}\@subtitle}\\[3cm]
      \fi

      \vfill

      % Unidad responsable
      {\large\textbf{\@unidad}}\\[0.5cm]
      
      % Institución
      {\large\@institucion}\\[1cm]

      % Fecha
      {\large\@date}\\[1cm]

      % Logo Gobierno de México
      \includegraphics[height=1.5cm]{img/logo_gob.png}

    \end{center}
  \end{titlepage}
  \clearpage
}

% Portada con fondo guinda
\newcommand{\portadafondo}{%
  \begin{titlepage}
    \thispagestyle{portada}
    
    % Imagen de fondo
    \AddToShipoutPictureBG*{%
      \AtPageLowerLeft{%
        \includegraphics[width=\paperwidth,height=\paperheight]{img/portada.png}%
      }%
    }
    
    \begin{center}
      \vspace*{2cm}

      % Logo SENER eliminado por solicitud
      \vspace*{5cm}

      % Título principal eliminado por solicitud
      % {\Huge\bfseries\patriafont\color{gobmxAmbarClaro}\@title}\\[1cm]

      % Subtítulo eliminado por solicitud
      % \ifx\@subtitle\empty
      % \else
      %   {\LARGE\color{white}\@subtitle}\\[2cm]
      % \fi

      \vfill

      % Unidad responsable en blanco
      {\large\color{white}\textbf{\@unidad}}\\[0.5cm]
      
      % Institución en blanco
      {\large\color{white}\@institucion}\\[1cm]

      % Fecha en blanco
      {\large\color{white}\@date}\\[1.5cm]

      % Logo Gobierno transparente eliminado
      % Espacio para subir el texto
      \vspace{3cm}

    \end{center}
  \end{titlepage}
  \clearpage
}

% ============================================================================
% ÍNDICES PERSONALIZADOS (Tablas y Figuras)
% ============================================================================
\newcommand{\listatablas}{
  \clearpage
  \begin{center}
    % Línea decorativa eliminada
    
    % Título del índice
    {\Large\bfseries\color{gobmxGuinda}Índice de Tablas}\\[1cm]
  \end{center}
  
  % Contenido del índice (generado automáticamente)
  \makeatletter
  \@starttoc{lot}
  \makeatother
}

\newcommand{\listafiguras}{
  \clearpage
  \begin{center}
    % Línea decorativa eliminada
    
    % Título del índice
    {\Large\bfseries\color{gobmxGuinda}Índice de Figuras}\\[1cm]
  \end{center}
  
  % Contenido del índice (generado automáticamente)
  \makeatletter
  \@starttoc{lof}
  \makeatother
}

% ============================================================================
% CONTRAPORTADA INSTITUCIONAL
% ============================================================================
\newcommand{\contraportada}[1]{
  \clearpage
  \thispagestyle{empty}
  \hypersetup{urlcolor=gobmxAmbarClaro} % URL en Ámbar Claro para contraste
  % Agregar imagen de fondo de contraportada
  \AddToShipoutPictureBG*{%
    \AtPageLowerLeft{%
      \includegraphics[width=\paperwidth,height=\paperheight]{img/contraportada.png}%
    }%
  }
  \vspace*{1cm}
  
  \begin{center}
    \color{white}
    {\large\textbf{\@title}}\\[0.3cm]
    \ifx\@subtitle\empty
    \else
      \textcolor{gobmxGrisClaro}{\@subtitle}\\[1cm]
    \fi
  \end{center}

  \vfill
  
  \begin{center}
    \color{white}
    {\small
    \textbf{\textcolor{gobmxAmbarClaro}{\@institucion}}\\
    \@unidad\\[0.5cm]
    
    #1
    
    \vspace{0.5cm}
    
    \textcolor{gobmxGrisClaro}{\@date}
    }
  \end{center}
  
  \vspace*{-1.5cm}
  \clearpage
}

% ============================================================================
% PORTADA DE SECCIÓN
% ============================================================================
\newcommand{\portadaseccion}[3]{
  \clearpage
  \thispagestyle{empty}
  \begingroup
    \color{white}
    % Fondo con imagen (fondo_guinda.png)
    \AddToShipoutPictureBG*{%
      \AtPageLowerLeft{%
        \includegraphics[width=\paperwidth,height=\paperheight]{img/fondo_guinda.png}%
      }%
    }
    \vspace*{\fill}
    \begin{center}
      % Número de sección grande en blanco
      {\fontsize{80}{80}\selectfont\bfseries\color{white} #1}\\[0.5cm]
      
      % Título en Ambar Claro y fuente Patria
      {\Huge\bfseries\patriafont\color{gobmxAmbarClaro} #2}\\[1cm]
      
      % Subtítulo en blanco
      {\Large #3}
    \end{center}
    \vspace*{\fill}
  \endgroup
  \clearpage
}

% ============================================================================
% PÁGINA DE CRÉDITOS/DIRECTORIO
% ============================================================================
\newcommand{\paginacreditos}[1]{
  \clearpage
  \thispagestyle{empty}
  % Sobrescribir con fondo blanco limpio
  \AddToShipoutPictureBG*{\AtPageLowerLeft{\color{white}\rule{\paperwidth}{\paperheight}}}
  
  \begin{center}
    {\Large\bfseries\color{gobmxGuinda} Directorio}\\[1cm]
  \end{center}
  
  #1
  
  \clearpage
}

% ============================================================================
% MACROS ADICIONALES (PLADERSE)
% ============================================================================

% Si tienes Noto Sans Light instalada puedes definirla;
% si no, simplemente hereda la sans estándar.
\IfFileExists{tipografias/NotoSans-Light.ttf}{
  \newfontfamily\notosanslight[
    Path = tipografias/,
    Extension = .ttf,
    UprightFont = *-Light,
    ItalicFont  = *-LightItalic
  ]{NotoSans}
}{
  \newcommand{\notosanslight}{\sffamily}
}

% Macro de fuente de gráfico/tabla
\newcommand{\fuente}[1]{%
  \par\vspace{0.3em}%
  {\notosanslight\fontsize{9pt}{11pt}\selectfont
    \textbf{FUENTE:} #1.%
  }%
}

% Entrada de glosario
\newcommand{\entradaGlosario}[2]{%
  \par\begingroup
  \setlength{\parindent}{0pt}%
  \setlength{\hangindent}{0pt}%
  \noindent{\notosanssmall\textbf{#1} -- #2}\par
  \endgroup
}

% Entrada de sigla / acrónimo
\newcommand{\entradaSigla}[2]{%
  \par\begingroup
  \setlength{\parindent}{0pt}%
  \setlength{\hangindent}{0pt}%
  \noindent{\notosanssmall\textbf{#1} -- #2}\par
  \endgroup
}
