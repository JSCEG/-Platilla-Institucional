# Test de Notas en Tablas - Correcciones Aplicadas

## Problemas Corregidos

### 1. ❌ Problema: `\n` literal en la fuente
**Antes:**
```
FUENTE: Elaboración propia.\n\n1/ Incluye generación distribuida.\n2/ No incluye...
```

**Después:**
```
FUENTE: Elaboración propia.

1/ Incluye generación distribuida.
2/ No incluye...
```

**Solución:** Nueva función `procesarTextoFuente()` que convierte `\n` literales en saltos de línea reales.

---

### 2. ❌ Problema: Superíndices con caracteres extraños
**Antes:**
```
2025 1/  → Aparecía con caracteres raros
```

**Después:**
```
2025¹/  → Superíndice limpio en gris
```

**Solución:** 
- Detectar notas ANTES de escapar LaTeX
- Escapar texto base y notas por separado
- Aplicar formato de superíndice después del escape

---

## Cómo Funciona Ahora

### Procesamiento de Celdas con Notas

**Entrada en Google Sheets:**
```
2025 1/
Bioenergía 2/
2016 1/,7/
```

**Proceso:**
1. Detectar patrón de nota al final: `estilizarNotas()`
2. Separar texto base de notas
3. Escapar cada parte por separado
4. Aplicar formato LaTeX: `\textsuperscript{\textcolor{gray}{...}}`

**Salida LaTeX:**
```latex
2025 \textsuperscript{\textcolor{gray}{1/}}
\textbf{Bioenergía} \textsuperscript{\textcolor{gray}{2/}}
2016 \textsuperscript{\textcolor{gray}{1/,7/}}
```

---

### Procesamiento de Fuente con Saltos de Línea

**Entrada en Google Sheets (columna Fuente):**
```
Elaboración propia.\n\n1/ Incluye generación distribuida.\n2/ No incluye autoabastecimiento.
```

**Proceso:**
1. Convertir `\n` literales en saltos de línea reales
2. Dividir en líneas
3. Escapar cada línea por separado
4. Unir con saltos de línea

**Salida LaTeX:**
```latex
\fuente{Elaboración propia.

1/ Incluye generación distribuida.
2/ No incluye autoabastecimiento.}
```

---

## Funciones Nuevas/Modificadas

### 1. `estilizarNotas(texto)`
```javascript
// Detecta notas al final del texto
// Retorna: { textoBase, notas, tieneNotas }
```

### 2. `procesarTextoFuente(texto)`
```javascript
// Convierte \n literales en saltos de línea
// Escapa LaTeX línea por línea
```

### 3. `procesarCeldasFila(fila)` - MODIFICADA
```javascript
// Ahora detecta notas ANTES de escapar
// Aplica formato de superíndice correctamente
```

---

## Resultado Esperado en PDF

### Tabla con Notas

```
┌─────────────────────────────────────────────────┐
│  A              B         C         D           │
├─────────────────────────────────────────────────┤
│  Generación     1         2025¹/    2026²/      │
│  Distribución   56        6         7           │
│  Solar          57        8         10          │
│  Fotovoltaica³/                                 │
└─────────────────────────────────────────────────┘

FUENTE: Elaboración propia.

1/ Incluye generación distribuida.
2/ No incluye autoabastecimiento.
3/ Datos sujetos a revisión.
```

**Características:**
- ✅ Notas en superíndice gris (¹/, ²/, ³/)
- ✅ Fuente con saltos de línea correctos
- ✅ Primera columna en negritas
- ✅ Encabezados con fondo dorado

---

## Prueba en Google Sheets

### Hoja "Tablas"
| DocumentoID | SeccionOrden | OrdenTabla | Titulo | Fuente | DatosCSV |
|-------------|--------------|------------|--------|--------|----------|
| D01 | 2.0 | 1.0 | Ejemplo de Notas | Elaboración propia.\n\n1/ Incluye generación distribuida.\n2/ No incluye autoabastecimiento.\n3/ Datos sujetos a revisión. | Datos_Tablas!A1:D4 |

### Hoja "Datos_Tablas"
```
A              B    C         D
Generación     1    2025 1/   2026 2/
Distribución   56   6         7
Solar          57   8         10
Fotovoltaica 3/
```

**Nota:** En Google Sheets, usa Alt+Enter para crear saltos de línea, o escribe `\n` literalmente y el script lo convertirá.

---

## Verificación

Después de generar el .tex:

1. ✅ Buscar `\textsuperscript{\textcolor{gray}` en el archivo
2. ✅ Verificar que la fuente tenga saltos de línea (no `\n` literales)
3. ✅ Compilar con `latexmk -xelatex`
4. ✅ Verificar en el PDF que las notas aparezcan en superíndice gris
