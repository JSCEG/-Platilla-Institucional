# 🔧 CORRECCIONES DEFINITIVAS - Google Apps Script LaTeX Generator

## ❌ PROBLEMA IDENTIFICADO

El archivo `google_apps_script_FINAL.js` tiene **corrupción en el código** que impide aplicar las correcciones directamente. El problema principal es:

- **`\textbackslash{}par`** aparece literalmente en el .tex generado
- **Líneas que empiezan con `\\`** causan "There's no line here to end"
- **Orden incorrecto** de procesamiento en `procesarConEtiquetas()`

## ✅ SOLUCIONES OBLIGATORIAS

### 1. **FIX: Función `normalizarSaltosLatex()` - CORREGIDA**

```javascript
/**
 * FIX: Normaliza saltos de línea para LaTeX usando ÚNICAMENTE líneas en blanco
 * NUNCA inserta comandos LaTeX (\par, \\) que puedan ser escapados después
 * NUNCA genera \\ al inicio de párrafos
 */
function normalizarSaltosLatex(str) {
    if (!str) return '';
    
    // 1. Convertir \\n literales (de Google Sheets) a saltos reales
    str = str.replace(/\\n/g, '\n');
    
    // 2. Normalizar CRLF a LF
    str = str.replace(/\r\n/g, '\n');
    str = str.replace(/\r/g, '\n');
    
    // 3. Quitar espacios y tabs al final de cada línea
    str = str.replace(/[ \t]+$/gm, '');
    
    // 4. FIX: Convertir múltiples saltos (2+) a UNA línea en blanco (\n\n)
    // SOLO líneas en blanco, NO comandos \par que se escaparían
    str = str.replace(/\n{2,}/g, '\n\n');
    
    // 5. FIX: NO convertir saltos simples a \\ ni a espacios
    // LaTeX maneja saltos simples correctamente como espacios naturales
    
    // 6. Colapsar espacios múltiples dentro de líneas
    str = str.replace(/[ \t]+/g, ' ');
    
    // 7. FIX: Trim final para eliminar espacios/saltos iniciales/finales problemáticos
    // Esto previene \\ al inicio de párrafos
    str = str.trim();
    
    return str;
}
```

### 2. **FIX: Función `validarYCorregirLatex()` - NUEVA**

```javascript
/**
 * FIX: Función de seguridad final - corrige patrones LaTeX inválidos
 * Detecta y corrige automáticamente comandos LaTeX mal escapados
 * Previene errores de compilación como "There's no line here to end"
 */
function validarYCorregirLatex(str) {
    if (!str) return str;
    
    let corregido = str;
    let cambios = [];
    
    // FIX: Detectar y corregir \textbackslash{}par
    if (corregido.includes('\\textbackslash{}par')) {
        corregido = corregido.replace(/\\textbackslash\{\}par/g, '\n\n');
        cambios.push('\\textbackslash{}par → líneas en blanco');
    }
    
    // FIX: Detectar líneas que empiezan con \\ (problemático)
    const lineasProblematicas = corregido.match(/^\\\\[^\\]/gm);
    if (lineasProblematicas) {
        corregido = corregido.replace(/^\\\\([^\\])/gm, '$1');
        cambios.push('líneas iniciando con \\\\ → texto normal');
    }
    
    // FIX: Detectar \\ inmediatamente antes de texto (\\Texto)
    if (corregido.match(/\\\\[A-Za-z]/)) {
        corregido = corregido.replace(/\\\\([A-Za-z])/g, ' $1');
        cambios.push('\\\\ antes de texto → espacio');
    }
    
    // FIX: Detectar otros comandos LaTeX mal escapados comunes
    if (corregido.includes('\\textbackslash{}begin')) {
        corregido = corregido.replace(/\\textbackslash\{\}begin/g, '\\begin');
        cambios.push('\\textbackslash{}begin → \\begin');
    }
    
    if (corregido.includes('\\textbackslash{}end')) {
        corregido = corregido.replace(/\\textbackslash\{\}end/g, '\\end');
        cambios.push('\\textbackslash{}end → \\end');
    }
    
    if (corregido.includes('\\textbackslash{}section')) {
        corregido = corregido.replace(/\\textbackslash\{\}section/g, '\\section');
        cambios.push('\\textbackslash{}section → \\section');
    }
    
    if (corregido.includes('\\textbackslash{}item')) {
        corregido = corregido.replace(/\\textbackslash\{\}item/g, '\\item');
        cambios.push('\\textbackslash{}item → \\item');
    }
    
    // FIX: Registrar correcciones con Logger.warn() si se corrige algo
    if (cambios.length > 0) {
        console.warn(`⚠️ PATRONES INVÁLIDOS CORREGIDOS: ${cambios.join(', ')}`);
        log(`⚠️ Comandos LaTeX mal escapados corregidos: ${cambios.join(', ')}`);
    }
    
    return corregido;
}
```

### 3. **FIX: Función `procesarConEtiquetas()` - ORDEN CORREGIDO**

