# 📊 División Automática de Tablas

## 🎯 Funcionalidad Nueva

Si una tabla tiene **más de 6 columnas**, el sistema la divide automáticamente en múltiples partes para que quepa en la página.

---

## 🔧 Cómo Funciona

### Tabla con Pocas Columnas (≤ 6)
Se genera normalmente en una sola tabla.

**Ejemplo:**
```
Concepto | 2020 | 2021 | 2022 | 2023
```
✅ Cabe en una página → Se genera como una tabla

---

### Tabla con Muchas Columnas (> 6)
Se divide automáticamente en partes.

**Ejemplo Original:**
```
Tecnología | 2014 | 2015 | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023
```
(11 columnas total)

**Resultado - Parte 1:**
```
Tecnología | 2014 | 2015 | 2016 | 2017 | 2018
```

**Resultado - Parte 2:**
```
Continuación...

Tecnología | 2019 | 2020 | 2021 | 2022 | 2023
```

---

## 📐 Lógica de División

### Configuración:
```javascript
const MAX_COLS_POR_TABLA = 6;
```

### Cálculo:
- **Primera columna** (Tecnología, Concepto, etc.) se repite en cada parte
- **Columnas restantes** se dividen en grupos de 5 (6 - 1)
- **Partes necesarias** = ceil((totalColumnas - 1) / 5)

### Ejemplos:

| Total Columnas | Partes | Distribución |
|----------------|--------|--------------|
| 6 o menos | 1 | Todas en una tabla |
| 7-11 | 2 | Col 0 + (1-5), Col 0 + (6-10) |
| 12-16 | 3 | Col 0 + (1-5), Col 0 + (6-10), Col 0 + (11-15) |

---

## 📊 Ejemplo Visual

### Tabla Original (11 columnas):
```
A        | B    | C    | D    | E    | F    | G    | H    | I    | J    | K
Hidro    | 100  | 110  | 120  | 130  | 140  | 150  | 160  | 170  | 180  | 190
Solar    | 10   | 20   | 30   | 40   | 50   | 60   | 70   | 80   | 90   | 100
```

### Resultado en PDF:

**Tabla 2. Consumo final de energía (Parte 1)**
```
┌──────────────────────────────────────────────┐
│ Tecnología │ 2014 │ 2015 │ 2016 │ 2017 │ 2018 │
├──────────────────────────────────────────────┤
│ Hidro      │ 100  │ 110  │ 120  │ 130  │ 140  │
│ Solar      │ 10   │ 20   │ 30   │ 40   │ 50   │
└──────────────────────────────────────────────┘
```

*Continuación...*

**Tabla 2. Consumo final de energía (Parte 2)**
```
┌──────────────────────────────────────────────┐
│ Tecnología │ 2019 │ 2020 │ 2021 │ 2022 │ 2023 │
├──────────────────────────────────────────────┤
│ Hidro      │ 150  │ 160  │ 170  │ 180  │ 190  │
│ Solar      │ 60   │ 70   │ 80   │ 90   │ 100  │
└──────────────────────────────────────────────┘
```

---

## 🎨 Características

### ✅ Ventajas:
- Primera columna se repite (contexto en cada parte)
- Nota "Continuación..." entre partes
- Mismo formato institucional
- Autoajuste al ancho de página
- Números redondeados a 4 decimales

### 📋 Automático:
- Detecta cuántas columnas tiene la tabla
- Calcula cuántas partes necesita
- Divide inteligentemente
- Mantiene formato consistente

---

## 🔧 Ajustar el Número de Columnas

Si quieres cambiar cuántas columnas caben por tabla:

**En `google_apps_script_FINAL.js` línea ~776:**
```javascript
const MAX_COLS_POR_TABLA = 6;  // Cambia este número
```

### Recomendaciones:

| Columnas | Uso Recomendado |
|----------|-----------------|
| 4-5 | Tablas con texto largo en celdas |
| 6 | Balance general (recomendado) |
| 7-8 | Tablas con números cortos |

