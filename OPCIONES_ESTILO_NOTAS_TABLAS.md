# Opciones de Estilo para Notas en Tablas

## Estado Actual

Actualmente el script **NO aplica ningún estilo especial** a las notas. Los símbolos como `1/`, `6/`, `P/` aparecen en el mismo tamaño y estilo que el resto del texto.

**Ejemplo actual:**
```
2024 6/        → Se muestra tal cual
Bioenergía 2/  → Se muestra tal cual
```

---

## Opciones de Estilo Disponibles

### Opción 1: Superíndice (Recomendado para publicaciones formales)

Las notas aparecen como superíndice, similar a las referencias bibliográficas.

**Resultado visual:**
```
2024⁶/        (el 6/ aparece más pequeño y elevado)
Bioenergía²/  (el 2/ aparece más pequeño y elevado)
```

**Código LaTeX generado:**
```latex
2024\textsuperscript{6/}
Bioenergía\textsuperscript{2/}
```

**Ventajas:**
- ✅ Estilo profesional y académico
- ✅ Distingue claramente las notas del contenido
- ✅ Ahorra espacio
- ✅ Estándar en publicaciones científicas

**Desventajas:**
- ⚠️ Puede ser difícil de leer si hay muchas notas
- ⚠️ Notas largas (`1/,7/,11/`) pueden verse apretadas

---

### Opción 2: Tamaño Reducido (Recomendado para tablas con muchas notas)

Las notas aparecen en tamaño más pequeño pero en línea con el texto.

**Resultado visual:**
```
2024 ⁶/        (el 6/ aparece más pequeño pero no elevado)
Bioenergía ²/  (el 2/ aparece más pequeño pero no elevado)
```

**Código LaTeX generado:**
```latex
2024 {\small 6/}
Bioenergía {\small 2/}
```

**Ventajas:**
- ✅ Más legible que superíndice
- ✅ Funciona bien con notas múltiples (`1/,7/,11/`)
- ✅ Mantiene la alineación del texto

**Desventajas:**
- ⚠️ Ocupa más espacio que superíndice
- ⚠️ Menos formal que superíndice

---

### Opción 3: Color Gris (Sutil)

Las notas aparecen en color gris para distinguirlas del contenido principal.

**Código LaTeX generado:**
```latex
2024 {\color{gray}6/}
Bioenergía {\color{gray}2/}
```

**Ventajas:**
- ✅ Distingue visualmente sin cambiar tamaño
- ✅ Mantiene legibilidad
- ✅ Moderno y limpio

**Desventajas:**
- ⚠️ Puede no imprimir bien en blanco y negro
- ⚠️ Menos formal

---

### Opción 4: Combinado - Superíndice + Tamaño Reducido (Más legible)

Combina superíndice con tamaño ligeramente más grande que el estándar.

**Código LaTeX generado:**
```latex
2024\textsuperscript{\footnotesize 6/}
Bioenergía\textsuperscript{\footnotesize 2/}
```

**Ventajas:**
- ✅ Profesional pero más legible
- ✅ Buen balance entre estilo y legibilidad

**Desventajas:**
- ⚠️ Más complejo de implementar

---

### Opción 5: Sin Estilo (Actual)

Las notas aparecen exactamente como se escriben, sin formato especial.

**Código LaTeX generado:**
```latex
2024 6/
Bioenergía 2/
```

**Ventajas:**
- ✅ Simple y directo
- ✅ Máxima legibilidad
- ✅ No requiere cambios en el script

**Desventajas:**
- ⚠️ Las notas no se distinguen del contenido
- ⚠️ Puede verse menos profesional
- ⚠️ Ocupa más espacio

---

## Recomendación

Para documentos oficiales de SENER, recomiendo:

**Opción 2: Tamaño Reducido** (`{\small 6/}`)

**Razones:**
1. Mantiene buena legibilidad
2. Funciona bien con notas múltiples (`1/,7/,11/`)
3. Se distingue del contenido sin ser intrusivo
4. Compatible con el estilo institucional

---

## Implementación

Si decides implementar alguna opción, necesitaremos:

1. **Agregar una función** que detecte patrones de notas:
   - Números seguidos de `/` (ej: `1/`, `6/`, `11/`)
   - Letras seguidas de `/` (ej: `P/`, `e/`, `r/`)
   - Combinaciones (ej: `1/,7/`, `P/,e/`)

2. **Modificar `procesarCeldasFila()`** para aplicar el estilo elegido

3. **Mantener compatibilidad** con texto que contenga `/` pero no sea nota

---

## Ejemplo de Código para Opción 2 (Tamaño Reducido)

```javascript
/**
 * Aplica estilo a las notas en el texto
 * Detecta patrones como: 1/, 6/, P/, e/, 1/,7/, etc.
 */
function estilizarNotas(texto) {
    // Detectar notas al final del texto (ej: "2024 6/" o "Bioenergía 2/")
    // Patrón: espacio + nota(s) al final
    return texto.replace(/\s+([0-9]+\/(?:,[0-9]+\/)*|[a-zA-Z]\/(?:,[a-zA-Z]\/)*)\s*$/g, 
                        ' {\\small $1}');
}
```

**Uso en `procesarCeldasFila()`:**
```javascript
let texto = escaparLatex(c.toString());
texto = estilizarNotas(texto); // Aplicar estilo a notas
if (idx === 0) {
    texto = `\\textbf{${texto}}`;
}
return texto;
```

---

## ¿Quieres que implemente alguna opción?

Dime cuál opción prefieres y actualizo el script para aplicar ese estilo automáticamente a todas las notas en las tablas.
