# Opciones de Formato para Notas al Pie de Tablas

## Estado Actual

Las notas aparecen en un solo párrafo corrido:

```
FUENTE: laboración propia con datos del Sistema de Información Energética (SIE) 
de la Secretaría de Energía. 1/ Cifras al cierre del año. 2/ Incluye bagazo de 
caña, biogás y residuos sólidos urbanos. 3/ Incluye combustóleo, diésel y gas 
natural en ciclo simple. 4/ Unidades de respaldo y emergencia...
```

---

## Opción 1: Lista con Viñetas (Recomendado)

Cada nota en una línea con viñeta pequeña.

**Código LaTeX:**
```latex
\fuente{Elaboración propia con datos del SIE de la Secretaría de Energía.

\begin{itemize}[leftmargin=*, itemsep=0pt, parsep=0pt, topsep=3pt]
  \item[\hypertarget{nota1}{1/}] Cifras al cierre del año.
  \item[\hypertarget{nota2}{2/}] Incluye bagazo de caña, biogás y residuos sólidos urbanos.
  \item[\hypertarget{nota3}{3/}] Incluye combustóleo, diésel y gas natural en ciclo simple.
  \item[\hypertarget{nota4}{4/}] Unidades de respaldo y emergencia.
\end{itemize}
}
```

**Resultado visual:**
```
FUENTE: Elaboración propia con datos del SIE de la Secretaría de Energía.

  1/ Cifras al cierre del año.
  2/ Incluye bagazo de caña, biogás y residuos sólidos urbanos.
  3/ Incluye combustóleo, diésel y gas natural en ciclo simple.
  4/ Unidades de respaldo y emergencia.
```

**Ventajas:**
- ✅ Cada nota en su propia línea
- ✅ Fácil de leer y escanear
- ✅ Alineación consistente
- ✅ Espaciado compacto

---

## Opción 2: Párrafos Separados

Cada nota como un pequeño párrafo.

**Código LaTeX:**
```latex
\fuente{Elaboración propia con datos del SIE de la Secretaría de Energía.

\vspace{3pt}
\noindent\hypertarget{nota1}{1/} Cifras al cierre del año.

\noindent\hypertarget{nota2}{2/} Incluye bagazo de caña, biogás y residuos sólidos urbanos.

\noindent\hypertarget{nota3}{3/} Incluye combustóleo, diésel y gas natural en ciclo simple.
}
```

**Resultado visual:**
```
FUENTE: Elaboración propia con datos del SIE de la Secretaría de Energía.

1/ Cifras al cierre del año.

2/ Incluye bagazo de caña, biogás y residuos sólidos urbanos.

3/ Incluye combustóleo, diésel y gas natural en ciclo simple.
```

**Ventajas:**
- ✅ Separación clara entre notas
- ✅ Más espacio para respirar

**Desventajas:**
- ⚠️ Ocupa más espacio vertical

---

## Opción 3: Tabla de Dos Columnas

Notas en formato de tabla (nota | explicación).

**Código LaTeX:**
```latex
\fuente{Elaboración propia con datos del SIE de la Secretaría de Energía.

\vspace{3pt}
\begin{tabular}{@{}l@{\hspace{5pt}}p{0.9\textwidth}@{}}
\hypertarget{nota1}{1/} & Cifras al cierre del año. \\
\hypertarget{nota2}{2/} & Incluye bagazo de caña, biogás y residuos sólidos urbanos. \\
\hypertarget{nota3}{3/} & Incluye combustóleo, diésel y gas natural en ciclo simple. \\
\end{tabular}
}
```

**Resultado visual:**
```
FUENTE: Elaboración propia con datos del SIE de la Secretaría de Energía.

1/  Cifras al cierre del año.
2/  Incluye bagazo de caña, biogás y residuos sólidos urbanos.
3/  Incluye combustóleo, diésel y gas natural en ciclo simple.
```

**Ventajas:**
- ✅ Alineación perfecta
- ✅ Compacto
- ✅ Profesional

---

## Opción 4: Tamaño de Fuente Reducido

Mantener formato actual pero con letra más pequeña.

**Código LaTeX:**
```latex
\fuente{{\small
Elaboración propia con datos del SIE de la Secretaría de Energía.

\hypertarget{nota1}{1/} Cifras al cierre del año. 
\hypertarget{nota2}{2/} Incluye bagazo de caña, biogás y residuos sólidos urbanos. 
\hypertarget{nota3}{3/} Incluye combustóleo, diésel y gas natural en ciclo simple.
}}
```

**Ventajas:**
- ✅ Ahorra espacio
- ✅ Distingue las notas del texto principal

---

## Opción 5: Combinado - Lista + Tamaño Reducido (MÁS RECOMENDADO)

Lista con viñetas y letra ligeramente más pequeña.

**Código LaTeX:**
```latex
\fuente{Elaboración propia con datos del SIE de la Secretaría de Energía.

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

**Resultado visual:**
```
FUENTE: Elaboración propia con datos del SIE de la Secretaría de Energía.

  1/ Cifras al cierre del año.
  2/ Incluye bagazo de caña, biogás y residuos sólidos urbanos.
  3/ Incluye combustóleo, diésel y gas natural en ciclo simple.
  4/ Unidades de respaldo y emergencia.
  5/ Cifras al cierre de mayo.
  6/ Cifras al cierre de junio.
  7/ Cifras al cierre de julio.
```
(Todo en tamaño ligeramente reducido)

**Ventajas:**
- ✅ Compacto pero legible
- ✅ Cada nota en su línea
- ✅ Ahorra espacio
- ✅ Profesional
- ✅ Fácil de escanear

---

## Comparación de Espacio

Para 7 notas:

| Opción | Líneas aprox. | Espacio |
|--------|---------------|---------|
| Actual (párrafo) | 4-5 | Medio |
| Lista normal | 7 | Alto |
| Lista + small | 7 | Medio-bajo |
| Tabla | 7 | Medio |
| Párrafos separados | 14 | Muy alto |

---

## Recomendación

**Opción 5: Lista con viñetas + tamaño reducido**

**Razones:**
1. ✅ Cada nota claramente separada
2. ✅ Fácil de leer y encontrar
3. ✅ Ahorra espacio (letra pequeña)
4. ✅ Mantiene los enlaces clicables
5. ✅ Formato profesional estándar
6. ✅ Compatible con muchas notas (10+)

---

## Implementación

Para implementar la opción recomendada, necesito modificar la función `procesarTextoFuente()` para:

1. Detectar la primera línea (fuente principal)
2. Detectar líneas de notas (empiezan con `nota/`)
3. Generar estructura de lista con `\begin{itemize}`
4. Aplicar tamaño `\small`
5. Mantener los `\hypertarget` para enlaces

¿Quieres que implemente esta opción?
