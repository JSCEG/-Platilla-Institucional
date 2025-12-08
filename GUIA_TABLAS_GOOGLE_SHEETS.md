# Guía: Cómo Estructurar Tablas en Google Sheets

## 📋 Estructura General

Para que el script genere tablas correctamente en LaTeX, necesitas **DOS hojas** en tu Google Sheets:

1. **Hoja "Tablas"** - Metadatos de las tablas
2. **Hoja "Datos_Tablas"** (o "Datos Tablas") - Los datos reales de las tablas

---

## 🗂️ HOJA 1: "Tablas" (Metadatos)

Esta hoja contiene la información sobre cada tabla:

### Columnas requeridas:

| DocumentoID | SeccionOrden | OrdenTabla | Titulo | Fuente | DatosCSV |
|-------------|--------------|------------|--------|--------|----------|
| D01 | 2.0 | 1.0 | Capacidad instalada de generación eléctrica | Elaboración propia | Datos_Tablas!A1:E4 |
| D01 | 3.0 | 2.0 | Consumo final de energía por sector | Cálculos SENER | Datos_Tablas!A7:E13 |

### Explicación de cada columna:

- **DocumentoID**: ID del documento (ej: D01)
- **SeccionOrden**: Número de orden de la sección donde aparecerá la tabla (debe coincidir con el Orden en la hoja "Secciones")
- **OrdenTabla**: Orden de la tabla dentro de esa sección (1, 2, 3...)
- **Titulo**: Título descriptivo de la tabla
- **Fuente**: Fuente de los datos (aparecerá debajo de la tabla)
- **DatosCSV**: Referencia al rango en la hoja de datos

---

## 📊 HOJA 2: "Datos_Tablas" (Datos Reales)

Esta hoja contiene los datos de TODAS las tablas, organizados en bloques.

### ⚠️ IMPORTANTE: Formato de Referencia

En la columna **DatosCSV** de la hoja "Tablas", usa el formato:

```
NombreHoja!RangoInicio:RangoFin
```

**Ejemplos válidos:**
- `Datos_Tablas!A1:E4` ✅
- `Datos Tablas!A1:E4` ✅ (con espacio también funciona)
- `Datos_Tablas!A7:C13` ✅

### Ejemplo de estructura en "Datos_Tablas":

```
     A              B        C        D        E
1  Tecnología    2020 6/  2021 6/  2022 6/  2023 6/
2  Hidroeléctrica  12,611.93  975.6  7,512.165  7,960.943
3  Geotermoeléctrica  975.6  7,512.165  7,960.943  387.342
4  Eoloeléctrica  7,512.165  7,960.943  387.342  29,447.98
5
6  (espacio vacío para separar tablas)
7  Sector         2020     2021     2022     2023
8  Transporte     45.2     46.1     47.3     48.5
9  Industrial     32.1     31.8     31.2     30.9
10 Residencial    15.3     15.6     15.9     16.2
```

### 📐 Reglas importantes:

1. **Primera fila = Encabezados**: La primera fila del rango será el encabezado (con fondo dorado)
2. **Primera columna en negritas**: Los datos de la primera columna aparecerán en negritas
3. **Separación entre tablas**: Deja al menos una fila vacía entre diferentes tablas
4. **Números con decimales**: Se redondearán automáticamente a máximo 4 decimales

---

## 🎯 Ejemplo Completo

### En la hoja "Tablas":

| DocumentoID | SeccionOrden | OrdenTabla | Titulo | Fuente | DatosCSV |
|-------------|--------------|------------|--------|--------|----------|
| D01 | 2.0 | 1.0 | Capacidad instalada por tecnología | SENER 2024 | Datos_Tablas!A1:E5 |

### En la hoja "Datos_Tablas":

```
     A                    B           C           D           E
1  TECNOLOGÍA          2024 6/     2025 6/     2026 6/     2027 6/
2  Hidroeléctrica      12,611.93   12,800.00   13,000.00   13,200.00
3  Geotermoeléctrica   975.6       980.0       985.0       990.0
4  Eoloeléctrica       7,512.165   8,000.00    8,500.00    9,000.00
5  Fotovoltaica        7,960.943   8,500.00    9,200.00    10,000.00
```

**Nota:** Los símbolos como `6/`, `P/`, `e/`, `1/` en los encabezados se mantienen tal cual y aparecerán en la tabla.

### Resultado en LaTeX:

El script generará automáticamente:

