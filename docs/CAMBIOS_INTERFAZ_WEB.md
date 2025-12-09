# Cambios en la Interfaz Web - Estilos Institucionales

## 🎨 Actualizaciones Realizadas

### 1. Preloader Rediseñado

**Antes:**
- Fondo con gradiente guinda
- Spinner blanco
- Texto blanco

**Ahora:**
- ✅ **Fondo blanco** (más limpio y profesional)
- ✅ **Logo de SENER** animado con efecto pulse
- ✅ **Spinner bicolor** (guinda y verde institucional)
- ✅ **Animación fadeInUp** para entrada suave
- ✅ Texto en color oscuro con fuente Noto Sans

**Código CSS:**
```css
.preloader {
  background: white; /* Fondo blanco */
}

.preloader-logo {
  height: 80px;
  animation: pulse 2s ease-in-out infinite;
}

.spinner {
  border-top-color: var(--color-gobmx-guinda);
  border-right-color: var(--color-gobmx-verde);
}
```

---

### 2. Tipografía Institucional

**Fuentes del Template LaTeX:**
- **Patria** → Títulos y encabezados
- **Noto Sans** → Cuerpo de texto

**Fuentes Web (equivalentes):**
- **Montserrat** → Alternativa a Patria (títulos)
- **Noto Sans** → Cuerpo de texto (igual que LaTeX)

**Aplicación:**
```css
:root {
  --font-family-headings: 'Montserrat', sans-serif;
  --font-family-body: 'Noto Sans', sans-serif;
}
```

**Pesos disponibles:**
- Noto Sans: 300 (Light), 400 (Regular), 600 (SemiBold), 700 (Bold)
- Montserrat: 600 (SemiBold), 700 (Bold), 800 (ExtraBold)

---

### 3. Gradientes Institucionales

**Nuevas variables CSS:**
```css
:root {
  /* Gradientes con gama completa de colores */
  --gradient-guinda: linear-gradient(135deg, 
    #9B2247 0%,    /* Guinda principal */
    #7a1b38 50%,   /* Guinda oscuro */
    #5a1429 100%   /* Guinda muy oscuro */
  );
  
  --gradient-verde: linear-gradient(135deg, 
    #1E5B4F 0%,    /* Verde principal */
    #164739 50%,   /* Verde oscuro */
    #0e3328 100%   /* Verde muy oscuro */
  );
  
  --gradient-dorado: linear-gradient(135deg, 
    #A57F2C 0%,    /* Dorado principal */
    #8a6823 50%,   /* Dorado oscuro */
    #6f521a 100%   /* Dorado muy oscuro */
  );
}
```

**Aplicación en componentes:**

#### Botones
```css
.btn-primary {
  background: var(--gradient-guinda);
}

.btn-secondary {
  background: var(--gradient-verde);
}
```

#### Títulos
```css
.header-title,
.section-title {
  background: var(--gradient-guinda);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

#### Footer
```css
.site-footer {
  background: var(--gradient-guinda);
}

.site-footer::before {
  background: var(--gradient-dorado); /* Línea superior */
}
```

---

### 4. Efectos de Hover Mejorados

**Botones con efecto shine:**
```css
.btn-primary::before {
  content: '';
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255,255,255,0.2), 
    transparent
  );
  transition: left 0.5s;
}

