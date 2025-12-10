# 🔍 Instrucciones de Debug - Figuras

## Problema Actual
Los mensajes de éxito aparecen pero los cambios no se reflejan en Google Sheets.

## 🚀 Pasos para Diagnosticar

### Paso 1: Verificar Backend
1. **Abre tu Google Apps Script** del backend de figuras
2. **Reemplaza todo el código** con el contenido actualizado de `back/figuras.gs`
3. **Despliega una nueva versión**:
   - Implementar → Nueva implementación
   - Descripción: "Debug version con logging"
   - Implementar
4. **Copia la nueva URL** y actualízala en `web/js/config.js`

### Paso 2: Probar Conexión Básica
1. **Abre `web/test-api-real.html`** en tu navegador
2. **Ejecuta los pasos en orden**:
   - Paso 1: Verificar URL
   - Paso 2: Probar Conexión
   - Paso 3: Crear Figura
   - Paso 4: Verificar Creación

### Paso 3: Revisar Logs
1. **En Google Apps Script**, ve a **Ejecuciones** (menú lateral)
2. **Busca las ejecuciones recientes** de tu script
3. **Haz clic en cada ejecución** para ver los logs
4. **Busca errores o mensajes** que indiquen qué está pasando

### Paso 4: Verificar Permisos
1. **En Google Apps Script**, ve a **Configuración** → **Permisos**
2. **Verifica que tenga acceso** a Google Sheets
3. **Si hay permisos pendientes**, autorízalos

### Paso 5: Verificar Google Sheets
1. **Abre tu Google Sheets** de figuras
2. **Verifica que la hoja se llame exactamente** "Figuras"
3. **Verifica las columnas**:
   - A: DocumentoID
   - B: SeccionOrden  
   - C: OrdenFigura
   - D: RutaArchivo
   - E: Caption
   - F: Fuente

## 🔧 Posibles Problemas y Soluciones

### Problema 1: URL Incorrecta
**Síntoma**: Error de conexión en Paso 2
**Solución**: 
- Verifica que la URL termine en `/exec`
- Asegúrate de que sea la URL del Web App, no del editor

### Problema 2: Permisos Insuficientes
**Síntoma**: Error 403 o "Unauthorized"
**Solución**:
- Re-autoriza los permisos en Google Apps Script
- Verifica que "Quién tiene acceso" esté en "Cualquiera"

### Problema 3: Nombre de Hoja Incorrecto
**Síntoma**: Error "No se encontró la hoja Figuras"
**Solución**:
- Verifica que la hoja se llame exactamente "Figuras"
- No debe tener espacios extra o caracteres especiales

### Problema 4: Estructura de Datos Incorrecta
**Síntoma**: Los datos se crean pero en columnas incorrectas
**Solución**:
- Verifica el orden de las columnas en Google Sheets
- Asegúrate de que coincida con el backend

## 📋 Checklist de Verificación

- [ ] Backend actualizado con nuevo código
- [ ] Nueva implementación desplegada
- [ ] URL actualizada en config.js
- [ ] Permisos autorizados
- [ ] Hoja "Figuras" existe y tiene estructura correcta
- [ ] Test de conexión exitoso
- [ ] Logs revisados en Google Apps Script

## 🆘 Si Sigue Sin Funcionar

1. **Comparte los logs** de Google Apps Script
2. **Comparte la URL** de tu Web App (sin revelar datos sensibles)
3. **Indica qué paso específico falla** en el test
4. **Comparte cualquier mensaje de error** que aparezca

## 📞 Información Adicional Útil

- **Versión de Google Apps Script**: V8 Runtime
- **Tipo de implementación**: Web App
- **Ejecutar como**: Yo (tu cuenta)
- **Acceso**: Cualquiera
- **Content-Type**: text/plain;charset=utf-8