```latex
\begin{tabladorado}
  \caption{Capacidad instalada por tecnología}
  \label{tab:capacidad_instalada_por_te}
  \begin{tabular}{p{3cm}cccc}
    \toprule
    \rowcolor{gobmxDorado} \encabezadodorado{\textbf{TECNOLOGÍA}} & \encabezadodorado{\textbf{2024 6/}} & ... \\
    \midrule
    \textbf{Hidroeléctrica} & 12,611.93 & 12,800 & 13,000 & 13,200 \\
    \textbf{Geotermoeléctrica} & 975.6 & 980 & 985 & 990 \\
    ...
    \bottomrule
  \end{tabular}
\end{tabladorado}
\fuente{SENER 2024}
```

---

## 🔧 Tablas Grandes (División Automática)

El script divide automáticamente tablas grandes:

- **Más de 6 columnas**: Se divide en múltiples partes horizontalmente
- **Más de 20 filas**: Se usa `longtable` para permitir saltos de página
- **Más de 35 filas**: Se divide en partes con notas de continuación

No necesitas hacer nada especial, el script lo maneja automáticamente.

---

## ✅ Checklist antes de generar

- [ ] Hoja "Tablas" existe con las 6 columnas requeridas
- [ ] Hoja "Datos_Tablas" (o "Datos Tablas") existe con los datos
- [ ] Las referencias en DatosCSV usan el formato correcto: `NombreHoja!A1:E4`
- [ ] La primera fila de cada rango son los encabezados
- [ ] Los rangos no se solapan entre diferentes tablas
- [ ] SeccionOrden coincide con el Orden de la sección donde quieres la tabla

---

## 🐛 Solución de Problemas

### Error: "No se encontró la hoja Datos_Tablas"
- Verifica que el nombre de la hoja sea exacto
- Prueba con "Datos Tablas" (con espacio) si usaste guion bajo

### Error: "No se encontró el rango"
- Verifica que el rango existe en la hoja
- Asegúrate de usar el formato: `NombreHoja!A1:E4`

### La tabla no aparece
- Verifica que SeccionOrden coincida con el Orden de una sección existente
- Revisa que DocumentoID sea el correcto

### Números con muchos decimales
- El script redondea automáticamente a 4 decimales máximo
- Si quieres menos decimales, redondea en Google Sheets antes

---

## � Cómo AAgregar Notas al Pie de Tabla

Las notas al pie de tabla se agregan en la columna **Fuente** de la hoja "Tablas". Puedes incluir tanto la fuente como las notas explicativas.

### Ejemplo 1: Tabla con notas simples

**En la hoja "Tablas":**

| DocumentoID | SeccionOrden | OrdenTabla | Titulo | Fuente | DatosCSV |
|-------------|--------------|------------|--------|--------|----------|
| D01 | 2.0 | 1.0 | Capacidad instalada por tecnología | Elaboración propia con datos de SENER.\n\n6/ Cifras al cierre de junio.\nP/ Cifras preliminares.\ne/ Cifras estimadas. | Datos_Tablas!A1:E5 |

**En la hoja "Datos_Tablas":**

```
     A                    B           C           D           E
1  TECNOLOGÍA          2024 6/     2025 P/     2026 e/     2027 e/
2  Hidroeléctrica      12,611.93   12,800.00   13,000.00   13,200.00
3  Geotermoeléctrica   975.6       980.0       985.0       990.0
4  Eoloeléctrica       7,512.165   8,000.00    8,500.00    9,000.00
5  Fotovoltaica        7,960.943   8,500.00    9,200.00    10,000.00
```

**Resultado en LaTeX:**

```latex
\begin{tabladorado}
  \caption{Capacidad instalada por tecnología}
  \label{tab:capacidad_instalada_por_te}
  \begin{tabular}{p{3cm}cccc}
    \toprule
    \rowcolor{gobmxDorado} \encabezadodorado{\textbf{TECNOLOGÍA}} & \encabezadodorado{\textbf{2024 6/}} & \encabezadodorado{\textbf{2025 P/}} & ... \\
    \midrule
    \textbf{Hidroeléctrica} & 12,611.93 & 12,800 & 13,000 & 13,200 \\
    ...
    \bottomrule
  \end{tabular}
\end{tabladorado}
\fuente{Elaboración propia con datos de SENER.

6/ Cifras al cierre de junio.
P/ Cifras preliminares.
e/ Cifras estimadas.}
```

### Ejemplo 2: Tabla con múltiples notas numeradas

