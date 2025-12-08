# ✅ Solución: Figuras y Tablas

## 🎯 Problemas Resueltos

### 1. Error: `Unknown float option 'H'`
**Causa:** Faltaba el paquete `float` en el archivo `.cls`

**Solución:** Agregado `\RequirePackage{float}` en `sener2025.cls`

```latex
\RequirePackage{float} % Para usar [H] en figuras y tablas
```

### 2. Error: URLs de Google Drive no funcionan en LaTeX
**Causa:** LaTeX no puede descargar imágenes de URLs directamente

**Solución:** Modificado el script para:
- Detectar URLs de Google Drive
- Generar rutas locales (`img/figura_XXXXX.png`)
- Agregar comentarios con instrucciones de descarga
- Usar imágenes locales de ejemplo

### 3. Compilación exitosa
✅ El PDF se genera correctamente  
✅ Las figuras aparecen (usando imagen de ejemplo)  
✅ Las tablas se renderizan correctamente  
✅ El formato institucional se mantiene  

---

## 📋 Workflow Actualizado para Figuras

### Opción A: Imágenes Locales (Recomendado)

1. **Guardar imágenes en `img/`**
   ```
   img/
   ├── grafico_capacidad.png
   ├── grafico_consumo.png
   └── grafico_emisiones.png
   ```

2. **En Google Sheets (columna RutaArchivo)**
   ```
   img/grafico_capacidad.png
   img/grafico_consumo.png
   img/grafico_emisiones.png
   ```

3. **Generar .tex y compilar** ✅ Funciona directamente

### Opción B: Imágenes en Google Drive (Requiere paso manual)

1. **En Google Sheets (columna RutaArchivo)**
   ```
   https://drive.google.com/file/d/1Ny_AvsRGIP-9uYfVcp3AUGMxOAbE45WN/view
   ```

2. **El script genera comentarios en el .tex**
   ```latex
   % IMPORTANTE: Descarga la imagen de Google Drive
   % URL: https://drive.google.com/file/d/1Ny_AvsRGIP-9uYfVcp3AUGMxOAbE45WN/view
   % Guárdala como: img/figura_1Ny_AvsR.png
   \includegraphics[width=0.8\textwidth]{img/figura_1Ny_AvsR.png}
   ```

3. **Descargar manualmente las imágenes**
   - Abrir cada URL en el navegador
   - Descargar la imagen
   - Guardarla con el nombre indicado en `img/`

4. **Compilar el .tex** ✅ Funciona

---

## 🔧 Mejoras Implementadas en el Script

### Función `generarFigura()` actualizada:

```javascript
function generarFigura(figura) {
    const rutaArchivo = figura['RutaArchivo'] || '';
    const caption = figura['Caption'] || '';
    const fuente = figura['Fuente'] || '';
    
    // Detectar si es URL de Google Drive
    let rutaFinal = rutaArchivo;
    let esGoogleDrive = false;
    const driveMatch = rutaArchivo.match(/\/d\/([a-zA-Z0-9_-]+)/);
    
    if (driveMatch) {
        esGoogleDrive = true;
        const fileId = driveMatch[1];
        // Generar nombre de archivo local
        rutaFinal = `img/figura_${fileId.substring(0, 8)}.png`;
        log(`  🖼️ Figura de Google Drive detectada`);
        log(`  ⚠️ IMPORTANTE: Descarga manualmente el archivo`);
    }
    
    let tex = `\\begin{figure}[H]\n`;
    tex += `  \\centering\n`;
    
    if (esGoogleDrive) {
        tex += `  % IMPORTANTE: Descarga la imagen de Google Drive\n`;
        tex += `  % URL: ${rutaArchivo}\n`;
        tex += `  % Guárdala como: ${rutaFinal}\n`;
    }
    
    tex += `  \\includegraphics[width=0.8\\textwidth]{${rutaFinal}}\n`;
    tex += `  \\caption{${escaparLatex(caption)}}\n`;
    tex += `\\end{figure}\n`;
    
    if (fuente) {
        tex += `\\fuente{${escaparLatex(fuente)}}\n`;
    }
    
    return tex;
}
```

---

## 📊 Estado Actual

### ✅ Funcionando Correctamente:
- Generación de .tex desde Google Sheets
- Inserción automática de figuras por sección
- Inserción automática de tablas por sección
- Glosario y siglas
- Bibliografía
- Compilación a PDF

### ⚠️ Requiere Acción Manual:
- Descargar imágenes de Google Drive (si se usan URLs)
- Guardarlas en la carpeta `img/` con el nombre indicado

### 🔄 Warnings Restantes (No críticos):
- `Citation undefined` - Se resuelve ejecutando `biber` y recompilando
- `Font shape undefined` - Warnings de fuentes, no afectan el resultado
- `Empty bibliography` - Normal si no hay referencias aún

---

## 🚀 Próximos Pasos

### Para el equipo de comunicación social:

1. **Opción Recomendada: Usar imágenes locales**
   - Guardar todas las imágenes en `img/`
   - Usar rutas relativas en Google Sheets
   - No requiere pasos manuales adicionales

2. **Si usan Google Drive:**
   - Después de generar el .tex, revisar los comentarios
   - Descargar las imágenes indicadas
   - Guardarlas con los nombres especificados
   - Compilar

3. **Para compilar con bibliografía completa:**
   ```bash
   xelatex InformeEnergia25.tex
   biber InformeEnergia25
   xelatex InformeEnergia25.tex
   xelatex InformeEnergia25.tex
   ```

---

## 📝 Ejemplo Completo

### En Google Sheets - Hoja "Figuras":

| DocumentoID | SeccionOrden | OrdenFigura | RutaArchivo | Caption | Fuente |
|-------------|--------------|-------------|-------------|---------|--------|
| D01 | 2 | 1 | img/capacidad_2025.png | Capacidad instalada | SENER 2024 |
| D01 | 3 | 1 | img/consumo_sectores.png | Consumo por sector | SIE-SENER |

### Resultado en el .tex:

```latex
\section{Evolución de la capacidad}

Texto de la sección...

\begin{figure}[H]
  \centering
  \includegraphics[width=0.8\textwidth]{img/capacidad_2025.png}
  \caption{Capacidad instalada}
\end{figure}
\fuente{SENER 2024}
```

### PDF Final:
✅ Figura aparece correctamente  
✅ Caption con formato institucional  
✅ Fuente en tipografía ligera  
✅ Numeración automática  

---

## 🎉 Conclusión

El sistema está **100% funcional** para figuras y tablas. La única consideración es que las imágenes deben estar disponibles localmente en la carpeta `img/` al momento de compilar.

**Recomendación:** Usar imágenes locales en lugar de URLs de Drive para evitar el paso manual de descarga.
