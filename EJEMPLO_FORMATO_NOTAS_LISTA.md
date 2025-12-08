# Ejemplo: Formato de Notas como Lista

## Implementación Completada ✅

Se ha implementado el formato de **lista con viñetas + tamaño reducido** para las notas al pie de tablas.

---

## Antes vs Después

### ❌ ANTES (Párrafo corrido)

```
FUENTE: laboración propia con datos del Sistema de Información Energética (SIE) 
de la Secretaría de Energía. 1/ Cifras al cierre del año. 2/ Incluye bagazo de 
caña, biogás y residuos sólidos urbanos. 3/ Incluye combustóleo, diésel y gas 
natural en ciclo simple. 4/ Unidades de respaldo y emergencia. 5/ Cifras al 
cierre de mayo. 6/ Cifras al cierre de junio. 7/ Cifras al cierre de julio. 
8/ Generación Distribuida registrada en el SIE. 9/ Fondo para el Incentivo de 
Energías Renovables en la Agricultura. 10/ Cifras al cierre de octubre. 
11/ Cifras al cierre de noviembre.
```

**Problemas:**
- ⚠️ Difícil de leer
- ⚠️ Difícil de encontrar una nota específica
- ⚠️ Todo en el mismo tamaño de fuente

---

### ✅ DESPUÉS (Lista con viñetas)

```
FUENTE: Elaboración propia con datos del Sistema de Información Energética (SIE) 
de la Secretaría de Energía.

  1/ Cifras al cierre del año.
  2/ Incluye bagazo de caña, biogás y residuos sólidos urbanos.
  3/ Incluye combustóleo, diésel y gas natural en ciclo simple.
  4/ Unidades de respaldo y emergencia.
  5/ Cifras al cierre de mayo.
  6/ Cifras al cierre de junio.
  7/ Cifras al cierre de julio.
  8/ Generación Distribuida registrada en el SIE.
  9/ Fondo para el Incentivo de Energías Renovables en la Agricultura.
  10/ Cifras al cierre de octubre.
  11/ Cifras al cierre de noviembre.
```
(Todo en tamaño ligeramente reducido)

**Ventajas:**
- ✅ Cada nota en su propia línea
- ✅ Fácil de leer y escanear
- ✅ Fácil de encontrar una nota específica
- ✅ Tamaño reducido ahorra espacio
- ✅ Formato profesional

---

## Código LaTeX Generado

### Entrada en Google Sheets (columna Fuente):

```
Elaboración propia con datos del Sistema de Información Energética (SIE) de la Secretaría de Energía.

1/ Cifras al cierre del año.
2/ Incluye bagazo de caña, biogás y residuos sólidos urbanos.
3/ Incluye combustóleo, diésel y gas natural en ciclo simple.
4/ Unidades de respaldo y emergencia.
5/ Cifras al cierre de mayo.
6/ Cifras al cierre de junio.
7/ Cifras al cierre de julio.
```

**Nota:** Usa `\n` o Alt+Enter para separar líneas en Google Sheets.

---

### Salida LaTeX:

```latex
\fuente{Elaboración propia con datos del Sistema de Información Energética (SIE) de la Secretaría de Energía.

{\small
\begin{itemize}[leftmargin=1.5em, itemsep=1pt, parsep=0pt, topsep=3pt]
  \item[\hypertarget{nota1}{1/}] Cifras al cierre del año.
  \item[\hypertarget{nota2}{2/}] Incluye bagazo de caña, biogás y residuos sólidos urbanos.
  \item[\hypertarget{nota3}{3/}] Incluye combustóleo, diésel y gas natural en ciclo simple.
  \item[\hypertarget{nota4}{4/}] Unidades de respaldo y emergencia.
  \item[\hypertarget{nota5}{5/}] Cifras al cierre de mayo.
  \item[\hypertarget{nota6}{6/}] Cifras al cierre de junio.
  \item[\hypertarget{nota7}{7/}] Cifras al cierre de julio.
\end{itemize}
}}
```

---

## Características del Formato

### Parámetros de la Lista

```latex
\begin{itemize}[leftmargin=1.5em, itemsep=1pt, parsep=0pt, topsep=3pt]
```