**En la hoja "Tablas":**

| Fuente |
|--------|
| Elaboración propia.\n\n1/ Incluye generación distribuida.\n2/ No incluye autoabastecimiento.\n3/ Datos sujetos a revisión. |

**En la hoja "Datos_Tablas":**

```
     A                         B           C           D
1  TECNOLOGÍA               2024        2025 1/     2026 2/
2  Hidroeléctrica           12,611.93   12,800.00   13,000.00
3  Solar Fotovoltaica 3/    7,960.943   8,500.00    9,200.00
```

### Ejemplo 3: Notas con símbolos especiales

**Símbolos comunes en tablas estadísticas:**

- `6/` = Cifras al cierre de junio
- `12/` = Cifras al cierre de diciembre
- `P/` = Cifras preliminares
- `e/` = Cifras estimadas
- `r/` = Cifras revisadas
- `1/`, `2/`, `3/` = Notas numeradas
- `*` = Nota especial
- `**` = Segunda nota especial
- `a/`, `b/`, `c/` = Notas con letras

**Combinación de símbolos:**

- `2016 1/,7/` = Aplican notas 1/ y 7/
- `2017 1/,11/` = Aplican notas 1/ y 11/
- `Dato P/,e/` = Preliminar y estimado
- `Valor 1/,2/,3/` = Aplican notas 1/, 2/ y 3/

**Ejemplo completo:**

```
     A                    B           C           D           E
1  Sector               2023 12/    2024 6/     2024 P/     2025 e/
2  Transporte *         45.2        46.1        47.3        48.5
3  Industrial 1/        32.1        31.8        31.2        30.9
4  Residencial          15.3        15.6        15.9        16.2
5  Agropecuario 2/      7.4         7.5         7.6         7.7
```

**Fuente correspondiente:**

```
Cálculos de la Unidad de Planeación con datos de SIE–SENER.

12/ Cifras al cierre de diciembre.
6/ Cifras al cierre de junio.
P/ Cifras preliminares.
e/ Cifras estimadas.
* Incluye transporte terrestre, aéreo y marítimo.
1/ No incluye sector minero.
2/ Incluye pesca y silvicultura.
```

### 💡 Consejos para Notas al Pie

1. **Usa `\n\n` para separar** la fuente de las notas (doble salto de línea)
2. **Orden lógico**: Primero la fuente, luego las notas en orden de aparición
3. **Consistencia**: Usa el mismo formato de notas en todo el documento
4. **Claridad**: Las notas deben ser breves y específicas
5. **Símbolos en encabezados**: Coloca los símbolos directamente en los encabezados de columna
6. **Símbolos en filas**: Coloca los símbolos junto al texto en la primera columna
7. **Múltiples notas**: Separa con coma sin espacios: `2016 1/,7/` o `Dato 1/,2/,3/`
8. **Orden de notas**: Lista las notas en el orden en que aparecen por primera vez en la tabla

### Ejemplo 4: Tabla Compleja con Múltiples Notas (Caso Real)

Este es un ejemplo real de una tabla de capacidad instalada con múltiples años y notas:

**En la hoja "Tablas":**

| DocumentoID | SeccionOrden | OrdenTabla | Titulo | Fuente | DatosCSV |
|-------------|--------------|------------|--------|--------|----------|
| D01 | 2.0 | 1.0 | Capacidad instalada de generación eléctrica por tecnología | Elaboración propia con datos del Sistema de Información Energética (SIE) de la Secretaría de Energía.\n\n1/ Cifras al cierre del año.\n2/ Incluye bagazo de caña, biogás y residuos sólidos urbanos.\n3/ Incluye combustóleo, diésel y gas natural en ciclo simple.\n4/ Unidades de respaldo y emergencia.\n5/ Cifras al cierre de mayo.\n6/ Cifras al cierre de junio.\n7/ Cifras al cierre de julio.\n8/ Generación Distribuida registrada en el SIE.\n9/ Fondo para el Incentivo de Energías Renovables en la Agricultura.\n10/ Cifras al cierre de octubre.\n11/ Cifras al cierre de noviembre. | Datos_Tablas!A1:M18 |

**En la hoja "Datos_Tablas":**

