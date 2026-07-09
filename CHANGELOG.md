# Bitácora de cambios — Evaluación Angiología

## 📋 Resumen

Aplicación web tipo cuestionario para evaluar candidatos a una prueba vascular de Insuficiencia Venosa Crónica (IVC). Hospital San Diego de Alcalá · Endo 360.

## 🎯 Características finales

- ✅ Cuestionario interactivo de 8 preguntas sí/no
- ✅ Auto-avance al responder (450ms)
- ✅ Ponderación: cualquier respuesta "Sí" = candidato
- ✅ Captura de datos del paciente (nombre, fecha, empresa, teléfono, correo)
- ✅ Validación de teléfono (10 dígitos) y correo (regex)
- ✅ Envío automático a Google Sheets vía Apps Script
- ✅ Aviso de Privacidad conforme a LFPDPPP
- ✅ Diseño con identidad HSDA + Endo 360
- ✅ Pantalla de resultado con desglose de respuestas positivas/negativas
- ✅ Botón "Salir" redirige directo a Instagram HSDA
- ✅ QR de la app con isotipo HSDA
- ✅ Responsive (móvil, tablet, desktop)
- ✅ Hospedado en GitHub Pages

## 🔄 Historial de cambios

### v1.0 — Estructura base
- ✅ Creación de `index.html` con 4 secciones: info, paciente, cuestionario, resultado
- ✅ `style.css` con paleta HSDA
- ✅ `app.js` con lógica del cuestionario
- ✅ Formulario con 5 campos: nombre, fecha, empresa, teléfono, correo

### v2.0 — Identidad HSDA
- ✅ Aplicación de paleta oficial: `#33394C` `#3C5775` `#A5B7CF` `#F8F4EF`
- ✅ Tipografía Avenir
- ✅ Logo HSDA en header
- ✅ Aviso de Privacidad inicial

### v3.0 — Rediseño visual (Refined Clinical Modernism)
- ✅ Cards redondeadas 16-22px con sombras multi-capa
- ✅ Botones 3D con gradient + inset highlight + drop shadow
- ✅ Hero con gradient mesh atmosférico
- ✅ Grain SVG sutil
- ✅ Animaciones staggered en carga
- ✅ Hover lift en cards
- ✅ Títulos con borde vertical gradient azul

### v4.0 — Mejoras de UX
- ✅ Auto-avance del cuestionario (450ms)
- ✅ Ponderación: cualquier "Sí" = candidato
- ✅ Botones Sí/No con efecto 3D
- ✅ Badge circular 3D con número de pregunta
- ✅ Progress bar con gradient + glow

### v5.0 — Marca completa
- ✅ Logo Endo 360 en header
- ✅ Logo Endo 360 en specialty-card
- ✅ Imagen de angiología translúcida en card "¿Qué es la IVC?"
- ✅ Ponderación ajustada a 1 (cualquier Sí = candidato)

### v6.0 — Aviso de Privacidad legal
- ✅ Texto legal LFPDPPP Art. 3 y Art. 14
- ✅ HOSPITAL SAN DIEGO DE ALCALÁ S.A.P.I DE C.V. como responsable
- ✅ ARA SOFTWARE DESING, S.A. DE C.V. como encargado
- ✅ Centro de Operaciones, email, web
- ✅ Icono SVG de escudo con check (blanco sobre azul)

### v7.0 — Integración Google Sheets
- ✅ `code.gs` (Google Apps Script) para backend
- ✅ Endpoint GET con query params (más confiable que POST)
- ✅ `sendToSheet()` con `navigator.sendBeacon` (fallback)
- ✅ Envío automático al mostrar resultado
- ✅ Sin duplicados

### v8.0 — GitHub Pages
- ✅ Repositorio: `fimbresr/evaluacion-angiologia`
- ✅ URL: https://fimbresr.github.io/evaluacion-angiologia/
- ✅ Push inicial con todos los archivos
- ✅ GitHub Pages activado

### v9.0 — Fixes móvil
- ✅ `touch-action: manipulation` (evita delay 300ms en iOS)
- ✅ `-webkit-tap-highlight-color: transparent`
- ✅ `min-height: 48px` (estándar Apple/Google)
- ✅ `user-select: none`
- ✅ `isolation: isolate` en `.cta-container`
- ✅ `pointer-events: none` en pseudos `::before` y `::after`
- ✅ `z-index: 2` en botones para evitar intercepción

### v10.0 — QR + Instagram
- ✅ `qr-evaluacion-angiologia.png` con isotipo HSDA
- ✅ `isotipo-hsda.png` extraído
- ✅ Botón "Salir" redirige a Instagram HSDA: `https://www.instagram.com/hospitalsandiegodealcala/?hl=es`
- ✅ `window.location.href` directo (sin pantalla de despedida)

## 📁 Estructura del proyecto

```
/Users/renefimbres/Documents/cuestionario comercializacion/
├── index.html              # Estructura HTML
├── style.css               # Estilos (versión actual)
├── style-v2.css            # Estilos (caché-bust alternativo)
├── app.js                  # Lógica del cuestionario
├── code.gs                 # Backend Google Apps Script
├── logo-hsda.png           # Logo Hospital San Diego
├── logo endo360.png        # Logo Endo 360 (sin fondo blanco)
├── isotipo-hsda.png        # Isotipo HSDA solo
├── img1.png                # Imagen angiología translúcida
├── qr-evaluacion-angiologia.png  # QR con isotipo
├── formulario_prueba_ivc.json    # JSON original
├── README.md               # Documentación principal
├── CHANGELOG.md            # Este archivo
└── .gitignore
```

## 🔧 Configuración técnica

### Google Sheet
- **Documento**: Angiologia
- **Pestaña**: Hoja 1
- **Encabezados**: id, fecha_envio, paciente, fecha_cuestionario, empresa, telefono, correo, resultado

### Apps Script
- **URL**: `https://script.google.com/macros/s/AKfycbxRzRXX8biPJiYZuKNBFkK4xTbbvnVpm-IsFEtUSS0M91xqo32tkde0HbGuPfhM91Gx/exec`
- **Método**: GET con query params
- **Acceso**: Cualquier persona

### GitHub
- **Repo**: `https://github.com/fimbresr/evaluacion-angiologia`
- **URL pública**: `https://fimbresr.github.io/evaluacion-angiologia/`
- **Branch**: main

## 🚀 Deploy

Para actualizar en producción:
```bash
cd "/Users/renefimbres/Documents/cuestionario comercializacion"
git add -A
git commit -m "descripción del cambio"
git push
```

GitHub Pages se actualiza automáticamente en 1-2 minutos.

## 📊 URLs importantes

| Recurso | URL |
|---------|-----|
| App | https://fimbresr.github.io/evaluacion-angiologia/ |
| Repo | https://github.com/fimbresr/evaluacion-angiologia |
| QR | `/Users/renefimbres/Documents/cuestionario comercializacion/qr-evaluacion-angiologia.png` |
| Instagram destino | https://www.instagram.com/hospitalsandiegodealcala/?hl=es |
| Aviso Privacidad | https://hospitalsandiegodealcala.com/aviso-de-privacidad/ |

---

**Hospital San Diego de Alcalá · Endo 360 · Angiología y Cirugía Vascular**
