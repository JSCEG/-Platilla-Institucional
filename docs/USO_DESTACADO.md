# 📝 Cómo Usar [[destacado]]

## ✅ Dos Formas de Usar Destacado

### 1. Bloque Destacado (Recomendado para párrafos)

**En Google Sheets:**
```
[[destacado]]
La coordinación interinstitucional es clave para asegurar que la expansión de infraestructura energética sea consistente con los objetivos de descarbonización.
[[/destacado]]
```

**Resultado en LaTeX:**
```latex
\begin{destacado}
La coordinación interinstitucional es clave...
\end{destacado}
```

**Resultado en PDF:**
```
    "
    
La coordinación interinstitucional es clave para asegurar que la 
expansión de infraestructura energética sea consistente con los 
objetivos de descarbonización.

    "
```

---

### 2. Destacado Inline (Para texto dentro de párrafo)

**En Google Sheets:**
```
El sistema energético enfrenta retos. [[destacado:La coordinación es clave.]] Se requieren inversiones.
```

**Resultado en LaTeX:**
```latex
El sistema energético enfrenta retos. \begin{destacado}
 La coordinación es clave.
\end{destacado} Se requieren inversiones.
```

**Nota:** Esta forma también funciona, pero es mejor usar el bloque completo para párrafos enteros.

---

## ❌ Problema Actual

Si ves esto en el PDF:
```
" "
```

Significa que el bloque `[[destacado]]` está vacío o mal cerrado.

### Causas Comunes:

1. **Falta el cierre:**
   ```
   [[destacado]]
   Texto...
   (falta [[/destacado]])
   ```

2. **Sintaxis incorrecta:**
   ```
   [[destacado:Texto...]]  ← Falta el cierre
   ```

3. **Saltos de línea incorrectos:**
   ```
   [[destacado]]Texto...[[/destacado]]  ← Todo en una línea
   ```

---

## ✅ Formato Correcto

### Para Párrafos Completos:

**En la celda de Google Sheets:**
```
Texto antes del destacado.

[[destacado]]
La planeación integrada de energía y clima permite identificar trayectorias de transición que maximizan los beneficios económicos, ambientales y sociales.
[[/destacado]]

Texto después del destacado.
```

### Para Texto Corto Inline:

**En la celda de Google Sheets:**
```
El sector energético es fundamental. [[destacado:La coordinación interinstitucional es clave.]] Se requieren inversiones estratégicas.
```

---

## 🔍 Cómo Verificar en el .tex

Abre el archivo `.tex` generado y busca:

**Correcto:**
```latex
\begin{destacado}
 Texto aquí
\end{destacado}
```

**Incorrecto (vacío):**
```latex
\begin{destacado}

\end{destacado}
```

---

## 🛠️ Solución Rápida

Si ves `" "` vacío en el PDF:

1. **Abre Google Sheets**
2. **Busca la celda con `[[destacado]]`**
3. **Verifica que tenga:**
   - Apertura: `[[destacado]]`
   - Contenido: El texto a destacar
   - Cierre: `[[/destacado]]`

4. **Formato recomendado:**
   ```
   [[destacado]]
   Tu texto aquí
   [[/destacado]]
   ```

5. **Regenera el .tex** desde el menú

---

## 📋 Ejemplos Completos

### Ejemplo 1: Destacado Simple
```
[[destacado]]
La transición energética requiere coordinación entre sectores.
[[/destacado]]
```

### Ejemplo 2: Destacado con Múltiples Líneas
```
[[destacado]]
La planeación integrada de energía y clima permite:
- Identificar trayectorias óptimas
- Maximizar beneficios económicos
- Reducir impactos ambientales
[[/destacado]]
```

### Ejemplo 3: Destacado Inline
```
El informe presenta [[destacado:tres ejes estratégicos]] para la transición energética.
```

---

## 🎨 Resultado Visual

### Bloque Destacado:
```
┌────────────────────────────────────────┐
│                                        │
│    "                                   │
│                                        │
│    La coordinación interinstitucional  │
│    es clave para el éxito.            │
│                                        │
│                              "         │
│                                        │
└────────────────────────────────────────┘
```

### Inline Destacado:
```
El texto normal continúa y luego aparece
el destacado en el mismo párrafo con el
texto resaltado.
```

---

## ✅ Checklist

Antes de regenerar:

- [ ] Verificar que `[[destacado]]` tenga apertura y cierre
- [ ] Verificar que haya contenido entre las etiquetas
- [ ] Verificar que no haya espacios extra en las etiquetas
- [ ] Usar saltos de línea apropiados

Después de regenerar:

- [ ] Abrir el .tex y buscar `\begin{destacado}`
- [ ] Verificar que tenga contenido
- [ ] Compilar y verificar en el PDF

---

## 💡 Tip Pro

Para destacados largos o con formato complejo, usa el bloque:

```
[[destacado]]
Texto con **formato** y múltiples líneas.

Incluso con párrafos separados.
[[/destacado]]
```

Para destacados cortos dentro de un párrafo, usa inline:

```
El texto continúa [[destacado:punto clave aquí]] y sigue.
```

---

## 🎉 Resultado

Con el formato correcto:

✅ Destacados visibles en el PDF  
✅ Formato de comillas elegante  
✅ Texto centrado y resaltado  
✅ Apariencia profesional  

**¡Listo para usar!** 🚀