```
     A                           B          C          D              E                F                G                H                I                J                K                L          M
1  TECNOLOGÍA                  2014 1/    2015 1/    2016 1/,7/     2017 1/,11/      2018 1/,10/      2019 1/,10/      2020 1/,5/       2021 1/,5/       2022 1/,5/       2023 1/,5/       2024 6/
2  Hidroeléctrica              12,552     12,560     12,589         12,612           12,612           12,612           12,612           12,614           12,613           12,612           12,612
3  Geotermoeléctrica           874        899        909            899              899              899              951              976              976              976              976
4  Eoloeléctrica               2,660      2,877      3,735          3,898            4,866            6,050            6,504            6,977            6,921            7,055            7,512
5  Fotovoltaica                55         57         145            171              1,878            3,646            5,149            5,955            6,515            7,437            7,961
6  Bioenergía 2/               233        233        889            374              375              375              378              378              408              407              387
7  Suma limpia renovable       16,374     16,626     18,267         17,954           20,629           23,582           25,594           26,899           27,433           28,487           29,448
8  Nucleoeléctrica             1,400      1,510      1,608          1,608            1,608            1,608            1,608            1,608            1,608            1,608            1,608
9  Cogeneración Eficiente      819        943        1,036          1,322            1,709            1,710            2,305            2,305            2,308            2,322            2,293
10 Frenos Regenerativos        0          0          0              0                0                0                0                7                7                7                7
11 Generación Distribuida 8/   0          0          0              0                0                0                0                0                0                24               248
12 FIRCO 9/                    0          0          0              0                0                0                0                13               14               0                0
13 Hibrido Baterías-FV Solar  0          0          0              0                0                0                0                0                20               329              292
14 Suma limpia no renovable    2,227      2,472      2,912          2,930            3,317            3,318            3,913            3,913            3,936            3,962            3,993
15 Total energía limpia        18,600     19,098     21,179         20,883           23,946           26,900           29,506           30,812           31,369           32,449           33,441
16 Ciclo combinado             22,699     22,949     27,274         25,340           27,393           30,402           31,948           33,640           34,413           35,178           35,669
17 Térmica convencional 3/     12,665     12,665     13,174         12,665           12,315           11,831           11,809           11,793           11,343           11,300           11,300
18 Turbogás 4/                 2,399      2,849      5,052          2,960            2,960            2,960            3,545            3,744            3,815            3,888            3,953
19 Combustión interna          540        540        1,453          739              880              891              850              701              728              729              717
20 Carboeléctrica              5,463      5,463      5,378          5,463            5,463            5,463            5,463            5,463            5,463            5,463            5,463
21 TOTAL                       62,366     63,564     73,510         68,050           72,958           78,447           83,121           86,153           87,130           89,008           90,543
```

**Cómo se vería en el PDF:**

La tabla aparecerá con:
- Encabezados con fondo dorado
- Primera columna en negritas
- Debajo de la tabla, las notas al pie:

