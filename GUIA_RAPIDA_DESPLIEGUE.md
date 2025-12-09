# 🚀 Guía Rápida de Despliegue (5 minutos)

## ⚡ Pasos Rápidos

### 1️⃣ Abrir Apps Script (30 segundos)
1. Abre tu Google Sheets: `Dumentos LaText (1).xlsx`
2. Menú: **Extensiones > Apps Script**
3. Se abre el editor

### 2️⃣ Copiar Code.gs (1 minuto)
1. En Apps Script, selecciona TODO el contenido de `Code.gs`
2. Bórralo
3. Abre: `google_apps_script_FINAL.js`
4. Copia TODO (Ctrl+A, Ctrl+C)
5. Pega en `Code.gs` (Ctrl+V)
6. Guarda (Ctrl+S)

### 3️⃣ Crear index.html (1 minuto)
1. En Apps Script: **+ (junto a Archivos) > HTML**
2. Nombre: `index`
3. Abre: `web/index_completo.html`
4. Copia TODO
5. Pega en `index.html`
6. Guarda

### 4️⃣ Crear editor.html (1 minuto)
1. En Apps Script: **+ > HTML**
2. Nombre: `editor`
3. Abre: `web/editor_completo.html`
4. Copia TODO
5. Pega en `editor.html`
6. Guarda

### 5️⃣ Desplegar (2 minutos)
1. Botón **Implementar > Nueva implementación**
2. Tipo: **Aplicación web**
3. Ejecutar como: **Yo**
4. Acceso: **Cualquier usuario de [tu organización]**
5. Clic en **Implementar**
6. **Autorizar permisos** (primera vez):
   - Revisar permisos
   - Seleccionar tu cuenta
   - Avanzado > Ir a [proyecto]
   - Permitir
7. **Copiar la URL** que te da

### 6️⃣ ¡Probar! (30 segundos)
1. Abre la URL en tu navegador
2. Deberías ver tus documentos de Google Sheets
3. Haz clic en "Editar"
4. Verás el editor con datos reales

---

## ✅ Verificación Rápida

Después de desplegar, verifica:

- [ ] El dashboard muestra tus documentos reales (no los de ejemplo)
- [ ] Al hacer clic en "Editar" se abre el editor
- [ ] El editor muestra los datos correctos del documento
- [ ] Puedes editar los metadatos
- [ ] El botón "Guardar" funciona
- [ ] El botón "Generar .tex" descarga el archivo

---

## 🐛 Si Algo Sale Mal

### No veo mis documentos
**Causa:** La hoja "Documentos" no existe o está vacía
**Solución:** Verifica que tu Google Sheets tenga la hoja "Documentos" con datos

### Error: "Script function not found"
**Causa:** No se guardó Code.gs correctamente
**Solución:** Guarda Code.gs (Ctrl+S) y recarga la página

### Los estilos no se ven
**Causa:** No se copió todo el contenido de los archivos _completo.html
**Solución:** Asegúrate de copiar TODO el contenido (Ctrl+A)

### Error de permisos
**Causa:** No autorizaste los permisos
**Solución:** Sigue el proceso de autorización (Avanzado > Permitir)

---

## 📞 Ayuda Rápida

**Consola del navegador:**
- Presiona F12
- Ve a la pestaña "Console"
- Busca mensajes en rojo (errores)
- Busca mensajes que digan "Modo Demo" o "Modo Google Apps Script"

**Si dice "Modo Demo":**
- Estás abriendo el archivo localmente
- Necesitas abrir la URL de Google Apps Script

**Si dice "Modo Google Apps Script":**
- ✅ Estás conectado correctamente
- Los datos deberían cargarse de Google Sheets

---

## 🎉 ¡Listo!

Una vez desplegado, comparte la URL con tu equipo y todos podrán:
- Ver los documentos
- Editarlos
- Generar archivos .tex
- Todo desde el navegador, sin instalar nada

**Tiempo total: ~5 minutos** ⏱️
