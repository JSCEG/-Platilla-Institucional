# ✅ Soluciones: Tablas y Citas

## 🔧 Problemas Resueltos

### 1. ✅ Espacio entre Tabla y Fuente
**Antes:** Mucho espacio (0.3em)  
**Ahora:** Pegado armónicamente (-0.5em)

**Cambio en `sener2025.cls`:**
```latex
\newcommand{\fuente}[1]{%
  \par\vspace{-0.5em}%  ← Cambiado de 0.3em a -0.5em
  ...
}
```

---

### 2. ✅ Números con Muchos Decimales
**Antes:** `12551.774000000005`, `233.215999999999998`  
**Ahora:** `12551.774`, `233.216`

**Cambio en `google_apps_script_FINAL.js`:**
- Redondeo automático a máximo 4 decimales
- Elimina ceros innecesarios al final
- Detecta números automáticamente

**Ejemplos:**
```
12551.774000000005 → 12551.774
233.215999999999998 → 233.216
1400.0 → 1400
55.41408 → 55.4141
```

---

### 3. ✅ Tabla se Corta (Autoajuste)
**Antes:** `\begin{tabular}{lcccc}` - Ancho fijo, se corta  
**Ahora:** `\begin{tabularx}{\textwidth}{lXXX}` - Se ajusta al ancho de página

**Cómo funciona:**
- `tabularx` ajusta automáticamente las columnas
- `\textwidth` = ancho completo de la página
- `X` = columnas que se expanden proporcionalmente
- Primera columna `l` = izquierda (fija)
- Resto `X` = se ajustan automáticamente

---

### 4. ⚠️ Citas No Aparecen (Aparecen como ////)

**Causa:** Falta ejecutar `biber` para procesar la bibliografía

**Solución:**
```bash
# Paso 1: Primera compilación
xelatex InformeEnergia25.tex

# Paso 2: Procesar bibliografía ← IMPORTANTE
biber InformeEnergia25

# Paso 3: Segunda compilación
xelatex InformeEnergia25.tex

# Paso 4: Tercera compilación (finalizar)
xelatex InformeEnergia25.tex
```

**O en una sola línea:**
```bash
xelatex InformeEnergia25.tex && biber InformeEnergia25 && xelatex InformeEnergia25.tex && xelatex InformeEnergia25.tex
```

---

## 📊 Comparación Visual

### Tabla Antes:
```
Tabla 2. Consumo final...
┌────────────────────────┐
│ Datos...               │
└────────────────────────┘



FUENTE: Cálculos...  ← Muy abajo
```

### Tabla Ahora:
```
Tabla 2. Consumo final...
┌────────────────────────┐
│ Datos...               │
└────────────────────────┘
FUENTE: Cálculos...  ← Pegado
```

---

### Números Antes:
```
12551.774000000005
233.215999999999998
0.012506597230038842
```

### Números Ahora:
```
12551.774
233.216
0.0125
```

---

### Tabla Antes (se corta):
```
┌──────────────────────────────────────────────────────────────┐
│ TECNOLOGÍA │ 2014 1/ │ 2015 1/ │ 2016 1/,7/ │ 2017 1/,7/ │ 20│← Se corta
└──────────────────────────────────────────────────────────────┘
```

### Tabla Ahora (autoajuste):
```
┌────────────────────────────────────────────────────────────────┐
│ TECNOLOGÍA │ 2014 1/ │ 2015 1/ │ 2016 1/,7/ │ 2017 1/,7/ │ ... │
└────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Cómo Aplicar

### 1. Actualizar Archivos
```
1. Reemplaza sener2025.cls
2. Reemplaza google_apps_script_FINAL.js en Google Apps Script
3. Guarda ambos
```

### 2. Regenerar Documento
```
1. En Google Sheets: 📄 SENER LaTeX > ✨ Generar .tex
2. Descarga archivos de Drive
```

### 3. Compilar con Bibliografía
```bash
# IMPORTANTE: Ejecutar todos estos comandos
xelatex InformeEnergia25.tex
biber InformeEnergia25
xelatex InformeEnergia25.tex
xelatex InformeEnergia25.tex
```

---

## 💡 Explicación Técnica

### Redondeo de Decimales:

```javascript
// Si es número con decimales
if (c % 1 !== 0) {
    // Redondear a 4 decimales
    return c.toFixed(4)
        // Eliminar ceros al final
        .replace(/\.?0+$/, '');
}
```

**Ejemplos:**
- `12.50000` → `12.5`
- `0.123456789` → `0.1235`
- `100.0` → `100`

### Autoajuste de Tabla:

```latex
% Antes (ancho fijo)
\begin{tabular}{lcccc}

% Ahora (autoajuste)
\begin{tabularx}{\textwidth}{lXXX}
```

**Ventajas:**
- Se ajusta al ancho de página
- Distribuye espacio proporcionalmente
- No se corta el contenido
- Funciona como Word

---

## ✅ Verificación

Después de aplicar los cambios:

### Tablas:
- [ ] Fuente pegada a la tabla (sin espacio grande)
- [ ] Números con máximo 4 decimales
- [ ] Tabla se ajusta al ancho de página
- [ ] No se corta el contenido

### Citas:
- [ ] Ejecutaste `biber InformeEnergia25`
- [ ] Compilaste 3 veces con xelatex
- [ ] Las citas aparecen correctamente (no ////)
- [ ] La bibliografía aparece al final

---

## 🐛 Solución de Problemas

### Las citas siguen apareciendo como ////
```bash
# Verifica que referencias.bib exista
# Verifica que las claves coincidan
# Ejecuta biber manualmente:
biber InformeEnergia25

# Si hay error, revisa el log:
type InformeEnergia25.blg
```

### Los números siguen con muchos decimales
- Regenera el .tex desde Google Sheets
- El script actualizado redondea automáticamente
- Verifica que usaste el script nuevo

### La tabla sigue cortándose
- Verifica que el .tex use `tabularx`
- Verifica que tengas `\usepackage{tabularx}` en el .cls
- El script actualizado usa `tabularx` automáticamente

---

## 📋 Checklist Completo

Antes de compilar:

- [ ] `sener2025.cls` actualizado (fuente con -0.5em)
- [ ] `google_apps_script_FINAL.js` actualizado (redondeo y tabularx)
- [ ] Documento regenerado desde Google Sheets
- [ ] Archivo `referencias.bib` presente
- [ ] Claves de citas coinciden con el .bib

Al compilar:

- [ ] Primera compilación: `xelatex`
- [ ] Procesar bibliografía: `biber`
- [ ] Segunda compilación: `xelatex`
- [ ] Tercera compilación: `xelatex`

Verificar resultado:

- [ ] Fuente pegada a tabla
- [ ] Números redondeados
- [ ] Tabla ajustada
- [ ] Citas visibles

---

## 🎉 Resultado Final

Con estos cambios:

✅ Tablas con fuente pegada armónicamente  
✅ Números limpios (máximo 4 decimales)  
✅ Tablas que se ajustan al ancho de página  
✅ Citas bibliográficas funcionando  
✅ Formato profesional y limpio  

**¡Sistema completamente optimizado!** 🚀