```
Fuente: Elaboración propia con datos del Sistema de Información Energética (SIE) 
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

**💡 Notas importantes sobre esta tabla:**

**1. Múltiples notas en encabezados:**

Observa cómo algunos años tienen **múltiples notas separadas por coma**:

- `2016 1/,7/` → Aplican las notas 1/ (cierre de año) y 7/ (cierre de julio)
- `2017 1/,11/` → Aplican las notas 1/ (cierre de año) y 11/ (cierre de noviembre)
- `2018 1/,10/` → Aplican las notas 1/ (cierre de año) y 10/ (cierre de octubre)

✅ **Formato correcto:** `2016 1/,7/` (sin espacios después de la coma)
❌ **Formato incorrecto:** `2016 1/, 7/` o `2016 1/ 7/`

**2. División automática de tabla grande:**

Como tiene 13 columnas (más de 6), el script la dividirá automáticamente en 2 o 3 partes:

- **Parte 1**: TECNOLOGÍA + columnas 2014-2018 (6 columnas)
- **Parte 2**: TECNOLOGÍA + columnas 2019-2023 (6 columnas)  
- **Parte 3**: TECNOLOGÍA + columna 2024 (2 columnas)

Cada parte mantendrá la primera columna (TECNOLOGÍA) para facilitar la lectura.

**3. Notas en filas:**

Algunas tecnologías también tienen notas:
- `Bioenergía 2/` → Aplica la nota 2/
- `Térmica convencional 3/` → Aplica la nota 3/
- `Turbogás 4/` → Aplica la nota 4/
- `Generación Distribuida 8/` → Aplica la nota 8/
- `FIRCO 9/` → Aplica la nota 9/

### ⚠️ Reglas Importantes para Notas al Pie

1. **Ubicación de las notas:**
   - Las **explicaciones** van en la columna **Fuente** de la hoja "Tablas"
   - Los **símbolos** (1/, 6/, P/, etc.) van directamente en los datos de "Datos_Tablas"

2. **Múltiples notas en un mismo lugar:**
   - Usa **coma sin espacios**: `2016 1/,7/` ✅
   - NO uses espacios: `2016 1/, 7/` ❌
   - Aplica tanto en encabezados como en filas

3. **Formato en Google Sheets:**
   - Usa **Alt+Enter** para crear saltos de línea dentro de una celda
   - Deja una línea en blanco entre la fuente y las notas
   - Lista las notas en orden numérico o de aparición

4. **Orden de las notas:**
   - Primero escribe la fuente de los datos
   - Luego lista todas las notas en orden (1/, 2/, 3/... o por aparición)
   - Cada nota en una línea separada

5. **Estilo automático de notas:**
   - El script detecta automáticamente las notas al final del texto
   - Las convierte en **superíndice color gris** para distinguirlas
   - Ejemplos: `2024 6/` → `2024⁶/` (en gris y elevado)
   - Funciona con notas simples (`6/`) y múltiples (`1/,7/,11/`)

6. **El script respeta:**
   - Los saltos de línea (`\n`) en el campo Fuente
   - Los símbolos tal como los escribas en los datos
   - Las comas que separan múltiples notas

---

---

## 🎨 Estilo Automático de Notas

El script aplica automáticamente **superíndice en color gris** a todas las notas en las tablas.

### Cómo se ven las notas:

**Lo que escribes en Google Sheets:**
```
Encabezado: 2024 6/
Encabezado: 2016 1/,7/
Cuerpo: Bioenergía 2/
Cuerpo: Térmica convencional 3/
```

**Cómo aparece en el PDF:**
```
2024⁶/                    (6/ en superíndice BLANCO - en encabezado dorado)
2016¹/,⁷/                 (1/,7/ en superíndice BLANCO - en encabezado dorado)
Bioenergía²/              (2/ en superíndice GRIS - en cuerpo de tabla)
Térmica convencional³/    (3/ en superíndice GRIS - en cuerpo de tabla)
```

**💡 Diferencia de color:**
- **Encabezados (fondo dorado)**: Notas en **blanco** para mejor contraste
- **Cuerpo de tabla (fondo blanco)**: Notas en **gris** para distinguirlas del contenido

### Código LaTeX generado:

**Encabezados (fondo dorado):**
```latex
2024 \textsuperscript{\textcolor{white}{6/}}
2016 \textsuperscript{\textcolor{white}{1/,7/}}
```

**Cuerpo de tabla:**
```latex
\textbf{Bioenergía} \textsuperscript{\textcolor{gray}{2/}}
\textbf{Térmica convencional} \textsuperscript{\textcolor{gray}{3/}}
```

### Ventajas de este estilo:

- ✅ **Profesional**: Estilo académico estándar
- ✅ **Distinguible**: Colores adaptativos (blanco en encabezados, gris en cuerpo)
- ✅ **Legible**: Buen contraste en ambos contextos (fondo dorado y fondo blanco)
- ✅ **Compacto**: Ahorra espacio en la tabla
- ✅ **Automático**: No necesitas hacer nada especial, el script lo detecta
- ✅ **Compatible**: Funciona con notas simples y múltiples
- ✅ **No son enlaces**: Los superíndices son solo visuales, no clicables

### Notas detectadas automáticamente:

El script detecta estos patrones al **final** del texto:

- Números: `1/`, `6/`, `11/`, `123/`
- Letras: `P/`, `e/`, `r/`, `a/`
- Múltiples: `1/,7/`, `1/,7/,11/`, `P/,e/`
- Combinadas: `1/,P/`, `6/,e/`

**⚠️ Importante:** Las notas deben estar **al final** del texto para ser detectadas.

✅ Correcto: `2024 6/`, `Bioenergía 2/`
❌ No se detecta: `6/ 2024`, `2/ Bioenergía`

---

## 📝 Notas Adicionales

- Puedes tener múltiples tablas en la misma sección (usa OrdenTabla: 1, 2, 3...)
- Las tablas se insertan automáticamente después del contenido de la sección
- El estilo (colores, fuentes) se aplica automáticamente según el template SENER
- Las notas al pie aparecen debajo de cada tabla con el comando `\fuente{}`
- Las notas dentro de la tabla se estilizan automáticamente como superíndice en gris