```javascript
/**
 * FIX: Procesa texto con etiquetas completas - ORDEN LÓGICO CORREGIDO
 * Orden OBLIGATORIO: texto crudo → normalizar saltos → proteger → escapar → restaurar → validar
 * NUNCA escapa comandos LaTeX generados por el propio script
 */
function procesarConEtiquetas(texto) {
    if (!texto) return '';
    let str = texto.toString();

    // FIX: PASO 1 - NORMALIZAR SALTOS PRIMERO (antes de proteger)
    // Esto previene problemas con saltos dentro de etiquetas
    str = normalizarSaltosLatex(str);

    // FIX: PASO 2 - Extraer y proteger ECUACIONES (no escapar)
    const ecuaciones = [];
    
    // Ecuaciones en línea: $...$
    str = str.replace(/\$([^$]+)\$/g, function(match, contenido) {
        ecuaciones.push(`$${contenido}$`);
        return `ZEQPLACEHOLDER${ecuaciones.length - 1}Z`;
    });
    
    // Ecuaciones display: $$...$$
    str = str.replace(/\$\$([\s\S]*?)\$\$/g, function(match, contenido) {
        ecuaciones.push(`$$${contenido}$$`);
        return `ZEQPLACEHOLDER${ecuaciones.length - 1}Z`;
    });
    
    // Ecuaciones LaTeX: \(...\) y \[...\]
    str = str.replace(/\\\\?\(([\s\S]*?)\\\\?\)/g, function(match, contenido) {
        ecuaciones.push(`\\(${contenido}\\)`);
        return `ZEQPLACEHOLDER${ecuaciones.length - 1}Z`;
    });
    
    str = str.replace(/\\\\?\[([\s\S]*?)\\\\?\]/g, function(match, contenido) {
        ecuaciones.push(`\\[${contenido}\\]`);
        return `ZEQPLACEHOLDER${ecuaciones.length - 1}Z`;
    });

    // [[ecuacion:...]] -> \begin{equation} ... \end{equation}
    str = str.replace(/\[\[ecuacion:([\s\S]*?)\]\]/g, function(match, contenido) {
        ecuaciones.push(`\\begin{equation}\n${contenido.trim()}\n\\end{equation}`);
        return `ZEQPLACEHOLDER${ecuaciones.length - 1}Z`;
    });

    // [[math:...]] -> $ ... $
    str = str.replace(/\[\[math:([\s\S]*?)\]\]/g, function(match, contenido) {
        ecuaciones.push(`$${contenido.trim()}$`);
        return `ZEQPLACEHOLDER${ecuaciones.length - 1}Z`;
    });

    // FIX: PASO 3 - Extraer y proteger CITAS
    const citas = [];
    str = str.replace(/\[\[cita:([\s\S]*?)\]\]/g, function(match, contenido) {
        const clave = contenido.toString().trim();
        citas.push(`\\cite{${clave}}`);
        return `ZCITEPOLDER${citas.length - 1}Z`;
    });

    // FIX: PASO 4 - Extraer y proteger RECUADROS MULTI-LÍNEA
    const recuadros = [];
    str = str.replace(/\[\[recuadro:([^\]]*)\]\]([\s\S]*?)\[\[\/recuadro\]\]/g, function(match, titulo, contenido) {
        const tituloLimpio = titulo.trim();
        // FIX: NO aplicar normalización aquí, ya se hizo al inicio
        const tituloArg = tituloLimpio ? `{${tituloLimpio}}` : '';
        recuadros.push(`\\begin{recuadro}${tituloArg}\n${contenido}\n\\end{recuadro}`);
        return `ZRECUADROPLACEHOLDER${recuadros.length - 1}Z`;
    });
    
    // FIX: PASO 5 - Proteger otras etiquetas simples
    const etiquetas = [];
    
    // [[nota:...]]
    str = str.replace(/\[\[nota:([\s\S]*?)\]\]/g, function(match, contenido) {
        etiquetas.push(`\\footnote{${escaparFootnote(contenido)}}`);
        return `ZETIQUETAPLACEHOLDER${etiquetas.length - 1}Z`;
    });
    
    // [[destacado:...]]
    str = str.replace(/\[\[destacado:([\s\S]*?)\]\]/g, function(match, contenido) {
        etiquetas.push(`\\begin{destacado}\n${contenido}\n\\end{destacado}`);
        return `ZETIQUETAPLACEHOLDER${etiquetas.length - 1}Z`;
    });
    
    // [[dorado:...]]
    str = str.replace(/\[\[dorado:([\s\S]*?)\]\]/g, function(match, contenido) {
        etiquetas.push(`\\textbf{\\textcolor{gobmxDorado}{${contenido}}}`);
        return `ZETIQUETAPLACEHOLDER${etiquetas.length - 1}Z`;
    });
    
    // [[guinda:...]]
    str = str.replace(/\[\[guinda:([\s\S]*?)\]\]/g, function(match, contenido) {
        etiquetas.push(`\\textbf{\\textcolor{gobmxGuinda}{${contenido}}}`);
        return `ZETIQUETAPLACEHOLDER${etiquetas.length - 1}Z`;
    });

    // FIX: PASO 6 - ESCAPAR LaTeX SOLO en texto plano (ya normalizado y protegido)
    str = escaparLatexBasico(str);

    // FIX: PASO 7 - NORMALIZAR comillas tipográficas
    str = str.replace(/[""]/g, '"');
    str = str.replace(/['']/g, "'");

    // FIX: PASO 8 - RESTAURAR contenido protegido (comandos LaTeX válidos)
    
    // Restaurar recuadros
    str = str.replace(/ZRECUADROPLACEHOLDER(\d+)Z/g, function(match, index) {
        return recuadros[parseInt(index)];
    });
    
    // Restaurar etiquetas
    str = str.replace(/ZETIQUETAPLACEHOLDER(\d+)Z/g, function(match, index) {
        return etiquetas[parseInt(index)];
    });
    
    // Restaurar citas
    str = str.replace(/ZCITEPOLDER(\d+)Z/g, function(match, index) {
        return citas[parseInt(index)];
    });
    
    // Restaurar ecuaciones
    str = str.replace(/ZEQPLACEHOLDER(\d+)Z/g, function(match, index) {
        return ecuaciones[parseInt(index)];
    });

    // FIX: PASO 9 - VALIDACIÓN FINAL: corregir patrones inválidos
    str = validarYCorregirLatex(str);

    return str;
}
```

