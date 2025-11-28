# 📊 Template Completo de Google Sheets para Documentos SENER

Este archivo contiene la estructura COMPLETA con datos de ejemplo para crear un Google Sheet que genere documentos PDF institucionales.

**Instrucciones para ChatGPT/Claude:**
> Genera un Google Sheet con las siguientes 12 pestañas. Cada pestaña debe tener exactamente las columnas y filas especificadas. Incluye todos los datos de ejemplo proporcionados.

---

## 📋 PESTAÑA 1: Metadata

**Descripción:** Información general del documento

```csv
Campo,Valor
Título,PRODESEN 2025-2030
Subtítulo,Programa de Desarrollo del Sistema Eléctrico Nacional
Autor,Dr. Jorge Marcial Islas Samperio
Fecha,Noviembre 2025
Institución,Secretaría de Energía
Unidad,Subsecretaría de Planeación y Transición Energética
DocumentoCorto,PRODESEN 2025–2039
PalabrasClave,"energía, planeación, sistema eléctrico, renovables, transición energética"
Version,2.0
```

---

## 📋 PESTAÑA 2: Secciones

**Descripción:** Estructura del documento (capítulos/secciones principales)

```csv
Número,Título,Subtítulo,TienePortada
1,Disposiciones de Texto,Ortotipografía y Columnas,SI
2,Elementos de la Plantilla,Tipografía y Estilos,SI
3,Tablas y Gráficos,Visualización de Datos Institucionales,SI
4,Elementos Avanzados,Funcionalidades de Alto Nivel,SI
5,Referencias y Anexos,Información Complementaria,SI
```

---

## 📋 PESTAÑA 3: Contenido

**Descripción:** Todo el texto del documento (párrafos, subsecciones, elementos especiales)

```csv
Sección,Orden,Tipo,Contenido,Opciones
1,10,subseccion,Texto a una columna,
1,20,parrafo,"El texto estándar se presenta a una columna, ideal para la lectura continua y documentos oficiales que requieren claridad y formalidad.",
1,30,subseccion,Texto a dos columnas,
1,40,parrafo,"Para secciones que requieren mayor densidad de información o un estilo más periodístico, se puede utilizar el entorno de dos columnas. Este formato es especialmente útil para comparaciones o listados extensos.",columnas=2
2,10,subseccion,Tipografía y Texto,
2,20,parrafo,"La plantilla utiliza las tipografías institucionales **Patria** para títulos y **Noto Sans** para el cuerpo del texto, asegurando legibilidad y consistencia con la identidad gráfica del Gobierno de México.",
2,30,subseccion,Recuadros y Cajas Destacadas,
2,40,parrafo,Se han diseñado recuadros específicos para resaltar información clave en diferentes contextos.,
2,50,subseccion,Citas Destacadas,
2,60,destacado,La planeación energética es fundamental para la soberanía nacional y el desarrollo sustentable de México.,
3,10,subseccion,Tablas Profesionales,
3,20,parrafo,Se ofrecen 5 estilos de tablas predefinidos para cubrir distintas necesidades de presentación de datos.,
3,30,subseccion,Ejemplos de Gráficos Institucionales,
3,40,parrafo,"La plantilla permite la inclusión de gráficos de alta resolución, mapas y diagramas complejos.",
4,10,letraCapital,E|sta es una demostración,
4,20,parrafo,"de la funcionalidad de **Letra Capital** (Drop Cap). Este estilo es común en publicaciones editoriales de alta calidad y ayuda a guiar la vista del lector al inicio de una sección importante.",
4,30,notaMargen,Esta es una nota al margen. Úsala para comentarios o glosas sin interrumpir el flujo del texto.,
4,40,subseccion,Códigos QR Generados,
4,50,parrafo,"Para documentos impresos que requieren enlazar a recursos digitales, la plantilla puede generar códigos QR automáticamente.",
4,60,qrcode,https://www.gob.mx/sener,label=Sitio Oficial SENER
4,70,subseccion,Badges y Etiquetas,
4,80,parrafo,Los badges son perfectos para categorizar o destacar información clave de forma visual.,
4,90,subseccion,Barras de Progreso,
4,100,parrafo,"Las barras de progreso son ideales para visualizar avances hacia metas energéticas y objetivos institucionales.",
4,110,subseccion,Líneas de Tiempo,
4,120,parrafo,Las timelines permiten visualizar cronologías de proyectos o hitos históricos del sector energético.,
5,10,subseccion,Sistema de Citas y Referencias,
5,20,parrafo,"La plantilla utiliza el formato **APA** para citas y referencias, gestionado por biblatex.",
5,30,subseccion,Glosario de Términos,
5,40,lista,"Capacidad instalada: Potencia nominal de las centrales eléctricas|Factor de planta: Relación entre energía generada y capacidad nominal|Energías limpias: Fuentes sin emisiones de GEI|Sistema Eléctrico Nacional: Conjunto de instalaciones de generación y distribución",tipo=description
```

