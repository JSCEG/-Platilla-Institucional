# 🌐 Editor Web SENER LaTeX

Editor web visual para crear y editar documentos LaTeX sin necesidad de conocer comandos LaTeX.

## 🎯 Características

- ✅ **Lee datos desde Google Sheets público** - Sin necesidad de servidor
- ✅ **Interfaz visual completa** - Dashboard y editor
- ✅ **Sin comandos LaTeX** - Todo visual y fácil de usar
- ✅ **Responsive** - Funciona en desktop y móvil
- ✅ **Tiempo real** - Lee datos actualizados del Google Sheets

## 📁 Archivos Principales

```
web/
├── 📄 index.html                   # Dashboard - Lista de documentos
├── 📝 editor.html                  # Editor de documento individual
├── 🧪 test-conexion.html          # Prueba de conexión con Google Sheets
│
├── 📚 INSTRUCCIONES_USO.md        # Guía de uso completa
├── ⚙️ CONFIGURACION_GOOGLE_SHEETS.md  # Cómo configurar la conexión
│
├── css/
│   ├── styles.css                 # Estilos del dashboard
│   └── editor.css                 # Estilos del editor
│
└── js/
    ├── config.js                  # ⚙️ CONFIGURACIÓN (edita aquí)
    ├── api.js                     # API placeholder
    ├── app.js                     # Lógica del dashboard
    └── editor.js                  # Lógica del editor
```

## 🚀 Inicio Rápido (3 pasos)

### 1. Probar la Conexión

Abre `test-conexion.html` en tu navegador y haz clic en "Probar Conexión"

### 2. Ver el Dashboard

Abre `index.html` para ver la lista de documentos

### 3. Editar un Documento

Haz clic en "Editar" en cualquier documento

## ⚙️ Configuración

### URL Actual del Google Sheets

```
https://docs.google.com/spreadsheets/d/e/2PACX-1vQaJ_BNSR2R7nVPc4eKv_YM24IJnO4FyGqJEYq-oyOciFn_2mrHqP5y5ZS61lkQe8jtMEe0IEZmZUMw/pub
```

### Cambiar la URL

Edita `js/config.js` y cambia:

```javascript
const CONFIG = {
    GOOGLE_SHEETS_BASE_URL: 'TU-URL-AQUI',
    // ...
};
```

Ver `CONFIGURACION_GOOGLE_SHEETS.md` para más detalles.

## 📊 Estructura del Google Sheets

El Google Sheets debe tener estas pestañas:

1. **Documentos** - Metadatos de cada documento
2. **Secciones** - Contenido de las secciones
3. **Tablas** - Configuración de tablas
4. **Figuras** - Imágenes y gráficas
5. **Bibliografia** - Referencias bibliográficas
6. **Siglas** - Lista de siglas
7. **Glosario** - Términos y definiciones

## 🎨 Interfaz

### Dashboard (index.html)

- Lista de todos los documentos
- Información básica de cada uno
- Botones para editar, ver preview y generar .tex

### Editor (editor.html)

- **Tab Metadatos**: Título, autor, fecha, etc.
- **Tab Secciones**: Contenido organizado por niveles
- **Tab Tablas**: Configuración de tablas
- **Tab Figuras**: Imágenes y gráficas

## 🔄 Flujo de Trabajo

```
Google Sheets (Datos)
    ↓
config.js (Lee CSV)
    ↓
app.js / editor.js (Procesa)
    ↓
HTML (Muestra)
    ↓
Usuario (Edita visualmente)
```

## 📝 Estado Actual

### ✅ Funciona Ahora

- Cargar documentos desde Google Sheets
- Ver todos los datos en interfaz visual
- Navegación entre documentos
- Interfaz completa y responsive

### 🚧 Próximamente

- Editar y guardar cambios
- Agregar nuevas secciones/tablas/figuras
- Generar .tex desde el navegador
- Editor WYSIWYG para contenido

## 🐛 Solución de Problemas

### No se cargan los datos

1. Abre `test-conexion.html`
2. Verifica la consola (F12)
3. Lee `CONFIGURACION_GOOGLE_SHEETS.md`

### Errores de CORS

- El Google Sheets debe estar **publicado** (no solo compartido)
- La URL debe terminar en `/pub`

## 📖 Documentación

- `INSTRUCCIONES_USO.md` - Guía completa de uso
- `CONFIGURACION_GOOGLE_SHEETS.md` - Cómo configurar la conexión

## 🎯 Ventajas

✅ **Sin servidor** - Todo funciona en el navegador
✅ **Sin instalación** - Solo abre el HTML
✅ **Datos en tiempo real** - Lee directamente del Google Sheets
✅ **Fácil de usar** - Sin comandos LaTeX
✅ **Fácil de compartir** - Solo necesitas un navegador

## 🔗 Integración con Script Local

El script Python local (`preparar_para_google_apps_script.py`) sigue funcionando para generar archivos .tex:

```bash
python preparar_para_google_apps_script.py
```

Ambos sistemas (web y local) leen del mismo Google Sheets.

## 📞 Soporte

Para ayuda:
1. Revisa `INSTRUCCIONES_USO.md`
2. Prueba con `test-conexion.html`
3. Verifica la consola del navegador (F12)

---

**Versión**: 1.0.0  
**Última actualización**: Diciembre 2025  
**Autor**: SENER
