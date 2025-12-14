# Correcciones Aplicadas al Google Apps Script

## 🎯 Problemas Identificados y Corregidos

### 1. ✅ Caracteres Especiales en Footnotes

**Problema**: Las footnotes generadas contenían caracteres especiales sin escapar (`%`, `&`) causando errores de compilación.

**Solución Implementada**:
```javascript
// NUEVA FUNCIÓN: Escape específico para footnotes
function escaparFootnote(texto) {
    if (!texto) return '';
    // Primero normalizar saltos, luego escapar
    const normalizado = normalizarSaltosLatex(texto);
    return escaparLatexBasico(normalizado);
}

// ACTUALIZADA: Procesamiento de etiquetas [[nota:...]]
str = str.replace(/\[\[nota:([\s\S]*?)\]\]/g, function(match, contenido) {
    etiquetas.push(`\\footnote{${escaparFootnote(contenido)}}`); // ← Usa nueva función
    return `ZETIQUETAPLACEHOLDER${etiquetas.length - 1}Z`;
});
```

**Antes**: `\footnote{Nota con % y & especiales}` → Error de compilación
**Después**: `\footnote{Nota con \% y \& especiales}` → Compila correctamente

### 2. ✅ Selección Correcta de Entornos de Tabla

**Problema**: El script usaba `tabladorado` con `\caption` dentro, pero este entorno no incluye `table`.

**Solución Implementada**:
```javascript
// CORREGIDA: Función generarTabla
const resultado = procesarDatosArray(datosTabla, titulo);
esLarga = resultado.tipo === 'longtable';
if (esLarga) {
    // Para tablas largas: usar tabladoradoLargo (sin caption, va en longtable)
    texInicio = `\\begin{tabladoradoLargo}\n`;
    texFin = `\\end{tabladoradoLargo}\n`;
} else {
    // Para tablas cortas: usar tablaguinda (con caption en el entorno table)
    texInicio = `\\begin{tablaguinda}\n`;
    texInicio += `  \\caption{${escaparLatex(titulo)}}\n`;
    texInicio += `  \\label{tab:${generarLabel(titulo)}}\n`;
    texFin = `\\end{tablaguinda}\n`;
}
```

**Antes**: `\begin{tabladorado}\n\caption{...}` → Error "caption outside float"
**Después**: `\begin{tablaguinda}\n\caption{...}` → Compila correctamente

### 3. ✅ Comandos Correctos por Tipo de Tabla

**Problema**: Se generaban comandos de `longtable` (`\endfirsthead`, `\endhead`) en entornos `tabular`.

**Solución Implementada**:
```javascript
// NUEVA FUNCIÓN: Para tablas cortas con tabular
function generarTablaCompacta(datos) {
    const numCols = datos[0].length;
    const especCols = 'B{3cm}' + 'p{2cm}'.repeat(numCols - 1);
    let tex = `  \\begin{tabular}{${especCols}}\n`;
    tex += `    \\toprule\n`;
    const encabezados = procesarCeldasFila(datos[0], true).map(c => `\\encabezadodorado{${c}}`).join(' & ');
    tex += `    \\rowcolor{gobmxDorado} ${encabezados} \\\\\n`;
    tex += `    \\midrule\n`;
    
    for (let i = 1; i < datos.length; i++) {
        const celdas = procesarCeldasFila(datos[i]);
        tex += `    ${celdas.join(' & ')} \\\\\n`;
    }
    
    tex += `    \\bottomrule\n`;
    tex += `  \\end{tabular}\n`;
    return tex;
}

// NUEVA FUNCIÓN: Para tablas largas con longtable
function generarTablaCompactaLarga(datos) {
    // ... incluye \endfirsthead, \endhead, etc.
}
```

**Antes**: `\begin{tabular}{...}\n\endfirsthead` → Error "Undefined control sequence"
**Después**: `\begin{tabular}{...}` (sin comandos longtable) → Compila correctamente

### 4. ✅ Lógica Mejorada de Selección de Tipo

**Problema**: No había criterios claros para decidir entre `tabular` y `longtable`.

