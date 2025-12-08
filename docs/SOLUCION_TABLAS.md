# 🔧 Solución: Error "Hoja no encontrada" en Tablas

## ❌ Problema
Las tablas mostraban: **"Error - Hoja no encontrada"**

## ✅ Solución Implementada

El script ahora es **inteligente** y busca la hoja de 3 formas:

1. **Nombre exacto** como está escrito
2. **Con espacios** (si tiene guiones bajos)
3. **Con guiones bajos** (si tiene espacios)

### Ejemplo:

Si en tu hoja "Tablas" pones:
```
DatosCSV: Datos_Tablas!A1:E4
```

El script buscará:
1. `Datos_Tablas` (exacto)
2. `Datos Tablas` (con espacio) ← Tu caso
3. `Datos_Tablas` (con guion bajo)

---

## 📋 Cómo Usar

### Opción 1: Nombre con Espacio (Tu caso actual)
```
Hoja en Sheets: "Datos Tablas"
En columna DatosCSV: Datos Tablas!A1:E4
```
✅ Funciona

### Opción 2: Nombre con Guion Bajo
```
Hoja en Sheets: "Datos_Tablas"
En columna DatosCSV: Datos_Tablas!A1:E4
```
✅ Funciona

### Opción 3: Mezcla (Más flexible)
```
Hoja en Sheets: "Datos Tablas"
En columna DatosCSV: Datos_Tablas!A1:E4
```
✅ Funciona (el script lo convierte automáticamente)

---

## 🔍 Debugging Mejorado

Si hay un error, el script ahora muestra:

```latex
% ERROR: No se encontró la hoja "Datos_Tablas"
% Hojas disponibles: Documentos, Secciones, Figuras, Tablas, Datos Tablas, Siglas, Glosario, Bibliografia
```

Esto te ayuda a ver:
- Qué nombre buscó
- Qué hojas existen realmente
- Cómo se llaman exactamente

---

## 📊 Ejemplo Completo

### Tu Google Sheets:

**Hoja "Tablas":**
| DocumentoID | SeccionOrden | OrdenTabla | Titulo | Fuente | DatosCSV |
|-------------|--------------|------------|--------|--------|----------|
| D01 | 2 | 1 | Capacidad instalada | SENER | Datos Tablas!A1:E4 |

**Hoja "Datos Tablas":** (con espacio)
```
A1: Concepto    | B1: 2020 | C1: 2021 | D1: 2022 | E1: 2023
A2: Generación  | B2: 1    | C2: 2    | D2: 3    | E2: 4
A3: Distribución| B3: 56   | C3: 6    | D3: 7    | E3: 8
A4: Total       | B4: 57   | C4: 8    | D4: 10   | E4: 12
```

### Resultado:
✅ Tabla completa con todos los datos  
✅ Encabezado guinda  
✅ Filas con datos reales  

---

## 🚀 Pasos para Probar

1. **Actualiza el script** en Google Apps Script
2. **Guarda** (Ctrl+S)
3. **Recarga** tu Google Sheets (F5)
4. **Genera** el documento de nuevo
5. **Revisa el log** si hay errores:
   - Menú: 📄 SENER LaTeX > 📋 Ver log de errores
   - Verás qué hojas buscó y cuáles encontró

---

## 💡 Tips

### Si sigues teniendo problemas:

1. **Verifica el nombre exacto de la hoja:**
   - Haz clic en la pestaña de la hoja
   - Copia el nombre exacto
   - Úsalo en la columna DatosCSV

2. **Verifica el rango:**
   ```
   Correcto: A1:E4
   Incorrecto: A1-E4, A1..E4
   ```

3. **Revisa el log:**
   ```
   📋 Leyendo datos de "Datos Tablas" rango A1:E4
   ✅ Hoja encontrada como: "Datos Tablas"
   ✅ Datos leídos: 4 filas
   ```

4. **Verifica que el rango tenga datos:**
   - Primera fila = encabezados
   - Resto = datos
   - No debe haber filas vacías al inicio

---

## ✅ Checklist

Antes de generar, verifica:

- [ ] La hoja "Datos Tablas" existe
- [ ] El rango en DatosCSV es correcto (ej: A1:E4)
- [ ] El rango tiene datos (no está vacío)
- [ ] La primera fila del rango son los encabezados
- [ ] El nombre en DatosCSV coincide con la hoja (o es similar)

---

## 🎯 Resultado Esperado

Después de actualizar el script, deberías ver:

**En el log:**
```
📊 Tabla detectada: Capacidad instalada...
📋 Leyendo datos de "Datos Tablas" rango A1:E4
✅ Hoja encontrada como: "Datos Tablas"
✅ Datos leídos: 4 filas
```

**En el PDF:**
- Tabla completa con encabezado guinda
- Todas las filas de datos
- Fuente al pie
- Formato institucional

¡Listo para probar! 🚀