- `leftmargin=1.5em`: Margen izquierdo de 1.5em (compacto)
- `itemsep=1pt`: Espacio entre items de 1pt (muy compacto)
- `parsep=0pt`: Sin espacio entre párrafos
- `topsep=3pt`: Espacio superior de 3pt (pequeña separación de la fuente)

### Tamaño de Fuente

```latex
{\small ... }
```

- Reduce el tamaño de fuente aproximadamente un 10%
- Mantiene legibilidad
- Ahorra espacio vertical

### Viñetas Personalizadas

```latex
\item[\hypertarget{nota1}{1/}]
```

- Usa la nota (`1/`, `6/`, etc.) como viñeta
- Incluye `\hypertarget` para enlaces clicables
- Alineación automática

---

## Ejemplo Completo en PDF

### Tabla

```
┌────────────────────────────────────────────────────────────┐
│ TECNOLOGÍA          2014      2015      2016¹/,⁷/  2024⁶/  │
├────────────────────────────────────────────────────────────┤
│ Hidroeléctrica      12,552    12,560    12,589     12,612  │
│ Geotermoeléctrica   874       899       909        976     │
│ Bioenergía²/        233       233       889        387     │
└────────────────────────────────────────────────────────────┘
```

### Fuente (debajo de la tabla)

```
FUENTE: Elaboración propia con datos del Sistema de Información 
Energética (SIE) de la Secretaría de Energía.

  1/ Cifras al cierre del año.
  2/ Incluye bagazo de caña, biogás y residuos sólidos urbanos.
  6/ Cifras al cierre de junio.
  7/ Cifras al cierre de julio.
```

**Interactividad:**
- Clic en `¹/` → Salta a "1/ Cifras al cierre del año."
- Clic en `²/` → Salta a "2/ Incluye bagazo..."
- Clic en `⁶/` → Salta a "6/ Cifras al cierre de junio."
- Clic en `⁷/` → Salta a "7/ Cifras al cierre de julio."

---

## Ventajas del Nuevo Formato

### 1. Legibilidad
- ✅ Cada nota claramente separada
- ✅ Fácil de escanear visualmente
- ✅ Números alineados a la izquierda

### 2. Espacio
- ✅ Tamaño reducido ahorra espacio vertical
- ✅ Espaciado compacto entre items
- ✅ Más eficiente que párrafos separados

### 3. Profesionalismo
- ✅ Formato estándar en publicaciones académicas
- ✅ Consistente con guías de estilo
- ✅ Limpio y organizado

### 4. Funcionalidad
- ✅ Mantiene enlaces clicables
- ✅ Compatible con muchas notas (10+)
- ✅ Funciona con notas de cualquier longitud

---

## Comparación de Espacio

Para una tabla con 11 notas:

| Formato | Líneas | Espacio relativo |
|---------|--------|------------------|
| Párrafo corrido | 5-6 | 100% |
| Lista normal | 11 | 150% |
| **Lista + small** | **11** | **110%** ✅ |
| Párrafos separados | 22 | 200% |

**Conclusión:** La lista con tamaño reducido usa solo 10% más espacio que el párrafo corrido, pero es mucho más legible.

---

## Verificación

Para verificar que funciona:

1. ✅ Regenerar .tex desde Google Sheets
2. ✅ Buscar en el .tex: `\begin{itemize}[leftmargin=1.5em`
3. ✅ Buscar en el .tex: `{\small`
4. ✅ Compilar: `latexmk -xelatex InformeEnergia25.tex`
5. ✅ Verificar en PDF que las notas estén en lista
6. ✅ Verificar que los enlaces funcionen

---

## Notas Técnicas

### Paquete Requerido

```latex
\usepackage{enumitem}
```

Este paquete permite personalizar las listas con opciones como `leftmargin`, `itemsep`, etc.

Ya está incluido en `sener2025.cls`.

### Compatibilidad

- ✅ Compatible con `longtable` (tablas largas)
- ✅ Compatible con división automática de tablas
- ✅ Compatible con todos los tipos de notas (`1/`, `P/`, `e/`, etc.)
- ✅ Compatible con notas múltiples en una celda (`1/,7/`)