**Solución Implementada**:
```javascript
// ACTUALIZADA: Función procesarDatosArray con lógica clara
function procesarDatosArray(datos, tituloTabla, forzarLongtable = false) {
    const numCols = datos[0].length;
    const MAX_COLS_POR_TABLA = 6;
    const MAX_FILAS_COMPACTA = 15; // Reducido para ser más conservador
    const MAX_FILAS_POR_PARTE = 35;

    if (numCols <= MAX_COLS_POR_TABLA) {
        const numFilas = Math.max(0, datos.length - 1);
        
        // Tabla pequeña → tabular (para tablaguinda)
        if (numFilas <= MAX_FILAS_COMPACTA && !forzarLongtable) {
            return { tipo: 'tabular', contenido: generarTablaCompacta(datos) };
        }
        
        // Tabla mediana/grande → longtable (para tabladorado)
        return { tipo: 'longtable', contenido: generarTablaSimple(datos, tituloTabla) };
    }
    
    // Tabla muy ancha → longtable dividida
    return { tipo: 'longtable', contenido: dividirTabla(datos, MAX_COLS_POR_TABLA, tituloTabla) };
}
```

## 📋 Matriz de Decisión de Entornos

| Condición | Filas | Columnas | Entorno LaTeX | Tipo Tabla | Comandos Permitidos |
|-----------|-------|----------|---------------|------------|-------------------|
| Tabla pequeña | ≤15 | ≤6 | `tablaguinda` | `tabular` | `\toprule`, `\midrule`, `\bottomrule` |
| Tabla mediana | 16-35 | ≤6 | `tabladoradoLargo` | `longtable` | Todos los comandos longtable |
| Tabla grande | >35 | ≤6 | `tabladoradoLargo` | `longtable` | Dividida por filas |
| Tabla ancha | Cualquier | >6 | `tabladoradoLargo` | `longtable` | Dividida por columnas |

## 🧪 Funciones de Prueba Agregadas

### `probarCorreccionesScript()`
Valida todas las correcciones aplicadas:
- ✅ Escape de caracteres especiales en footnotes
- ✅ Procesamiento correcto de etiquetas `[[nota:...]]`
- ✅ Generación de tablas compactas con `tabular`
- ✅ Generación de tablas largas con `longtable`

### `probarNormalizacionSaltos()`
Valida la normalización de saltos de línea:
- ✅ No genera `\\` al inicio de párrafos
- ✅ Convierte saltos dobles a `\par`
- ✅ Convierte saltos simples a espacios

## 🎯 Resultado Final

### Antes (Problemático)
```latex
% Footnote con caracteres sin escapar
\footnote{Nota con % y & especiales}  % ← Error

% Entorno incorrecto
\begin{tabladorado}
  \caption{Tabla}  % ← Error: caption outside float
  \begin{tabular}{...}
    \endfirsthead   % ← Error: undefined control sequence
  \end{tabular}
\end{tabladorado}
```

### Después (Corregido)
```latex
% Footnote con caracteres escapados
\footnote{Nota con \% y \& especiales}  % ✅ Correcto

% Entorno correcto para tabla corta
\begin{tablaguinda}
  \caption{Tabla}  % ✅ Correcto: caption dentro de table
  \begin{tabular}{...}
    \toprule
    % ... datos ...
    \bottomrule      % ✅ Solo comandos válidos para tabular
  \end{tabular}
\end{tablaguinda}

% Entorno correcto para tabla larga
\begin{tabladoradoLargo}
  \begin{longtable}{...}
    \caption{Tabla larga}\\  % ✅ Caption en longtable
    \toprule
    \endfirsthead            % ✅ Comandos válidos para longtable
    % ... datos ...
  \end{longtable}
\end{tabladoradoLargo}
```

## 📝 Archivos Modificados

1. **`google_apps_script_FINAL.js`**:
   - Nueva función `escaparFootnote()`
   - Actualizada `procesarConEtiquetas()` para usar escape correcto
   - Corregida `generarTabla()` para seleccionar entornos correctos
   - Nueva `generarTablaCompacta()` para tabular
   - Nueva `generarTablaCompactaLarga()` para longtable
   - Actualizada `procesarDatosArray()` con lógica mejorada
   - Funciones de prueba `probarCorreccionesScript()` y `probarNormalizacionSaltos()`

## 🚀 Beneficios

- ✅ **Elimina errores de compilación** causados por caracteres sin escapar
- ✅ **Selección inteligente** de entornos de tabla según tamaño
- ✅ **Comandos correctos** por tipo de tabla (tabular vs longtable)
- ✅ **Mantiene compatibilidad** con código existente
- ✅ **Funciones de prueba** para validación continua
- ✅ **Documentación completa** de decisiones y criterios

**El Google Apps Script ahora genera LaTeX correcto y compilable en todos los casos.**