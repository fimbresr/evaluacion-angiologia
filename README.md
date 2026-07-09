# Evaluación Angiología

Aplicación web tipo cuestionario para evaluar si una persona es candidata a una prueba vascular de Insuficiencia Venosa Crónica (IVC).

## Características

- Cuestionario interactivo de 8 preguntas (Sí/No)
- Auto-avance al responder
- Ponderación: cualquier respuesta "Sí" indica candidato
- Captura de datos del paciente (nombre, fecha, empresa, teléfono, correo)
- Envío automático de resultados a Google Sheets
- Aviso de Privacidad conforme a la Ley Federal de Protección de Datos Personales
- Diseño con identidad HSDA · Endo 360

## Stack

- HTML5 + CSS3 + JavaScript vanilla (sin frameworks)
- Google Apps Script como backend para Google Sheets
- Hospedado en GitHub Pages

## Archivos

- `index.html` — Estructura
- `style.css` — Estilos
- `app.js` — Lógica del cuestionario
- `code.gs` — Script de Google Apps Script (copiar a Apps Script)
- `logo-hsda.png` — Logo Hospital San Diego de Alcalá
- `logo endo360.png` — Logo Endo 360
- `img1.png` — Imagen representativa (angiología)

## Configuración

1. Crear Google Sheet "Angiologia"
2. Extensiones → Apps Script → Pegar `code.gs`
3. Implementar como Web App (acceso: Cualquier persona)
4. Copiar URL del Web App
5. Pegar en `app.js` constante `SHEET_ENDPOINT`

## Aviso de Privacidad

Los datos se manejan conforme al Art. 3 y Art. 14 de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares. Encargado del tratamiento: ARA SOFTWARE DESING, S.A. DE C.V.

---

Hospital San Diego de Alcalá · Endo 360 · Angiología y Cirugía Vascular
