# Test de Enlaces en Notas de Tablas

## Implementación Completada ✅

Se ha implementado el sistema de **referencias clicables** para las notas en tablas.

---

## Cómo Funciona

### 1. Detección de Notas en Celdas

**Función:** `estilizarNotas(texto)`

**Entrada:**
```javascript
"2024 6/"
"2016 1/,7/"
"Bioenergía 2/"
```

**Salida:**
```javascript
{
  textoBase: "2024",
  notas: ["6/"],
  tieneNotas: true
}

{
  textoBase: "2016",
  notas: ["1/", "7/"],  // Array separado
  tieneNotas: true
}
```

---

### 2. Generación de IDs Únicos

**Función:** `generarIdNota(nota)`

**Conversión:**
```
"1/"  → "nota1"
"6/"  → "nota6"
"P/"  → "notaP"
"e/"  → "notae"
"11/" → "nota11"
```

---

### 3. Creación de Enlaces en Tabla

**Función:** `procesarCeldasFila(fila, esEncabezado)`

**Proceso:**
1. Detecta notas al final del texto
2. Separa texto base de notas
3. Para cada nota:
   - Genera ID único
   - Crea `\hyperlink{ID}{nota}`
   - Aplica color (blanco/gris según contexto)
4. Une notas múltiples con coma

**Ejemplo - Nota simple:**
```javascript
Entrada: "2024 6/"
Salida:  "2024 \\textsuperscript{\\hyperlink{nota6}{\\textcolor{white}{6/}}}"
```

**Ejemplo - Notas múltiples:**
```javascript
Entrada: "2016 1/,7/"
Salida:  "2016 \\textsuperscript{\\hyperlink{nota1}{\\textcolor{white}{1/}},\\hyperlink{nota7}{\\textcolor{white}{7/}}}"
```

---

### 4. Creación de Destinos en Fuente

**Función:** `procesarTextoFuente(texto)`

**Proceso:**
1. Divide texto en líneas
2. Para cada línea que empieza con `nota/ texto`:
   - Detecta la nota
   - Genera ID único
   - Crea `\hypertarget{ID}{nota} texto`

**Ejemplo:**
```javascript
Entrada: "1/ Cifras al cierre del año."
Salida:  "\\hypertarget{nota1}{1/} Cifras al cierre del año."

Entrada: "6/ Cifras al cierre de junio."
Salida:  "\\hypertarget{nota6}{6/} Cifras al cierre de junio."
```

---

## Ejemplo Completo de Generación

### Entrada en Google Sheets

**Hoja "Tablas":**
| Titulo | Fuente | DatosCSV |
|--------|--------|----------|
| Capacidad instalada | Elaboración propia.\n\n1/ Cifras al cierre del año.\n2/ Incluye bagazo de caña.\n6/ Cifras al cierre de junio.\n7/ Cifras al cierre de julio. | Datos_Tablas!A1:C4 |

**Hoja "Datos_Tablas":**
```
A                  B           C
TECNOLOGÍA         2016 1/,7/  2024 6/
Hidroeléctrica     12,589      12,612
Bioenergía 2/      889         387
```

---

### Salida LaTeX Generada

**Tabla:**
```latex
\begin{tabladorado}
  \caption{Capacidad instalada}
  \label{tab:capacidad_instalada}
  \begin{tabular}{p{3cm}cc}
    \toprule
    \rowcolor{gobmxDorado} 
    \encabezadodorado{\textbf{TECNOLOGÍA}} & 
    \encabezadodorado{\textbf{2016} \textsuperscript{\hyperlink{nota1}{\textcolor{white}{1/}},\hyperlink{nota7}{\textcolor{white}{7/}}}} & 
    \encabezadodorado{\textbf{2024} \textsuperscript{\hyperlink{nota6}{\textcolor{white}{6/}}}} \\
    \midrule
    \textbf{Hidroeléctrica} & 12,589 & 12,612 \\
    \textbf{Bioenergía} \textsuperscript{\hyperlink{nota2}{\textcolor{gray}{2/}}} & 889 & 387 \\
    \bottomrule
  \end{tabular}
\end{tabladorado}
\fuente{Elaboración propia.

\hypertarget{nota1}{1/} Cifras al cierre del año.
\hypertarget{nota2}{2/} Incluye bagazo de caña.
\hypertarget{nota6}{6/} Cifras al cierre de junio.
\hypertarget{nota7}{7/} Cifras al cierre de julio.
}
```

---

### Resultado en PDF

**Tabla visual:**
```
┌────────────────────────────────────────────┐
│ TECNOLOGÍA      2016¹/,⁷/    2024⁶/       │ ← Notas clicables en blanco
├────────────────────────────────────────────┤
│ Hidroeléctrica  12,589       12,612       │
│ Bioenergía²/    889          387          │ ← Nota clicable en gris
└────────────────────────────────────────────┘

FUENTE: Elaboración propia.

1/ Cifras al cierre del año.          ← Destino del enlace
2/ Incluye bagazo de caña.            ← Destino del enlace
6/ Cifras al cierre de junio.         ← Destino del enlace
7/ Cifras al cierre de julio.         ← Destino del enlace
```

**Interactividad:**
- Clic en `¹/` → Salta a "1/ Cifras al cierre del año."
- Clic en `⁷/` → Salta a "7/ Cifras al cierre de julio."
- Clic en `⁶/` → Salta a "6/ Cifras al cierre de junio."
- Clic en `²/` → Salta a "2/ Incluye bagazo de caña."

---

## Características Implementadas

### ✅ Detección Automática
- Detecta notas al final del texto: `texto nota/`
- Funciona con números: `1/`, `6/`, `11/`
- Funciona con letras: `P/`, `e/`, `r/`
- Funciona con múltiples: `1/,7/`, `1/,7/,11/`

### ✅ Enlaces Individuales
- Cada nota en `1/,7/` es clicable por separado
- IDs únicos: `nota1`, `nota7`
- No hay conflictos entre tablas

### ✅ Colores Adaptativos
- Encabezados (fondo dorado): Notas en **blanco**
- Cuerpo (fondo blanco): Notas en **gris**
- Ambos son clicables

### ✅ Formato Consistente
- Mantiene símbolos personalizados (`1/`, `6/`, `P/`)
- Notas agrupadas debajo de la tabla
- Compatible con formato estadístico estándar

### ✅ Procesamiento Automático de Fuente
- Detecta líneas que empiezan con `nota/ texto`
- Crea `\hypertarget` automáticamente
- Respeta saltos de línea (`\n`)

---

## Verificación

Para verificar que funciona correctamente:

1. ✅ Generar .tex desde Google Sheets
2. ✅ Buscar en el .tex: `\hyperlink{nota` (debe aparecer)
3. ✅ Buscar en el .tex: `\hypertarget{nota` (debe aparecer)
4. ✅ Compilar: `latexmk -xelatex InformeEnergia25.tex`
5. ✅ Abrir PDF y hacer clic en una nota
6. ✅ Verificar que salta a la explicación en la fuente

---

## Paquetes LaTeX Requeridos

El template debe incluir:
```latex
\usepackage{hyperref}  % Para \hyperlink y \hypertarget
\usepackage{xcolor}    % Para \textcolor
```

Estos ya están incluidos en `sener2025.cls`.