---

## 📋 PESTAÑA 4: Tablas

**Descripción:** Definición de todas las tablas del documento

```csv
ID,Sección,Orden,Caption,Estilo,Label
tab1,3,10,Capacidad instalada por región al cierre de 2024,guinda,tab:capacidad
tab2,3,20,Proyectos de energías renovables 2025-2030,verde,tab:renovables
tab3,3,30,Inversión programada por sector 2025-2030 (MDP),dorado,tab:inversion
```

---

## 📋 PESTAÑA 5: Tabla_tab1_Datos

**Descripción:** Datos de la tabla de capacidad instalada

```csv
Región,Capacidad (MW),Demanda (MW),Factor (%)
Baja California,3500,2300,68
Noroeste,5100,3900,73
Norte,6800,4500,71
Occidental,7200,5100,75
Central,12400,9800,79
**Total**,**35000**,**25600**,**73**
```

---

## 📋 PESTAÑA 6: Tabla_tab2_Datos

**Descripción:** Datos de proyectos de energías renovables

```csv
Tecnología,Proyectos,Capacidad (MW),Inversión (MDP)
Solar fotovoltaica,45,5200,98000
Eólica,28,3800,95000
Hidroeléctrica,12,1200,48000
**Total**,**85**,**10200**,**241000**
```

---

## 📋 PESTAÑA 7: Tabla_tab3_Datos

**Descripción:** Datos de inversión programada

```csv
Sector,Inversión,Participación (%)
Generación,850000,63.0
Transmisión,320000,23.7
Distribución,180000,13.3
**Total**,**1350000**,**100.0**
```

---

## 📋 PESTAÑA 8: Figuras

**Descripción:** Definición de imágenes y gráficos

```csv
ID,Sección,Orden,Archivo,Caption,Ancho,Label
fig1,3,40,mapa_sen_2025.png,"Regiones y enlaces del Sistema Eléctrico Nacional en 2025. Detalle de la infraestructura de transmisión.",1.0,fig:mapa-sen
fig2,3,50,adicion_capacidad.png,"Adición de capacidad proyectada 2025-2030. Comparativa por tecnología y año.",1.0,fig:adicion
fig3,3,60,mapa_gasoductos_2024.png,"Red nacional de gasoductos en 2024. Infraestructura crítica para el sector energético.",1.0,fig:gasoductos
```

**Nota:** Las imágenes deben estar en la carpeta `img/graficos/` del proyecto LaTeX

---

## 📋 PESTAÑA 9: Callouts

**Descripción:** Recuadros destacados (avisos, advertencias, información importante)

```csv
Sección,Orden,Tipo,Título,Contenido
2,70,recuadro,,Este es un recuadro informativo general. Úselo para destacar información relevante que complementa el texto principal sin interrumpir la lectura.
2,80,importante,,"Las notas importantes utilizan el color guinda institucional. Son ideales para advertencias, requisitos legales o información crítica."
2,90,definicion,,"**Sistema Eléctrico Nacional (SEN):** Conjunto de instalaciones destinadas a la generación, transmisión y distribución de energía eléctrica en todo el territorio nacional."
2,100,datosclave,,"**Indicadores del sector eléctrico 2024:**|Capacidad instalada: 91,800 MW|Demanda máxima: 52,302 MW|Energías limpias: 31.2%"
4,130,calloutTip,Consejo,Para maximizar la eficiencia energética se recomienda implementar sistemas de monitoreo en tiempo real y análisis predictivo.
4,140,calloutWarning,Atención,Los plazos de entrega para proyectos de infraestructura crítica deben cumplirse estrictamente para evitar sanciones regulatorias.
4,150,calloutImportant,Crítico,La meta de 35% de energías limpias para 2024 requiere acción inmediata en todos los sectores del sistema energético nacional.
```

---

## 📋 PESTAÑA 10: Bibliografia

**Descripción:** Referencias bibliográficas en formato estructurado

```csv
ID,Tipo,Autor,Título,Año,Editorial/Journal,Otros
rodriguez2023planeacion,book,"Rodríguez, A.",Planeación Energética en México,2023,Editorial Académica,pages={1-300}
gomez2023renovables,article,"Gómez, L.",Energías Renovables en México,2023,Revista Energía,"volume={15},number={2},pages={45-67}"
sener2024pladese,report,SENER,PLADESE 2024-2030,2024,SENER,type={Reporte Técnico}
sener2024portal,online,SENER,Portal Oficial de la Secretaría de Energía,2024,,url={www.gob.mx/sener}
iea2023outlook,report,IEA,World Energy Outlook 2023,2023,International Energy Agency,type={Annual Report}
```

