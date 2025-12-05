# ✅ Checklist de Implementación

## 📋 Guía paso a paso para implementar el sistema

---

## Fase 1: Preparación (15 minutos)

### ☐ 1.1 Crear carpeta en Google Drive
- [ ] Crear carpeta "Documentos SENER LaTeX"
- [ ] Copiar el ID de la carpeta desde la URL
- [ ] Formato: `https://drive.google.com/drive/folders/[ESTE_ES_EL_ID]`
- [ ] Guardar el ID en un lugar seguro

### ☐ 1.2 Preparar archivos del template
- [ ] Verificar que tienes `sener2025.cls`
- [ ] Verificar carpeta `img/` con todas las imágenes
- [ ] Verificar carpeta `tipografias/` con las fuentes
- [ ] Subir estos archivos a la carpeta de Drive

---

## Fase 2: Configurar Google Sheets (20 minutos)

### ☐ 2.1 Crear el Google Sheets
- [ ] Crear nuevo Google Sheets
- [ ] Nombrar: "Generador Documentos SENER"

### ☐ 2.2 Crear las hojas (nombres exactos)
- [ ] Hoja "Documentos"
- [ ] Hoja "Secciones"
- [ ] Hoja "Figuras"
- [ ] Hoja "Tablas"
- [ ] Hoja "Datos Tablas"
- [ ] Hoja "Siglas"
- [ ] Hoja "Glosario"
- [ ] Hoja "Bibliografia"

### ☐ 2.3 Configurar columnas en "Documentos"
```
ID | Titulo | Subtitulo | Autor | Fecha | Institucion | Unidad | 
DocumentoCorto | PalabrasClave | Version | ResumenEjecutivo | DatosClave
```
- [ ] Copiar estos nombres exactos en la fila 1
- [ ] Aplicar formato de encabezado (negrita, color de fondo)

### ☐ 2.4 Configurar columnas en "Secciones"
```
DocumentoID | Orden | Nivel | Titulo | Contenido
```
- [ ] Copiar estos nombres exactos en la fila 1
- [ ] Aplicar formato de encabezado

### ☐ 2.5 Configurar columnas en "Figuras"
```
DocumentoID | SeccionOrden | OrdenFigura | RutaArchivo | Caption | Fuente
```
- [ ] Copiar estos nombres exactos en la fila 1
- [ ] Aplicar formato de encabezado

### ☐ 2.6 Configurar columnas en "Tablas"
```
DocumentoID | SeccionOrden | OrdenTabla | Titulo | Fuente | DatosCSV
```
- [ ] Copiar estos nombres exactos en la fila 1
- [ ] Aplicar formato de encabezado

### ☐ 2.7 Configurar columnas en "Datos Tablas"
```
A | B | C | D | E
```
- [ ] Esta hoja es libre, solo para almacenar datos
- [ ] No requiere configuración especial

### ☐ 2.8 Configurar columnas en "Siglas"
```
DocumentoID | Sigla | Descripcion
```
- [ ] Copiar estos nombres exactos en la fila 1
- [ ] Aplicar formato de encabezado

### ☐ 2.9 Configurar columnas en "Glosario"
```
DocumentoID | Termino | Definicion
```
- [ ] Copiar estos nombres exactos en la fila 1
- [ ] Aplicar formato de encabezado

### ☐ 2.10 Configurar columnas en "Bibliografia"
```
DocumentoID | Clave | Tipo | Autor | Titulo | Anio | Editorial | Url
```
- [ ] Copiar estos nombres exactos en la fila 1
- [ ] Aplicar formato de encabezado

---

## Fase 3: Instalar el Script (10 minutos)

### ☐ 3.1 Abrir el editor de Apps Script
- [ ] En el Google Sheets: Extensiones > Apps Script
- [ ] Se abrirá una nueva pestaña

### ☐ 3.2 Preparar el código
- [ ] Abrir el archivo `google_apps_script_FINAL.js`
- [ ] Copiar TODO el contenido (Ctrl+A, Ctrl+C)

### ☐ 3.3 Pegar el código
- [ ] En el editor de Apps Script, borrar el código por defecto
- [ ] Pegar el código copiado (Ctrl+V)

