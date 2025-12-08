# Opciones para Notas en Tablas: Enlaces vs Referencias

## Diferencia Fundamental

### Opción A: Notas al Pie Tradicionales (con enlaces)
```latex
Bioenergía\footnotemark[2]

\footnotetext[2]{Incluye bagazo de caña, biogás y residuos sólidos urbanos.}
```

**Resultado:**
- Aparece como: `Bioenergía²` (superíndice clicable)
- Al hacer clic → Te lleva al pie de página con la explicación
- La nota aparece al **pie de la página**, no debajo de la tabla
- Numeración automática de LaTeX

**Ventajas:**
- ✅ Enlaces clicables
- ✅ Navegación interactiva en PDF
- ✅ Estándar LaTeX

**Desventajas:**
- ❌ Las notas aparecen al pie de **página**, no debajo de la tabla
- ❌ No puedes usar símbolos personalizados como `6/`, `P/`, `e/`
- ❌ Numeración automática (1, 2, 3...) no puedes poner `1/`, `6/`
- ❌ Si la tabla se divide en partes, las notas se dispersan

---

### Opción B: Referencias de Tabla (sin enlaces) - ACTUAL
```latex
2024 \textsuperscript{\textcolor{white}{6/}}

\fuente{Elaboración propia.

6/ Cifras al cierre de junio.}
```

**Resultado:**
- Aparece como: `2024⁶/` (superíndice NO clicable)
- Las explicaciones están debajo de la tabla en la sección FUENTE
- Símbolos personalizados: `1/`, `6/`, `P/`, `e/`, `1/,7/`

**Ventajas:**
- ✅ Todas las notas juntas debajo de la tabla
- ✅ Símbolos personalizados (estándar en tablas estadísticas)
- ✅ Múltiples notas en un mismo lugar: `2016 1/,7/`
- ✅ Consistente con el formato SENER/INEGI

**Desventajas:**
- ❌ No son clicables
- ❌ El lector debe buscar manualmente la explicación

---

## Opción C: Híbrido - Referencias Clicables (RECOMENDADO)

Podemos hacer que los símbolos sean clicables usando `\hyperlink` y `\hypertarget`:

```latex
% En la tabla
2024 \textsuperscript{\hyperlink{nota6}{\textcolor{white}{6/}}}
Bioenergía \textsuperscript{\hyperlink{nota2}{\textcolor{gray}{2/}}}

% En la fuente
\fuente{Elaboración propia.

\hypertarget{nota1}{1/} Cifras al cierre del año.
\hypertarget{nota2}{2/} Incluye bagazo de caña, biogás y residuos sólidos urbanos.
\hypertarget{nota6}{6/} Cifras al cierre de junio.
}
```

**Resultado:**
- Aparece como: `2024⁶/` (superíndice clicable en color)
- Al hacer clic → Te lleva a la explicación en la sección FUENTE
- Las notas siguen debajo de la tabla
- Símbolos personalizados funcionan

**Ventajas:**
- ✅ Enlaces clicables bidireccionales
- ✅ Símbolos personalizados (`1/`, `6/`, `P/`, etc.)
- ✅ Notas agrupadas debajo de la tabla
- ✅ Múltiples notas: `1/,7/` (cada una clicable)
- ✅ Consistente con formato estadístico

**Desventajas:**
- ⚠️ Más complejo de implementar
- ⚠️ Requiere generar IDs únicos para cada nota
- ⚠️ Notas múltiples (`1/,7/`) requieren separar y crear enlaces individuales

---

## Comparación Visual

### Opción A: Footnote Tradicional
```
Tabla X. Capacidad instalada

TECNOLOGÍA          2024
Bioenergía²         233

────────────────────────────────
² Incluye bagazo de caña...     ← Al pie de PÁGINA
```

### Opción B: Referencias (Actual)
```
Tabla X. Capacidad instalada

TECNOLOGÍA          2024
Bioenergía²/        233         ← NO clicable

FUENTE: Elaboración propia.
2/ Incluye bagazo de caña...    ← Debajo de TABLA
```

### Opción C: Referencias Clicables
```
Tabla X. Capacidad instalada

TECNOLOGÍA          2024
Bioenergía²/        233         ← CLICABLE (va a la fuente)

FUENTE: Elaboración propia.
2/ Incluye bagazo de caña...    ← Destino del enlace
```

---

## Recomendación

**Opción C: Referencias Clicables** es la mejor solución porque:

1. ✅ Mantiene el formato estándar de tablas estadísticas
2. ✅ Agrega interactividad (enlaces clicables)
3. ✅ Conserva símbolos personalizados (`1/`, `6/`, `P/`, `e/`)
4. ✅ Notas agrupadas debajo de la tabla (no dispersas al pie de página)
5. ✅ Compatible con notas múltiples (`1/,7/,11/`)

---

## Implementación de Opción C

### Cambios necesarios:

1. **Generar IDs únicos** para cada nota (ej: `nota1`, `nota6`, `notaP`)

2. **En la tabla:**
   ```javascript
   // Convertir "2024 6/" en:
   "2024 \\textsuperscript{\\hyperlink{nota6}{\\textcolor{white}{6/}}}"
   ```

3. **En la fuente:**
   ```javascript
   // Convertir "6/ Cifras al cierre..." en:
   "\\hypertarget{nota6}{6/} Cifras al cierre..."
   ```

4. **Para notas múltiples** (`1/,7/`):
   ```javascript
   // Separar y crear enlaces individuales:
   "2016 \\textsuperscript{\\hyperlink{nota1}{\\textcolor{white}{1/}},\\hyperlink{nota7}{\\textcolor{white}{7/}}}"
   ```

---

## ¿Quieres que implemente la Opción C?

Si decides implementar referencias clicables, necesitaré:

1. Modificar `estilizarNotas()` para generar `\hyperlink`
2. Modificar `procesarTextoFuente()` para agregar `\hypertarget`
3. Manejar notas múltiples (`1/,7/`) separándolas en enlaces individuales
4. Generar IDs únicos y consistentes

**Ventaja adicional:** Podríamos hacer enlaces bidireccionales (de la nota en la fuente de vuelta a la tabla).

¿Procedo con la implementación?