## 🎯 CAMBIOS CLAVE IMPLEMENTADOS

### ❌ ANTES (Problemático)
```javascript
// MALO: Insertaba \par que se escapaba
str = str.replace(/\n{2,}/g, '\n\n\\par\n\n');

// MALO: Convertía saltos simples a \\
str = str.replace(/\n/g, '\\\\\n');

// MALO: Orden incorrecto - normalizaba DESPUÉS de proteger
// 5. NORMALIZAR SALTOS en el texto restante (ANTES de escapar)
str = normalizarSaltosLatex(str);
```

### ✅ DESPUÉS (Corregido)
```javascript
// BUENO: Solo líneas en blanco, NO comandos LaTeX
str = str.replace(/\n{2,}/g, '\n\n');

// BUENO: NO convierte saltos simples
// LaTeX maneja saltos simples correctamente como espacios

// BUENO: Orden correcto - normaliza ANTES de proteger
// FIX: PASO 1 - NORMALIZAR SALTOS PRIMERO (antes de proteger)
str = normalizarSaltosLatex(str);
```

## 🚀 INSTRUCCIONES DE IMPLEMENTACIÓN

### Paso 1: Corregir el archivo corrupto
El archivo `google_apps_script_FINAL.js` tiene corrupción en las líneas de ecuaciones. Necesitas:

1. **Reemplazar** las 3 funciones completas:
   - `normalizarSaltosLatex()`
   - `validarYCorregirLatex()`
   - `procesarConEtiquetas()`

2. **Verificar** que no hay caracteres extraños en las líneas de ecuaciones

### Paso 2: Probar las correcciones
```javascript
// Ejecutar en Google Apps Script Editor
function probarCorreccionesDefinitivas() {
    console.log('=== PRUEBAS DEFINITIVAS ===');
    
    // Caso problemático original
    const textoProblema = 'Objetivo: detectar errores\\n\\nEste texto...';
    const resultado = procesarConEtiquetas(textoProblema);
    
    console.log('Entrada:', JSON.stringify(textoProblema));
    console.log('Salida:', JSON.stringify(resultado));
    console.log('✓ NO contiene \\textbackslash{}par:', !resultado.includes('\\textbackslash{}par'));
    console.log('✓ NO contiene \\par literal:', !resultado.includes('\\par'));
    console.log('✓ NO inicia con \\\\:', !resultado.startsWith('\\\\'));
    
    return 'Pruebas completadas. Revisa la consola.';
}
```

### Paso 3: Regenerar archivo .tex
Una vez corregido el script:
1. Abrir Google Sheets
2. Seleccionar documento en hoja "Documentos"
3. Menú: **📄 SENER LaTeX** → **✨ Generar .tex de este documento**
4. Verificar que el nuevo .tex NO contiene `\textbackslash{}par`

## ✅ VALIDACIÓN FINAL

El .tex generado debe:
- ✅ **NO contener** `\textbackslash{}par`
- ✅ **NO contener** líneas que empiecen con `\\`
- ✅ **Compilar sin errores** con XeLaTeX
- ✅ **NO mostrar** "There's no line here to end"

## 🎯 RESULTADO ESPERADO

### ❌ Antes
```latex
\begin{resumenejecutivo}
\textbackslash{}par Objetivo: detectar errores...  % ← Error
\end{resumenejecutivo}
```

### ✅ Después
```latex
\begin{resumenejecutivo}
Objetivo: detectar errores...

Este texto tiene párrafos separados correctamente.
\end{resumenejecutivo}
```

**Las correcciones están listas. Solo necesitas implementarlas en el archivo corrupto.**