### ☐ 3.4 Configurar el ID de carpeta
- [ ] Buscar la línea 13: `const CARPETA_SALIDA_ID = '...'`
- [ ] Reemplazar con tu ID de carpeta de Drive
- [ ] Ejemplo: `const CARPETA_SALIDA_ID = '1NnO4B8EJCx6VNrmDxWwwW3KsHCTID_c2';`

### ☐ 3.5 Guardar el proyecto
- [ ] Hacer clic en el icono de guardar (💾) o Ctrl+S
- [ ] Nombrar el proyecto: "Generador LaTeX SENER"
- [ ] Cerrar la pestaña del editor

### ☐ 3.6 Recargar el Google Sheets
- [ ] Volver a la pestaña del Google Sheets
- [ ] Recargar la página (F5)
- [ ] Esperar a que cargue completamente

### ☐ 3.7 Verificar el menú
- [ ] Buscar el menú "📄 SENER LaTeX" en la barra superior
- [ ] Si no aparece, esperar 10 segundos y recargar de nuevo
- [ ] Si aún no aparece, revisar la consola de Apps Script

---

## Fase 4: Prueba Inicial (15 minutos)

### ☐ 4.1 Crear documento de prueba
- [ ] Ir a la hoja "Documentos"
- [ ] En la fila 2, llenar:
  ```
  ID: TEST01
  Titulo: Documento de Prueba
  Subtitulo: Verificación del sistema
  Autor: Equipo Técnico
  Fecha: [Fecha actual]
  Institucion: Secretaría de Energía
  Unidad: Unidad de Pruebas
  DocumentoCorto: DocPrueba
  PalabrasClave: prueba; test
  Version: 0.1
  ResumenEjecutivo: Este es un documento de prueba.
  DatosClave: Primera prueba; Sistema operativo
  ```

### ☐ 4.2 Crear secciones de prueba
- [ ] Ir a la hoja "Secciones"
- [ ] Agregar 3 filas:
  ```
  Fila 2: TEST01 | 1 | Seccion | Introducción | Este es un documento de prueba.
  Fila 3: TEST01 | 2 | Seccion | Desarrollo | Contenido de desarrollo.
  Fila 4: TEST01 | 2.1 | Subseccion | Detalles | Más detalles aquí.
  ```

### ☐ 4.3 Agregar bibliografía de prueba
- [ ] Ir a la hoja "Bibliografia"
- [ ] Agregar 1 fila:
  ```
  TEST01 | prueba2024 | report | SENER | Documento de Prueba | 2024 | SENER | https://www.gob.mx
  ```

### ☐ 4.4 Generar el documento
- [ ] Volver a la hoja "Documentos"
- [ ] Hacer clic en cualquier celda de la fila 2 (TEST01)
- [ ] Ir al menú: 📄 SENER LaTeX > ✨ Generar .tex de este documento
- [ ] Esperar el mensaje de confirmación

### ☐ 4.5 Verificar el resultado
- [ ] Ir a tu carpeta de Google Drive
- [ ] Buscar el archivo "DocPrueba.tex"
- [ ] Buscar el archivo "referencias.bib"
- [ ] Descargar ambos archivos

### ☐ 4.6 Revisar el log
- [ ] Menú: 📄 SENER LaTeX > 📋 Ver log de errores
- [ ] Verificar que no haya errores
- [ ] Debe mostrar:
  ```
  🚀 Iniciando generación de LaTeX...
  📄 Procesando documento ID: TEST01
  📑 Secciones encontradas: 3
  📚 Referencias bibliográficas: 1
  ✅ Archivo DocPrueba.tex creado
  ✅ Archivo referencias.bib creado con 1 referencias
  ```

---

## Fase 5: Compilación de Prueba (10 minutos)

### ☐ 5.1 Preparar archivos para Overleaf
- [ ] Descargar "DocPrueba.tex" de Drive
- [ ] Descargar "referencias.bib" de Drive
- [ ] Tener listos: sener2025.cls, carpetas img/ y tipografias/

### ☐ 5.2 Crear proyecto en Overleaf
- [ ] Ir a overleaf.com
- [ ] Crear cuenta o iniciar sesión
- [ ] Crear nuevo proyecto en blanco

