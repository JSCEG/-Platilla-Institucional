# 📊 Ejemplo de Estructura en Google Sheets

## Hoja: Documentos

| ID  | Titulo | Subtitulo | Autor | Fecha | Institucion | Unidad | DocumentoCorto | PalabrasClave | Version | ResumenEjecutivo | DatosClave |
|-----|--------|-----------|-------|-------|-------------|--------|----------------|---------------|---------|------------------|------------|
| D01 | Informe Institucional de Energía 2025 | Avances y perspectivas | DGPE | 30/06/2025 | Secretaría de Energía | Unidad de Planeación | InformeEnergia25 | energía; renovables | 1.0 | Este informe presenta... | Capacidad renovable 35%; Emisiones reducidas 12% |

---

## Hoja: Secciones

| DocumentoID | Orden | Nivel | Titulo | Contenido |
|-------------|-------|-------|--------|-----------|
| D01 | 1 | Seccion | Contexto general | El sistema energético mexicano enfrenta...[[nota:Datos del BNE 2024]] |
| D01 | 2 | Seccion | Evolución de la capacidad | Durante 2020-2025, la capacidad...[[cita:bne2024]] |
| D01 | 2.1 | Subseccion | Integración de renovables | La integración de fuentes renovables... |
| D01 | 2.1.1 | Subsubsección | Papel de las renovables | Las energías renovables representan... |

---

## Hoja: Bibliografia

| DocumentoID | Clave | Tipo | Autor | Titulo | Anio | Editorial | Url |
|-------------|-------|------|-------|--------|------|-----------|-----|
| D01 | bne2024 | report | SENER | Balance Nacional de Energía 2024 | 2025 | SENER | https://www.gob.mx/sener |
| D01 | cenace2023 | article | CENACE | Retos operativos | 2023 | Revista SEN | https://cenace.gob.mx |

---

## Ejemplo de Contenido con Etiquetas

### Contenido Simple
```
El sistema energético mexicano ha experimentado cambios significativos en los últimos años.
```

### Contenido con Lista
```
Los principales retos son:

- Transición energética
- Seguridad de suministro
- Reducción de emisiones
```

### Contenido con Nota y Cita
```
La capacidad renovable alcanzó el 35% del total.[[nota:Incluye solar, eólica e hidroeléctrica]][[cita:bne2024]]
```

### Contenido con Bloque Destacado
```
[[destacado]]
La coordinación interinstitucional es fundamental para el éxito de la transición energética.
[[/destacado]]

El gobierno ha implementado diversas políticas...
```

### Contenido con Ejemplo
```
[[ejemplo:Caso de éxito]]
En el estado de Oaxaca, la capacidad eólica instalada creció un 45% entre 2020 y 2025.
[[/ejemplo]]
```

### Contenido con Matemáticas
```
La eficiencia energética se define como:

[[ecuacion:
\eta = \frac{E_{util}}{E_{total}} \times 100
]]

Donde [[math:\eta]] es la eficiencia en porcentaje.
```

---

## Flujo de Trabajo Completo

1. **Llenar Documentos**: Crea una fila con los metadatos del documento
2. **Agregar Secciones**: Crea filas en Secciones con el mismo DocumentoID
3. **Agregar Referencias**: Si usas citas, agrégalas en Bibliografia
4. **Generar**: Selecciona la fila en Documentos y usa el menú SENER LaTeX
5. **Descargar**: Los archivos .tex y .bib estarán en tu carpeta de Drive
6. **Compilar**: Sube a Overleaf o compila localmente con XeLaTeX

---

## Tips y Mejores Prácticas

### ✅ Hacer
- Usa IDs descriptivos (D01, D02, etc.)
- Ordena las secciones con números decimales (1, 1.1, 1.1.1)
- Escribe contenido en párrafos cortos
- Usa etiquetas para formato especial
- Revisa el log de errores si algo falla

### ❌ Evitar
- No uses caracteres especiales en DocumentoCorto (sin espacios, acentos, ñ)
- No repitas IDs de documento
- No dejes campos obligatorios vacíos (ID, Titulo, DocumentoID)
- No uses comillas dobles dentro de las etiquetas [[...]]

---

## Resultado Final

Al generar el documento D01, obtendrás:

📄 **InformeEnergia25.tex** - Documento LaTeX completo
📚 **referencias.bib** - Bibliografía en formato BibTeX

Estos archivos, junto con `sener2025.cls` y las carpetas `img/` y `tipografias/`, se compilan para producir un PDF profesional con:

- Portada institucional
- Tabla de contenidos
- Resumen ejecutivo
- Datos clave destacados
- Secciones con formato correcto
- Notas al pie
- Citas bibliográficas
- Bloques especiales
- Contraportada

🎉 ¡Todo sin escribir una línea de LaTeX!