.btn-primary:hover::before {
  left: 100%; /* Efecto de brillo deslizante */
}
```

**Tarjetas con overlay gradiente:**
```css
.documento-card:hover::after {
  background: linear-gradient(135deg, 
    var(--color-gobmx-guinda-light) 0%, 
    var(--color-gobmx-verde-light) 100%
  );
  opacity: 0.3;
}
```

---

### 5. Bordes con Gradiente

**Tarjetas de documento:**
```css
.documento-card::before {
  content: '';
  width: 5px;
  height: 100%;
  background: var(--gradient-dorado);
}
```

**Títulos de sección:**
```css
.section-title::after {
  content: '';
  height: 3px;
  background: var(--gradient-guinda);
}
```

---

## 📊 Comparación Visual

### Preloader

**Antes:**
```
┌─────────────────────────────┐
│                             │
│   [Fondo Guinda Oscuro]     │
│                             │
│      ⭕ Spinner Blanco      │
│   "Cargando SENER..."       │
│      (texto blanco)         │
│                             │
└─────────────────────────────┘
```

**Ahora:**
```
┌─────────────────────────────┐
│                             │
│    [Fondo Blanco Limpio]    │
│                             │
│    🏛️ Logo SENER (pulse)    │
│   ⭕ Spinner Guinda/Verde   │
│  "Cargando Editor..."       │
│    (texto oscuro)           │
│                             │
└─────────────────────────────┘
```

### Botones

**Antes:**
```
┌──────────────────┐
│  Color Sólido    │  → Hover: Color más oscuro
└──────────────────┘
```

**Ahora:**
```
┌──────────────────┐
│ Gradiente 3 tonos│  → Hover: Efecto shine + elevación
└──────────────────┘
```

### Títulos

**Antes:**
```
Título en Color Sólido
─────────────────────── (línea sólida)
```

**Ahora:**
```
Título con Gradiente de Texto
═══════════════════════ (línea con gradiente)
```

---

## 🎯 Paleta de Colores Completa

### Guinda (Rojo Institucional)
```
#9B2247  ████  Principal
#7a1b38  ████  Oscuro
#5a1429  ████  Muy Oscuro
```

### Verde Institucional
```
#1E5B4F  ████  Principal
#164739  ████  Oscuro
#0e3328  ████  Muy Oscuro
```

### Dorado Institucional
```
#A57F2C  ████  Principal
#8a6823  ████  Oscuro
#6f521a  ████  Muy Oscuro
```

---

## 🚀 Cómo Usar

### Aplicar Gradiente a un Elemento

**Fondo:**
```css
.mi-elemento {
  background: var(--gradient-guinda);
}
```

**Texto:**
```css
.mi-titulo {
  background: var(--gradient-verde);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

**Borde:**
```css
.mi-caja {
  border-left: 5px solid transparent;
  border-image: var(--gradient-dorado) 1;
}
```

---

## 📱 Responsive

Todos los gradientes y efectos funcionan correctamente en:
- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1199px)
- ✅ Mobile (< 768px)

---

## ⚡ Performance

**Optimizaciones aplicadas:**
- Uso de `transform` en lugar de `top/left` para animaciones
- `will-change` en elementos animados
- Transiciones suaves con `cubic-bezier`
- Preload de fuentes con `preconnect`

---

## 🎨 Ejemplos de Uso

### Crear un Botón con Gradiente Verde

```html
<button class="btn btn-secondary">
  <i class="fas fa-check"></i>
  Guardar
</button>
```

### Crear una Tarjeta con Borde Dorado

```html
<div class="documento-card">
  <h3>Mi Documento</h3>
  <p>Descripción...</p>
</div>
```

### Crear un Título con Gradiente

```html
<h2 class="section-title">Mi Sección</h2>
```

---

## 📝 Notas Técnicas

### Compatibilidad de Gradientes en Texto

```css
/* Estándar */
background-clip: text;

/* Webkit (Chrome, Safari, Edge) */
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

**Soporte:**
- ✅ Chrome 120+
- ✅ Firefox 49+
- ✅ Safari 14+
- ✅ Edge 79+

### Fallback para Navegadores Antiguos

```css
.section-title {
  color: var(--color-gobmx-guinda); /* Fallback */
  background: var(--gradient-guinda);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

---

## 🔄 Migración desde Versión Anterior

Si ya tienes código con la versión anterior:

**Cambiar:**
```css
/* Antes */
background-color: var(--color-gobmx-guinda);

/* Ahora */
background: var(--gradient-guinda);
```

**Títulos:**
```css
/* Antes */
color: var(--color-gobmx-guinda);

/* Ahora */
background: var(--gradient-guinda);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

---

## ✅ Checklist de Implementación

- [x] Preloader con fondo blanco
- [x] Logo SENER en preloader
- [x] Spinner bicolor (guinda/verde)
- [x] Fuentes institucionales (Montserrat + Noto Sans)
- [x] Gradientes de 3 tonos (guinda, verde, dorado)
- [x] Botones con efecto shine
- [x] Títulos con gradiente de texto
- [x] Tarjetas con borde gradiente
- [x] Footer con gradiente
- [x] Efectos hover mejorados
- [x] Responsive design
- [x] Optimización de performance

---

## 🎉 Resultado Final

La interfaz ahora refleja completamente la identidad institucional:
- ✅ Colores oficiales con gradientes profesionales
- ✅ Tipografía consistente con el template LaTeX
- ✅ Preloader limpio y elegante
- ✅ Efectos visuales modernos
- ✅ Experiencia de usuario mejorada
