# Pruebas Manuales del Pipeline Corregido

## Casos de Prueba para Google Apps Script

### 1. Texto con saltos \\n literales
```
Entrada: "Primera línea\\nSegunda línea\\n\\nTercera línea"
Esperado: 
```
Primera línea\\
Segunda línea\\

\par
Tercera línea
```

### 2. Recuadro multi-línea
```
Entrada: "[[recuadro:Título Importante]]
Contenido línea 1
Contenido línea 2 con $E=mc^2$
[[/recuadro]]"

Esperado:
\begin{recuadro}{Título Importante}
Contenido línea 1
Contenido línea 2 con $E=mc^2$
\end{recuadro}
```

### 3. Ecuación dentro de recuadro
```
Entrada: "[[recuadro:Fórmula]]
La ecuación de Einstein es $E=mc^2$ donde:
- E = energía
- m = masa
[[/recuadro]]"

Esperado: La ecuación debe mantenerse sin escapar
```

### 4. Caracteres especiales
```
Entrada: "Porcentaje: 50% & símbolo $ precio #1 _subíndice {grupo}"
Esperado: "Porcentaje: 50\% \& símbolo \$ precio \#1 \_subíndice \{grupo\}"
```

### 5. Comillas tipográficas
```
Entrada: ""Texto entre comillas" y 'comillas simples'"
Esperado: "\"Texto entre comillas\" y 'comillas simples'"
```

## Verificación en PDF

1. ✅ No aparecen strings `\{}n\{}n`
2. ✅ No aparecen tags literales `[[recuadro:...]]`
3. ✅ El comando `\fuente{}` muestra **FUENTE:** correctamente
4. ✅ La compilación es estable sin "Temporary page!"
5. ✅ Funciona con XeLaTeX, LuaLaTeX y pdfLaTeX

## Comandos de Prueba

```bash
# Compilar con XeLaTeX (recomendado)
.\compilar-y-mejorar.ps1 -archivo test_pipeline_completo -motor xelatex

# Compilar con LuaLaTeX
.\compilar-y-mejorar.ps1 -archivo test_pipeline_completo -motor lualatex

# Compilar con pdfLaTeX (fallback)
.\compilar-y-mejorar.ps1 -archivo test_pipeline_completo -motor pdflatex
```

## Resultado Final

El pipeline ahora:
- ✅ Convierte `\\n` literales a saltos reales antes de escapar
- ✅ Procesa tags `[[recuadro:TITULO]]...[[/recuadro]]` correctamente
- ✅ Preserva ecuaciones matemáticas sin escapar
- ✅ Escapa caracteres LaTeX de forma segura
- ✅ Normaliza comillas tipográficas
- ✅ Soporta múltiples motores LaTeX
- ✅ Compilación estable con múltiples pasadas automáticas