# Corrección - Error de Validación de Orden

## 🐛 Problema Identificado

### Síntoma
- Modal aparentemente lleno con todos los campos
- Error: "El orden debe ser un número mayor a 0"
- Modal se queda abierto sin procesar

### Causa Raíz
El auto-completado se ejecutaba **DESPUÉS** de la validación, no antes:

```javascript
// FLUJO INCORRECTO:
1. Usuario hace click en "Crear Figura"
2. Se obtienen valores de campos (algunos vacíos)
3. Se valida (falla porque orden está vacío)
4. Se muestra error
5. Auto-completado se ejecuta (demasiado tarde)
```

## ✅ Solución Implementada

### Reorganización del Flujo
```javascript
// FLUJO CORRECTO:
document.getElementById('crear-figura-btn').addEventListener('click', () => {
    // 1. PRIMERO: Auto-completar campos vacíos
    if (!tituloInput.value.trim()) {
        tituloInput.value = 'Nueva figura';
    }
    if (!fuenteInput.value.trim()) {
        fuenteInput.value = 'Elaboración propia';
    }
    if (!rutaInput.value.trim() && seccionInput.value.trim() && ordenInput.value.trim()) {
        rutaInput.value = `img/graficos/figura_${seccionInput.value.trim()}_${ordenInput.value.trim()}.png`;
    }
    
    // 2. SEGUNDO: Obtener valores DESPUÉS del auto-completado
    const seccion = seccionInput.value.trim();
    const orden = parseInt(ordenInput.value);
    // ... resto de validaciones
});
```

### Validación Mejorada
```javascript
// Validación más robusta con debug
const ordenValue = ordenInput.value.trim();
console.log('Validando orden:', { ordenValue, orden, isNaN: isNaN(orden) });

if (!ordenValue || ordenValue === '' || isNaN(orden) || orden < 1) {
    showError('⚠️ El orden debe ser un número mayor a 0');
    ordenInput.focus();
    ordenInput.select();
    return;
}
```

### Eliminación de Código Duplicado
- Removido el auto-completado duplicado que se ejecutaba con `addEventListener(..., true)`
- Consolidado todo en un solo flujo lineal

## 🔄 Flujo Corregido

### Antes (Problemático)
1. Click en "Crear Figura"
2. Obtener valores (algunos vacíos)
3. Validar (falla)
4. Mostrar error
5. Auto-completar (demasiado tarde)

### Después (Correcto)
1. Click en "Crear Figura"
2. **Auto-completar campos vacíos**
3. **Obtener valores actualizados**
4. Validar (ahora con valores completos)
5. Procesar o mostrar error específico

## 🧪 Testing

### Archivo de Prueba
- **Creado**: `web/test-orden-validation.html`
- **Incluye**: Debug info para verificar valores
- **Verifica**: Flujo completo de auto-completado → validación

### Casos de Prueba
1. **Campos pre-llenados**: Debería funcionar sin errores
2. **Campos vacíos**: Auto-completado + validación exitosa
3. **Orden inválido**: Error específico con focus

## 📊 Valores por Defecto

| Campo | Valor | Cuándo se Aplica |
|-------|-------|------------------|
| Sección | Sugerido | Al abrir modal |
| Orden | Sugerido | Al abrir modal |
| Título | "Nueva figura" | Si está vacío al crear |
| Ruta | `img/graficos/figura_X_Y.png` | Si está vacío y hay sección/orden |
| Fuente | "Elaboración propia" | Si está vacío al crear |

## 🎯 Resultado

- ✅ **Auto-completado funciona**: Se ejecuta antes de validar
- ✅ **Validación robusta**: Verifica múltiples condiciones
- ✅ **Debug mejorado**: Console.log para troubleshooting
- ✅ **Flujo lineal**: Sin duplicación de código
- ✅ **UX mejorada**: Modal procesa correctamente

El modal ahora debería funcionar correctamente sin quedarse colgado en errores de validación.