# 🔧 Pasos para Solucionar el Problema de Figuras

## El Problema
Los mensajes de éxito aparecen pero los cambios no se reflejan realmente en Google Sheets.

## 🚀 Solución Paso a Paso

### Paso 1: Actualizar Backend (CRÍTICO)
1. **Ve a tu Google Apps Script** del backend de figuras
2. **Reemplaza TODO el código** con el contenido de `back/figuras_debug.gs`
3. **Guarda el proyecto** (Ctrl+S)
4. **Despliega nueva versión**:
   - Clic en "Implementar" → "Nueva implementación"
   - Tipo: "Aplicación web"
   - Descripción: "Debug version con logging extensivo"
   - Ejecutar como: "Yo"
   - Quién tiene acceso: "Cualquiera"
   - Clic en "Implementar"
5. **Copia la nueva URL** que aparece
6. **Actualiza la URL** en `web/js/config.js` en la línea de FIGURAS

### Paso 2: Verificar Google Sheets
1. **Abre tu Google Sheets**
2. **Verifica que existe una hoja llamada exactamente "Figuras"**
3. **Verifica que las columnas sean**:
   - A: DocumentoID
   - B: SeccionOrden
   - C: OrdenFigura
   - D: RutaArchivo
   - E: Caption
   - F: Fuente

### Paso 3: Probar Conexión
1. **Abre `web/test-api-real.html`** en tu navegador
2. **Ejecuta los pasos en orden**:
   - Paso 1: Verificar URL ✅
   - Paso 2: Probar Conexión ✅
   - Paso 3: Crear Figura ✅
   - Paso 4: Verificar Creación ✅

### Paso 4: Revisar Logs (Si hay errores)
1. **En Google Apps Script**, ve al menú "Ejecuciones"
2. **Busca las ejecuciones recientes**
3. **Haz clic en cada ejecución** para ver los logs detallados
4. **Busca mensajes de error** en rojo

### Paso 5: Probar en el Editor
1. **Ve a `web/editor.html?id=D01`**
2. **Ve a la pestaña "Figuras"**
3. **Prueba editar un campo** (hacer clic y cambiar texto)
4. **Verifica en Google Sheets** que el cambio aparezca

## 🔍 Qué Buscar en los Logs

### Logs Exitosos:
```
=== CREATE FIGURA DEBUG ===
docId recibido: D01
figura recibida: {...}
Spreadsheet activo: [nombre]
Hoja Figuras encontrada
Fila insertada exitosamente
```

### Logs de Error Comunes:
```
ERROR: No se encontró la hoja "Figuras"
ERROR: Falta docId
ERROR insertando fila: [detalle]
```

## 🆘 Si Sigue Sin Funcionar

### Error: "No se encontró la hoja Figuras"
- Verifica que la hoja se llame exactamente "Figuras" (sin espacios extra)
- Verifica que el Google Apps Script esté vinculado al Spreadsheet correcto

### Error: "Unauthorized" o 403
- Re-autoriza los permisos en Google Apps Script
- Verifica que "Quién tiene acceso" esté en "Cualquiera"

### Error: "URL no configurada"
- Verifica que hayas copiado la URL correcta del Web App
- Verifica que la URL termine en `/exec`

### Los cambios no aparecen en Sheets
- Refresca la página de Google Sheets
- Verifica que no haya filtros activos
- Revisa los logs para ver si hay errores silenciosos

## 📋 Checklist Final

- [ ] Backend actualizado con código debug
- [ ] Nueva implementación desplegada
- [ ] URL actualizada en config.js
- [ ] Hoja "Figuras" existe con estructura correcta
- [ ] Test de conexión pasa todos los pasos
- [ ] Logs revisados sin errores
- [ ] Cambios aparecen en Google Sheets

## 💡 Tip Importante

El nuevo backend tiene **logging extensivo**. Cada operación genera logs detallados que te dirán exactamente qué está pasando. Si algo falla, los logs te mostrarán el problema exacto.

---

**Una vez que esto funcione, podremos volver al código de producción sin tanto logging.**