---

## 📋 PESTAÑA 11: NotasPie

**Descripción:** Notas al pie de página

```csv
Sección,Orden,Referencia,Texto
2,5,1,Según el artículo 27 constitucional y la Ley de la Industria Eléctrica vigente.
3,15,2,Datos actualizados al 31 de diciembre de 2024. Fuente: CFE y CRE.
3,25,3,Fuente: CFE - Reporte Anual 2024 y Programa de Obras e Inversiones del Sector Eléctrico.
4,65,4,Los códigos QR son compatibles con cualquier lector estándar de smartphones.
5,25,5,Para más información consulte el Manual de Estilo APA 7ª edición.
```

---

## 📋 PESTAÑA 12: Badges

**Descripción:** Etiquetas visuales tipo "pills"

```csv
Sección,Orden,Texto,Color
4,85,NUEVO,guinda
4,86,APROBADO,verde
4,87,2025,dorado
4,88,PRIORITARIO,gris
4,89,ACTIVO,verde
4,90,95%,dorado
```

---

## 📋 PESTAÑA 13: ProgressBars

**Descripción:** Barras de progreso para visualizar metas

```csv
Sección,Orden,Porcentaje,Etiqueta,Color
4,105,31.2,Energías Limpias: 31.2% de 35%,verde
4,106,68,Cobertura Eléctrica Nacional: 68%,dorado
4,107,85,Modernización de Red: 85%,guinda
4,108,42,Reducción de Emisiones: 42% de 50%,verde
```

---

## 📋 PESTAÑA 14: Timeline

**Descripción:** Eventos para líneas de tiempo

```csv
Sección,TimelineID,Posicion,Año,Descripción
4,tl1,0,2020,Inicio del PRODESEN
4,tl1,3,2022,Primera Revisión
4,tl1,6,2024,Evaluación Intermedia
4,tl1,9,2027,Segunda Revisión
4,tl1,12,2030,Meta Final 35% Limpias
```

---

## 🎯 INSTRUCCIONES PARA CREAR EL GOOGLE SHEET

### Para ChatGPT/Claude:

1. **Crea un nuevo Google Sheet** llamado "SENER - Template Documentos"

2. **Crea 14 pestañas** con estos nombres exactos:
   - Metadata
   - Secciones
   - Contenido
   - Tablas
   - Tabla_tab1_Datos
   - Tabla_tab2_Datos
   - Tabla_tab3_Datos
   - Figuras
   - Callouts
   - Bibliografia
   - NotasPie
   - Badges
   - ProgressBars
   - Timeline

3. **En cada pestaña:**
   - La primera fila debe ser los encabezados (nombres de columnas)
   - Las filas siguientes son los datos
   - Copia exactamente los datos de las tablas CSV de arriba

4. **Formato especial:**
   - En las tablas de datos (Tabla_tab1_Datos, etc.), las filas de totales tienen texto en **negritas** (marcado con `**texto**`)
   - Aplica formato de negrita a esas celdas

5. **Compartir:**
   - Una vez creado, haz el Sheet público: "Cualquiera con el enlace puede ver"
   - Proporciona el enlace para compartir

---

## 📸 IMÁGENES NECESARIAS

Para que el documento compile correctamente, necesitas estas imágenes en la carpeta `img/graficos/`:

1. **mapa_sen_2025.png** - Mapa del Sistema Eléctrico Nacional
2. **adicion_capacidad.png** - Gráfico de barras de adición de capacidad
3. **mapa_gasoductos_2024.png** - Mapa de la red de gasoductos

**Puedes:**
- Usar imágenes placeholder temporalmente
- Generar gráficos con Python/Excel y exportar como PNG
- Usar las imágenes del template original si están disponibles

---

## ✅ VALIDACIÓN

Una vez creado el Google Sheet, verifica:

- ✅ Tiene exactamente 14 pestañas
- ✅ Cada pestaña tiene los encabezados correctos
- ✅ Los datos están completos
- ✅ El Sheet es público o compartido
- ✅ Puedes copiar el ID del Sheet desde la URL

---

## 🚀 USO DEL TEMPLATE

1. Copia este Google Sheet como base
2. Modifica el contenido según tu documento
3. Usa la aplicación web para generar el PDF
4. El sistema leerá automáticamente todas las pestañas y generará el LaTeX completo

---

**Nota:** Este template incluye TODOS los elementos disponibles en `sener2025.cls` para demostración. En documentos reales, puedes omitir las pestañas que no necesites.
