# ✅ Correcciones: Tablas e Índices

## 🔧 Problemas Resueltos

### 1. ❌ No se generaban índices de figuras y tablas
**Solución:** Agregado código para generar automáticamente los índices

```javascript
// --- Índices de Figuras y Tablas (si existen) ---
if (figuras.length > 0) {
    tex += `\\listafiguras\n\\newpage\n\n`;
}
if (tablas.length > 0) {
    tex += `\\listatablas\n\\newpage\n\n`;
}
```

### 2. ❌ Las tablas solo mostraban encabezado rojo
**Causa:** El script no leía los datos de la hoja "Datos Tablas"

**Solución:** 
- Creada función `procesarDatosArray()` para leer rangos de Google Sheets
- Actualizada función `generarTabla()` para leer datos reales
- Agregado manejo de errores si la hoja o rango no existe

### 3. ✅ Lectura de rangos desde "Datos Tablas"
Ahora el script lee correctamente referencias como:
```
Datos_Tablas!A1:E4
Datos_Tablas!A7:E13
```

---

## 📊 Cómo Funciona Ahora

### En Google Sheets - Hoja "Tablas":

| DocumentoID | SeccionOrden | OrdenTabla | Titulo | Fuente | DatosCSV |
|-------------|--------------|------------|--------|--------|----------|
| D01 | 2 | 1 | Capacidad instalada | SENER | Datos_Tablas!A1:E4 |

### En Google Sheets - Hoja "Datos Tablas":

```
A1: Concepto    | B1: 2020 | C1: 2021 | D1: 2022 | E1: 2023
A2: Generación  | B2: 1    | C2: 2    | D2: 3    | E2: 4
A3: Distribución| B3: 56   | C3: 6    | D3: 7    | E3: 8
A4: Total       | B4: 57   | C4: 8    | D4: 10   | E4: 12
```

### Resultado en el .tex:

```latex
\begin{tablaguinda}
  \caption{Capacidad instalada}
  \label{tab:capacidad_instalada}
  \begin{tabular}{lcccc}
    \toprule
    \rowcolor{gobmxGuinda} \encabezadoguinda{Concepto} & \encabezadoguinda{2020} & \encabezadoguinda{2021} & \encabezadoguinda{2022} & \encabezadoguinda{2023} \\
    \midrule
    Generación & 1 & 2 & 3 & 4 \\
    Distribución & 56 & 6 & 7 & 8 \\
    Total & 57 & 8 & 10 & 12 \\
    \bottomrule
  \end{tabular}
\end{tablaguinda}
\fuente{SENER}
```

### Resultado en el PDF:

✅ Tabla con encabezado guinda  
✅ Datos correctos de la hoja  
✅ Formato institucional  
✅ Fuente al pie  

---

## 📋 Estructura del Documento Generado

```
1. Portada institucional
2. Tabla de contenidos
3. Índice de figuras ← NUEVO
4. Índice de tablas ← NUEVO
5. Resumen ejecutivo
6. Datos clave
7. Secciones con contenido
   ├── Figuras insertadas automáticamente
   └── Tablas con datos reales ← CORREGIDO
8. Glosario
9. Siglas
10. Bibliografía
11. Contraportada
```

---

## 🎯 Funciones Nuevas/Actualizadas

### `procesarDatosArray(datos)`
Lee un array 2D de Google Sheets y genera tabla LaTeX

```javascript
function procesarDatosArray(datos) {
    // Convierte datos de Sheets a tabla LaTeX
    // Primera fila = encabezados (guinda)
    // Resto = datos
}
```

### `generarTabla(tabla, ss)`
Ahora recibe el objeto Spreadsheet para leer datos

```javascript
function generarTabla(tabla, ss) {
    // Si DatosCSV contiene "!", lee de otra hoja
    if (datosRef.includes('!')) {
        const [nombreHoja, rango] = datosRef.split('!');
        const hojaDatos = ss.getSheetByName(nombreHoja.trim());
        const datosTabla = hojaDatos.getRange(rango).getValues();
        tex += procesarDatosArray(datosTabla);
    }
}
```

---

## 🚀 Cómo Usar

### 1. Actualizar el Script
Copia el nuevo `google_apps_script_FINAL.js` a tu Google Apps Script

### 2. Configurar Tablas en Google Sheets

**Opción A: Datos en "Datos Tablas" (Recomendado)**
```
Hoja "Tablas":
DatosCSV: Datos_Tablas!A1:E4

Hoja "Datos Tablas":
Organiza tus datos en rangos
```

**Opción B: CSV Directo**
```
Hoja "Tablas":
DatosCSV: Concepto,2020,2021,2022
Solar,100,150,200
Eólica,300,350,400
```

### 3. Generar y Compilar
```
1. Selecciona documento en "Documentos"
2. Menú: 📄 SENER LaTeX > ✨ Generar .tex
3. Descarga archivos de Drive
4. Compila con XeLaTeX
```

---

## ✅ Verificación

Después de generar, verifica que el .tex contenga:

```latex
% Cerca del inicio (después de \tableofcontents)
\listafiguras
\newpage

\listatablas
\newpage

% En las secciones (donde hay tablas)
\begin{tablaguinda}
  \caption{...}
  \begin{tabular}{lcccc}
    \toprule
    \rowcolor{gobmxGuinda} \encabezadoguinda{...} & ...
    \midrule
    Dato1 & 1 & 2 & 3 & 4 \\  ← Datos reales, no "% Insertar datos aquí"
    \bottomrule
  \end{tabular}
\end{tablaguinda}
```

---

## 📝 Ejemplo Completo

### Google Sheets Setup:

**Hoja "Tablas":**
```
DocumentoID: D01
SeccionOrden: 2
OrdenTabla: 1
Titulo: Capacidad instalada por tecnología
Fuente: Balance Nacional de Energía 2024
DatosCSV: Datos_Tablas!A1:E4
```

**Hoja "Datos Tablas":**
```
     A          B      C      D      E
1  Tecnología  2020   2021   2022   2023
2  Solar       100    150    200    250
3  Eólica      300    350    400    450
4  Total       400    500    600    700
```

### Resultado en PDF:
- ✅ Índice de tablas con "Tabla 1. Capacidad instalada por tecnología"
- ✅ Tabla en la sección 2 con todos los datos
- ✅ Encabezado guinda con años
- ✅ Filas con datos reales
- ✅ Fuente al pie

---

## 🎉 Resultado Final

Con estos cambios, el sistema ahora:

1. ✅ Genera índice de figuras automáticamente
2. ✅ Genera índice de tablas automáticamente
3. ✅ Lee datos reales de la hoja "Datos Tablas"
4. ✅ Muestra tablas completas con datos (no solo encabezados)
5. ✅ Maneja errores si la hoja o rango no existe
6. ✅ Soporta múltiples tablas por documento
7. ✅ Mantiene formato institucional

**¡Sistema 100% funcional!** 🚀