### ☐ 5.3 Subir archivos
- [ ] Subir "DocPrueba.tex"
- [ ] Subir "referencias.bib"
- [ ] Subir "sener2025.cls"
- [ ] Subir carpeta "img/" completa
- [ ] Subir carpeta "tipografias/" completa

### ☐ 5.4 Configurar compilador
- [ ] Hacer clic en "Menu" (esquina superior izquierda)
- [ ] En "Compiler", seleccionar "XeLaTeX"
- [ ] Cerrar el menú

### ☐ 5.5 Compilar
- [ ] Hacer clic en "Recompile"
- [ ] Esperar a que compile (puede tardar 30-60 segundos)
- [ ] Verificar que no haya errores

### ☐ 5.6 Revisar el PDF
- [ ] Ver el PDF generado en el panel derecho
- [ ] Verificar:
  - [ ] Portada con título correcto
  - [ ] Tabla de contenidos
  - [ ] Resumen ejecutivo
  - [ ] Datos clave
  - [ ] Secciones 1, 2 y 2.1
  - [ ] Bibliografía al final

---

## Fase 6: Capacitación del Equipo (30 minutos)

### ☐ 6.1 Preparar material de capacitación
- [ ] Imprimir o compartir "INSTRUCCIONES_COMPLETAS.md"
- [ ] Preparar ejemplos reales
- [ ] Tener el Google Sheets abierto

### ☐ 6.2 Demostración en vivo
- [ ] Mostrar cómo llenar la hoja "Documentos"
- [ ] Mostrar cómo agregar secciones
- [ ] Demostrar el uso de etiquetas especiales
- [ ] Mostrar cómo generar el documento
- [ ] Demostrar la compilación en Overleaf

### ☐ 6.3 Práctica guiada
- [ ] Pedir al equipo que cree un documento de prueba
- [ ] Supervisar el proceso
- [ ] Resolver dudas en tiempo real

### ☐ 6.4 Documentar preguntas frecuentes
- [ ] Anotar las dudas más comunes
- [ ] Crear un documento de FAQ si es necesario

---

## Fase 7: Producción (Continuo)

### ☐ 7.1 Crear plantilla de documento
- [ ] Crear un documento "PLANTILLA" en el Sheets
- [ ] Llenar con datos de ejemplo
- [ ] Usar como base para nuevos documentos

### ☐ 7.2 Establecer convenciones
- [ ] Definir nomenclatura de IDs (D01, D02, etc.)
- [ ] Establecer estructura de secciones estándar
- [ ] Definir formato de figuras y tablas

### ☐ 7.3 Crear biblioteca de recursos
- [ ] Carpeta de imágenes institucionales
- [ ] Biblioteca de siglas comunes
- [ ] Glosario estándar

### ☐ 7.4 Mantenimiento
- [ ] Revisar logs periódicamente
- [ ] Actualizar documentación según necesidades
- [ ] Recopilar feedback del equipo

---

## 🎉 ¡Sistema Implementado!

Una vez completado este checklist:

✅ El sistema está operativo  
✅ El equipo está capacitado  
✅ Los procesos están documentados  
✅ Listo para producción  

---

## 📞 Soporte Post-Implementación

### Problemas Comunes

**El menú no aparece:**
- Recargar el Google Sheets
- Verificar que el script esté guardado
- Revisar permisos de Apps Script

**Error al generar:**
- Revisar el log de errores
- Verificar nombres de columnas
- Confirmar que el ID de carpeta sea correcto

**Error al compilar:**
- Verificar que uses XeLaTeX
- Confirmar que todos los archivos estén presentes
- Revisar que las rutas de imágenes sean correctas

### Contacto
- Revisar documentación completa
- Consultar INSTRUCCIONES_COMPLETAS.md
- Contactar al equipo técnico con el log de errores

---

## 📊 Métricas de Éxito

Después de la implementación, medir:

- [ ] Tiempo de generación de documentos (antes vs después)
- [ ] Número de errores de formato
- [ ] Satisfacción del equipo
- [ ] Documentos generados por semana

**Meta:** Reducir el tiempo de generación de documentos en un 80%

---

**Fecha de implementación:** _______________  
**Responsable:** _______________  
**Estado:** ☐ En progreso  ☐ Completado
