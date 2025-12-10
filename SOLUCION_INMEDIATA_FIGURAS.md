# 🚨 SOLUCIÓN INMEDIATA - Error "Failed to fetch" en Figuras

## 🎯 Problema Identificado
El error "Failed to fetch" indica que la conexión con Google Apps Script está fallando. Basándome en los logs, el problema más probable es:

1. **URL del Google Apps Script desactualizada o incorrecta**
2. **Script no desplegado correctamente**
3. **Hoja "Figuras" no existe en Google Sheets**

## ⚡ SOLUCIÓN RÁPIDA (5 minutos)

### Paso 1: Verificar Google Apps Script
1. Ve a [script.google.com](https://script.google.com)
2. Abre tu proyecto de Apps Script
3. **IMPORTANTE**: Copia el código mejorado de `verificar-script-gas.js`
4. Reemplaza todo el código existente

### Paso 2: Desplegar Correctamente
1. En Google Apps Script, clic en **"Implementar"** → **"Nueva implementación"**
2. Configurar:
   - **Tipo**: Aplicación web
   - **Ejecutar como**: Yo
   - **Acceso**: Cualquiera
3. **Copiar la nueva URL** (debe terminar en `/exec`)

### Paso 3: Crear Hoja "Figuras"
En tu Google Sheets, crear una hoja llamada exactamente **"Figuras"** con estos headers:

```
DocumentoID | SeccionOrden | OrdenFigura | RutaArchivo | Caption | Fuente
```

### Paso 4: Actualizar URL en el Sistema
1. Abrir `web/test-conexion-inmediato.html`
2. Pegar la nueva URL
3. Hacer clic en "Actualizar y Probar"

## 🔧 Archivos de Diagnóstico Creados

### Para Pruebas Inmediatas:
- `web/test-conexion-inmediato.html` - Prueba la conexión ahora mismo
- `web/diagnostico-conexion-figuras.html` - Diagnóstico completo
- `web/solucion-figuras-rapida.html` - Guía paso a paso

### Para Google Apps Script:
- `verificar-script-gas.js` - Código mejorado con logs detallados

## 🚀 Prueba Rápida desde Consola

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Probar conexión actual
fetch('https://script.google.com/macros/s/AKfycbx83R7-iJxqJsdXDCytkpKfwHov5wVzGqIlKQBIM2OziDFY9Hq_JflEW6rqPyzCuo179w/exec', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'TEST_CONEXION' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

## 📋 Checklist de Verificación

- [ ] Google Apps Script desplegado como "Aplicación web"
- [ ] Permisos configurados como "Cualquiera"
- [ ] Hoja "Figuras" existe con headers correctos
- [ ] URL actualizada en el sistema
- [ ] Prueba de conexión exitosa

## 🆘 Si Sigue Fallando

1. **Verificar en Google Apps Script**:
   - Ir a "Ejecuciones" para ver logs de errores
   - Ejecutar función `testCompleto()` manualmente

2. **Verificar en el navegador**:
   - Abrir herramientas de desarrollador (F12)
   - Revisar pestaña "Network" para ver peticiones fallidas
   - Revisar pestaña "Console" para errores JavaScript

3. **Crear nuevo proyecto**:
   - Si todo falla, crear un nuevo Google Apps Script
   - Usar el código de `verificar-script-gas.js`
   - Obtener nueva URL de despliegue

## 🎯 Resultado Esperado

Después de seguir estos pasos, deberías ver:
- ✅ Conexión exitosa en las pruebas
- ✅ Lista de figuras cargándose correctamente
- ✅ Posibilidad de crear nuevas figuras sin errores

---

**Tiempo estimado de solución: 5-10 minutos**