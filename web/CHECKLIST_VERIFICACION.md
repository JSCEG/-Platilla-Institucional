# ✅ Checklist de Verificación - Editor Web

## 📋 Antes de Empezar

### 1. Verificar Google Sheets

- [ ] El Google Sheets está publicado en la web
  - Archivo → Compartir → Publicar en la web
  - Seleccionar "Documento completo"
  - Formato: "Página web"
  
- [ ] Tienes la URL pública (termina en `/pub`)
  - Ejemplo: `https://docs.google.com/spreadsheets/d/e/2PACX-.../pub`

- [ ] El Google Sheets tiene estas pestañas:
  - [ ] Documentos
  - [ ] Secciones
  - [ ] Tablas
  - [ ] Figuras
  - [ ] Bibliografia
  - [ ] Siglas (opcional)
  - [ ] Glosario (opcional)

### 2. Verificar Estructura de Datos

#### Hoja "Documentos" debe tener estas columnas:
- [ ] ID
- [ ] Titulo
- [ ] Subtitulo
- [ ] Autor
- [ ] Fecha
- [ ] Institucion
- [ ] Unidad
- [ ] DocumentoCorto
- [ ] PalabrasClave
- [ ] Version
- [ ] ResumenEjecutivo
- [ ] DatosClave

#### Hoja "Secciones" debe tener:
- [ ] DocumentoID
- [ ] Orden
- [ ] Nivel
- [ ] Titulo
- [ ] Contenido

#### Hoja "Tablas" debe tener:
- [ ] DocumentoID
- [ ] SeccionOrden
- [ ] OrdenTabla
- [ ] Titulo
- [ ] Fuente
- [ ] DatosCSV

#### Hoja "Figuras" debe tener:
- [ ] DocumentoID
- [ ] SeccionOrden
- [ ] OrdenFigura
- [ ] RutaArchivo
- [ ] Caption
- [ ] Fuente

## 🔧 Configuración

### 3. Configurar la URL

- [ ] Abrir `web/js/config.js`
- [ ] Pegar tu URL en `GOOGLE_SHEETS_BASE_URL`
- [ ] Verificar que termine en `/pub`

### 4. Configurar los GIDs

Para cada pestaña de tu Google Sheets:

- [ ] Abrir la pestaña "Documentos"
  - [ ] Copiar el número después de `gid=` en la URL
  - [ ] Pegar en `HOJAS.Documentos` en `config.js`

- [ ] Abrir la pestaña "Secciones"
  - [ ] Copiar el GID
  - [ ] Pegar en `HOJAS.Secciones`

- [ ] Abrir la pestaña "Tablas"
  - [ ] Copiar el GID
  - [ ] Pegar en `HOJAS.Tablas`

- [ ] Abrir la pestaña "Figuras"
  - [ ] Copiar el GID
  - [ ] Pegar en `HOJAS.Figuras`

- [ ] Abrir la pestaña "Bibliografia"
  - [ ] Copiar el GID
  - [ ] Pegar en `HOJAS.Bibliografia`

## 🧪 Pruebas

### 5. Probar la Conexión

- [ ] Abrir `web/test-conexion.html` en el navegador
- [ ] Hacer clic en "🚀 Probar Conexión"
- [ ] Verificar que se carguen los datos
- [ ] Verificar que el número de registros sea correcto

**Si hay errores:**
- [ ] Abrir la consola del navegador (F12)
- [ ] Leer el mensaje de error
- [ ] Verificar la URL y los GIDs

### 6. Probar el Dashboard

- [ ] Abrir `web/index.html` en el navegador
- [ ] Verificar que se muestren los documentos
- [ ] Verificar que los datos sean correctos (título, autor, fecha)
- [ ] Hacer clic en un documento

### 7. Probar el Editor

- [ ] Hacer clic en "Editar" en un documento
- [ ] Verificar que se abra `editor.html`
- [ ] Verificar que se carguen los metadatos
- [ ] Hacer clic en el tab "Secciones"
  - [ ] Verificar que se muestren las secciones
  - [ ] Verificar que estén ordenadas correctamente
- [ ] Hacer clic en el tab "Tablas"
  - [ ] Verificar que se muestren las tablas
- [ ] Hacer clic en el tab "Figuras"
  - [ ] Verificar que se muestren las figuras

## 🎨 Personalización (Opcional)

### 8. Personalizar Colores

- [ ] Abrir `web/css/styles.css`
- [ ] Buscar las variables CSS (`:root`)
- [ ] Cambiar los colores según tu preferencia

### 9. Personalizar Logo

- [ ] Reemplazar `img/logo_sener_transparente.png`
- [ ] Verificar que se vea bien en el header

## 📱 Pruebas Responsive

### 10. Probar en Diferentes Dispositivos

- [ ] Desktop (pantalla grande)
  - [ ] Dashboard se ve bien
  - [ ] Editor se ve bien
  
- [ ] Tablet (pantalla mediana)
  - [ ] Dashboard se adapta
  - [ ] Editor se adapta
  
- [ ] Móvil (pantalla pequeña)
  - [ ] Dashboard es usable
  - [ ] Editor es usable

## 🐛 Solución de Problemas

### Si no se cargan los datos:

1. [ ] Verificar que el Google Sheets esté publicado
2. [ ] Verificar la URL en `config.js`
3. [ ] Verificar los GIDs en `config.js`
4. [ ] Abrir la consola del navegador (F12)
5. [ ] Buscar mensajes de error
6. [ ] Usar `test-conexion.html` para diagnosticar

### Si los datos se ven mal:

1. [ ] Verificar que las columnas tengan los nombres exactos
2. [ ] Verificar que no haya comas en los datos
3. [ ] Verificar que el formato de fecha sea correcto
4. [ ] Verificar que los IDs sean únicos

### Si hay errores de CORS:

1. [ ] Verificar que la URL termine en `/pub`
2. [ ] Verificar que el Google Sheets esté publicado públicamente
3. [ ] No usar `/edit` en la URL

## ✅ Verificación Final

- [ ] `test-conexion.html` funciona correctamente
- [ ] `index.html` muestra todos los documentos
- [ ] `editor.html` carga y muestra un documento completo
- [ ] No hay errores en la consola del navegador
- [ ] Los datos se ven correctos y completos

## 📚 Documentación Consultada

- [ ] He leído `web/README.md`
- [ ] He leído `web/INSTRUCCIONES_USO.md`
- [ ] He leído `web/CONFIGURACION_GOOGLE_SHEETS.md`
- [ ] He revisado `RESUMEN_EDITOR_WEB.md`

## 🎯 Próximos Pasos

Una vez que todo funcione:

- [ ] Compartir la URL del editor con el equipo
- [ ] Capacitar a los usuarios en el uso del editor
- [ ] Decidir si se implementará funcionalidad de edición
- [ ] Considerar despliegue en servidor web (opcional)

---

## 📞 ¿Necesitas Ayuda?

Si algo no funciona:

1. Revisa este checklist punto por punto
2. Usa `test-conexion.html` para diagnosticar
3. Abre la consola del navegador (F12) para ver errores
4. Consulta la documentación en la carpeta `web/`

---

**Fecha de verificación**: _______________

**Verificado por**: _______________

**Estado**: [ ] ✅ Todo funciona  [ ] ⚠️ Hay problemas  [ ] ❌ No funciona
