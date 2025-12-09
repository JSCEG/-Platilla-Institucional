"""
Script para preparar archivos HTML para Google Apps Script
Combina HTML, CSS y JS en archivos listos para copiar/pegar
"""

def leer_archivo(ruta):
    try:
        with open(ruta, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Error leyendo {ruta}: {e}")
        return ""

def crear_index_completo():
    """Crea index.html con CSS y JS inline"""
    
    html = leer_archivo('web/index.html')
    css_styles = leer_archivo('web/css/styles.css')
    js_api = leer_archivo('web/js/api.js')
    js_app = leer_archivo('web/js/app.js')
    
    # Reemplazar links de CSS por contenido inline
    html = html.replace(
        '<link rel="stylesheet" href="css/styles.css">',
        f'<style>\n{css_styles}\n</style>'
    )
    
    # Reemplazar scripts por contenido inline
    html = html.replace(
        '<script src="js/api.js"></script>\n    <script src="js/app.js"></script>',
        f'<script>\n{js_api}\n\n{js_app}\n</script>'
    )
    
    # Guardar
    with open('web/index_completo.html', 'w', encoding='utf-8') as f:
        f.write(html)
    
    print("✅ Creado: web/index_completo.html")

def crear_editor_completo():
    """Crea editor.html con CSS y JS inline"""
    
    html = leer_archivo('web/editor.html')
    css_styles = leer_archivo('web/css/styles.css')
    css_editor = leer_archivo('web/css/editor.css')
    js_api = leer_archivo('web/js/api.js')
    js_editor = leer_archivo('web/js/editor.js')
    
    # Reemplazar links de CSS
    html = html.replace(
        '<link rel="stylesheet" href="css/styles.css">\n    <link rel="stylesheet" href="css/editor.css">',
        f'<style>\n{css_styles}\n\n{css_editor}\n</style>'
    )
    
    # Reemplazar scripts
    html = html.replace(
        '<script src="js/api.js"></script>\n    <script src="js/editor.js"></script>',
        f'<script>\n{js_api}\n\n{js_editor}\n</script>'
    )
    
    # Guardar
    with open('web/editor_completo.html', 'w', encoding='utf-8') as f:
        f.write(html)
    
    print("✅ Creado: web/editor_completo.html")

def crear_instrucciones():
    """Crea archivo con instrucciones de copiado"""
    
    instrucciones = """
# INSTRUCCIONES PARA GOOGLE APPS SCRIPT

## Paso 1: Copiar Code.gs

1. Abre tu Google Sheets
2. Ve a Extensiones > Apps Script
3. Selecciona todo el contenido de Code.gs
4. Bórralo
5. Abre el archivo: google_apps_script_FINAL.js
6. Copia TODO el contenido
7. Pégalo en Code.gs
8. Guarda (Ctrl+S)

## Paso 2: Crear index.html

1. En Apps Script, haz clic en el + junto a "Archivos"
2. Selecciona "HTML"
3. Nómbralo: index
4. Abre el archivo: web/index_completo.html
5. Copia TODO el contenido
6. Pégalo en index.html
7. Guarda

## Paso 3: Crear editor.html

1. Crear nuevo archivo HTML
2. Nómbralo: editor
3. Abre el archivo: web/editor_completo.html
4. Copia TODO el contenido
5. Pégalo en editor.html
6. Guarda

## Paso 4: Desplegar

1. Haz clic en "Implementar" > "Nueva implementación"
2. Tipo: "Aplicación web"
3. Ejecutar como: "Yo"
4. Acceso: "Cualquier usuario de tu organización"
5. Haz clic en "Implementar"
6. Copia la URL
7. Abre la URL en tu navegador

## ¡Listo!

Ahora deberías ver tus documentos reales de Google Sheets.

## Solución de Problemas

### No veo mis documentos
- Verifica que la hoja "Documentos" exista
- Verifica que tenga datos (al menos una fila)
- Abre la consola del navegador (F12) y busca errores

### Error de permisos
- Autoriza los permisos cuando te lo pida
- Ve a "Avanzado" y permite el acceso

### Los estilos no se ven
- Verifica que copiaste TODO el contenido de los archivos _completo.html
- Recarga la página con Ctrl+F5
"""
    
    with open('INSTRUCCIONES_DESPLIEGUE.txt', 'w', encoding='utf-8') as f:
        f.write(instrucciones)
    
    print("✅ Creado: INSTRUCCIONES_DESPLIEGUE.txt")

if __name__ == '__main__':
    print("🚀 Preparando archivos para Google Apps Script...\n")
    
    crear_index_completo()
    crear_editor_completo()
    crear_instrucciones()
    
    print("\n✅ ¡Archivos preparados!")
    print("\n📋 Archivos creados:")
    print("   - web/index_completo.html")
    print("   - web/editor_completo.html")
    print("   - INSTRUCCIONES_DESPLIEGUE.txt")
    print("\n📖 Lee INSTRUCCIONES_DESPLIEGUE.txt para los siguientes pasos")
