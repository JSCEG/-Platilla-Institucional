# 🧪 Prueba Rápida del Sistema

## Datos Mínimos para Probar

### Hoja "Documentos" (Fila 2)
```
ID: TEST01
Titulo: Documento de Prueba
Subtitulo: Verificación del sistema
Autor: Equipo Técnico
Fecha: 04/12/2024
Institucion: Secretaría de Energía
Unidad: Unidad de Pruebas
DocumentoCorto: DocPrueba
PalabrasClave: prueba; test; verificación
Version: 0.1
ResumenEjecutivo: Este es un documento de prueba para verificar el funcionamiento del sistema.
DatosClave: Primera prueba exitosa; Sistema operativo; Generación automática
```

### Hoja "Secciones"
```
DocumentoID | Orden | Nivel | Titulo | Contenido
TEST01 | 1 | Seccion | Introducción | Este es un documento de prueba.[[nota:Primera nota al pie]]
TEST01 | 2 | Seccion | Desarrollo | Aquí probamos las listas:

- Primer elemento
- Segundo elemento
- Tercer elemento

Y también las citas.[[cita:prueba2024]]
TEST01 | 2.1 | Subseccion | Detalles | [[destacado]]Este es un texto destacado[[/destacado]]
```

### Hoja "Bibliografia"
```
DocumentoID | Clave | Tipo | Autor | Titulo | Anio | Editorial | Url
TEST01 | prueba2024 | report | SENER | Documento de Prueba | 2024 | SENER | https://www.gob.mx
```

### Hoja "Siglas"
```
DocumentoID | Sigla | Descripcion
TEST01 | SENER | Secretaría de Energía
TEST01 | CFE | Comisión Federal de Electricidad
```

### Hoja "Glosario"
```
DocumentoID | Termino | Definicion
TEST01 | Prueba | Verificación del funcionamiento del sistema
TEST01 | Test | Proceso de validación técnica
```

---

## Pasos para Probar

1. **Copia estos datos** a tu Google Sheets
2. **Selecciona la fila TEST01** en la hoja Documentos
3. **Ejecuta** el menú: 📄 SENER LaTeX > ✨ Generar .tex
4. **Verifica** que aparezcan estos mensajes en el log:
   ```
   🚀 Iniciando generación de LaTeX...
   📄 Procesando documento ID: TEST01
   📑 Secciones encontradas: 3
   📚 Referencias bibliográficas: 1
   🔤 Siglas encontradas: 2
   📖 Términos de glosario: 2
   ✅ Archivo DocPrueba.tex creado
   ✅ Archivo referencias.bib creado con 1 referencias
   ```

5. **Descarga** los archivos de tu carpeta de Drive
6. **Compila** en Overleaf o localmente

---

## Resultado Esperado

El archivo `DocPrueba.tex` debe contener:

✅ Preámbulo con clase sener2025  
✅ Metadatos del documento  
✅ Portada  
✅ Tabla de contenidos  
✅ Resumen ejecutivo  
✅ Datos clave  
✅ Sección 1: Introducción (con nota al pie)  
✅ Sección 2: Desarrollo (con lista y cita)  
✅ Subsección 2.1: Detalles (con texto destacado)  
✅ Glosario con 2 términos  
✅ Siglas con 2 entradas  
✅ Bibliografía  

---

## Si Todo Funciona

🎉 **¡Sistema operativo!** Ahora puedes:

1. Agregar más secciones
2. Insertar figuras (con URLs de Drive)
3. Agregar tablas
4. Expandir el glosario y siglas
5. Generar documentos reales

---

## Si Hay Errores

1. **Revisa el log**: Menú > 📋 Ver log de errores
2. **Verifica nombres de columnas**: Deben ser exactos
3. **Confirma el CARPETA_SALIDA_ID**: Debe ser válido
4. **Checa permisos**: La carpeta debe permitir escritura

---

## Prueba con Figuras (Opcional)

Agrega en la hoja "Figuras":
```
DocumentoID | SeccionOrden | OrdenFigura | RutaArchivo | Caption | Fuente
TEST01 | 2 | 1 | img/logo_sener.png | Logo SENER | Imagen institucional
```

La figura aparecerá al final de la sección 2.

---

## Prueba con Tablas (Opcional)

Agrega en la hoja "Tablas":
```
DocumentoID | SeccionOrden | OrdenTabla | Titulo | Fuente | DatosCSV
TEST01 | 2 | 1 | Datos de prueba | Elaboración propia | Concepto,Valor
Dato 1,100
Dato 2,200
```

La tabla aparecerá al final de la sección 2.

---

## Siguiente Paso

Una vez que la prueba funcione, puedes:

1. **Borrar** los datos de prueba (TEST01)
2. **Crear** tu documento real (D01, D02, etc.)
3. **Llenar** todas las hojas con contenido real
4. **Generar** el documento final

¡Éxito! 🚀