---

## 📝 Ejemplo Completo

### En Google Sheets - Hoja "Datos Tablas":

```
A: Tecnología | B: 2014 | C: 2015 | D: 2016 | E: 2017 | F: 2018 | G: 2019 | H: 2020 | I: 2021 | J: 2022 | K: 2023
Hidroeléctrica | 12551.774 | 12560.174 | 12589 | ... (11 columnas)
Geotermoeléctrica | 873.6 | 898.6 | 909 | ...
```

### Resultado en .tex:

```latex
% Parte 1
\begin{tabularx}{\textwidth}{lXXXXX}
  \toprule
  \rowcolor{gobmxDorado} \encabezadodorado{Tecnología} & \encabezadodorado{2014} & ... \\
  \midrule
  Hidroeléctrica & 12551.774 & 12560.174 & ... \\
  \bottomrule
\end{tabularx}

\vspace{0.5em}
{\small\textit{Continuación...}}

% Parte 2
\begin{tabularx}{\textwidth}{lXXXXX}
  \toprule
  \rowcolor{gobmxDorado} \encabezadodorado{Tecnología} & \encabezadodorado{2019} & ... \\
  \midrule
  Hidroeléctrica & 150 & 160 & ... \\
  \bottomrule
\end{tabularx}
```

---

## ✅ Verificación

Después de regenerar el documento:

### En el .tex:
- [ ] Busca tablas con muchas columnas
- [ ] Verifica que aparezca "Continuación..."
- [ ] Verifica que la primera columna se repita

### En el PDF:
- [ ] Todas las columnas son visibles
- [ ] No se cortan números
- [ ] Primera columna se repite en cada parte
- [ ] Formato consistente entre partes

---

## 🚀 Cómo Usar

### 1. Actualizar el Script
```
1. Copia google_apps_script_FINAL.js a Google Apps Script
2. Guarda (Ctrl+S)
```

### 2. Regenerar Documento
```
1. En Google Sheets: 📄 SENER LaTeX > ✨ Generar .tex
2. Descarga archivos
```

### 3. Compilar
```bash
xelatex InformeEnergia25.tex
```

### 4. Verificar
- Abre el PDF
- Busca tablas grandes
- Verifica que estén divididas correctamente

---

## 💡 Tips

### Para Tablas Muy Anchas:
Si tienes una tabla con 20+ columnas:
- Se dividirá en 3-4 partes automáticamente
- Cada parte tendrá máximo 6 columnas
- La primera columna se repite siempre

### Para Optimizar:
1. **Reducir decimales** - Ya implementado (máx 4)
2. **Abreviar encabezados** - Usa nombres cortos en la primera fila
3. **Rotar tabla** - Usa `\begin{landscape}...\end{landscape}` manualmente si es necesario

### Para Tablas Pequeñas:
- No se dividen (≤ 6 columnas)
- Usan todo el ancho disponible
- Autoajuste con `tabularx`

---

## 🎉 Resultado Final

Con esta funcionalidad:

✅ Tablas grandes se dividen automáticamente  
✅ Primera columna se repite (contexto)  
✅ Nota "Continuación..." entre partes  
✅ Números redondeados (máx 4 decimales)  
✅ Autoajuste al ancho de página  
✅ Formato institucional consistente  

**¡Tablas profesionales sin importar el tamaño!** 🚀

---

## 📋 Ejemplo Real

Tu tabla con 11 columnas se dividirá así:

**Parte 1:**
```
Tecnología | 2014 1/ | 2015 1/ | 2016 1/,7/ | 2017 1/,7/ | 2018 1/,8/
```

**Parte 2:**
```
Continuación...

Tecnología | 2019 1/,9/ | 2021 1/,9/ | 2022 1/,9/ | 2023 1/,9/ | 2024 1/
```

Cada parte cabe perfectamente en la página, con todos los números visibles y sin cortes.

**¡Sistema completamente optimizado!** 🎉
