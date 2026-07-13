# Consentimiento de privacidad Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Exigir consentimiento explícito antes de iniciar o enviar una encuesta con datos personales.

**Architecture:** Se insertará una sección de consentimiento entre la captura de datos y el cuestionario. `app.js` conservará el consentimiento sólo en memoria, bloqueará la navegación sin la casilla marcada y lo comprobará de nuevo dentro de `sendToSheet` antes de crear cualquier solicitud.

**Tech Stack:** HTML5, CSS3, JavaScript vanilla, Google Apps Script y Playwright CLI para verificar el flujo en navegador.

## Global Constraints

- No modificar preguntas, criterio de candidato, estructura de Google Sheets ni endpoint.
- No enviar datos al endpoint real durante pruebas; verificar las solicitudes mediante un endpoint local controlado.
- Al regresar o salir sin consentimiento, borrar datos y consentimiento sólo en memoria.
- Mantener el estilo visual existente en `style-v2.css`.

---

### Task 1: Añadir la pantalla de consentimiento

**Files:**
- Modify: `index.html:121-143`
- Modify: `style-v2.css:560-694`
- Test: navegador local con Playwright CLI

**Interfaces:**
- Consumes: los campos `nombre`, `fecha`, `empresa`, `telefono` y `correo` de la sección `patient`.
- Produces: sección `#consent`, casilla `#privacy-consent`, botón `#btn-consent-continue`, botón `#btn-back-consent` y botón `#btn-exit-consent`.

- [ ] **Step 1: Verificar la ausencia inicial del paso de consentimiento**

Run:

```bash
rg -n 'id="consent"|privacy-consent|btn-consent-continue' index.html
```

Expected: no output.

- [ ] **Step 2: Crear el marcado mínimo de consentimiento**

Insertar entre `#patient` y `#quiz` una sección con el aviso de privacidad existente, una casilla con etiqueta asociada y tres acciones: regresar, salir y continuar. El botón de continuar debe iniciar con `disabled`.

```html
<input type="checkbox" id="privacy-consent">
<label for="privacy-consent">He leído el Aviso de Privacidad y autorizo el tratamiento de mis datos.</label>
<button id="btn-consent-continue" class="btn-primary" disabled>Comenzar cuestionario</button>
```

- [ ] **Step 3: Aplicar estilos accesibles al control**

Añadir reglas para que la casilla y su etiqueta sean legibles, clicables y mantengan un indicador de foco visible.

```css
.consent-check:focus-within {
  outline: 3px solid #3C5775;
  outline-offset: 3px;
}
```

- [ ] **Step 4: Verificar la interfaz en el navegador**

Run:

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

En otra terminal, abrir `http://127.0.0.1:4173/`, introducir datos válidos y pulsar continuar. Expected: se ve el aviso; “Comenzar cuestionario” está deshabilitado hasta marcar la casilla.

### Task 2: Bloquear el flujo y el envío sin consentimiento

**Files:**
- Modify: `app.js:26-85`
- Modify: `app.js:249-302`
- Test: navegador local con endpoint local controlado

**Interfaces:**
- Consumes: `#privacy-consent`, `#btn-consent-continue`, `#btn-back-consent` y `#btn-exit-consent`.
- Produces: variable booleana `hasPrivacyConsent`, función `clearPatientData()` y `sendToSheet(isCandidate)` bloqueado sin consentimiento.

- [ ] **Step 1: Reproducir que el flujo actual no tiene barrera de consentimiento**

Run:

```bash
rg -n 'hasPrivacyConsent|privacy-consent' app.js
```

Expected: no output.

- [ ] **Step 2: Añadir el estado y navegación de consentimiento**

Después de validar los datos, guardar los valores en memoria, restablecer la casilla y mostrar `#consent`. Sólo al marcarla se habilita continuar; al pulsar continuar se asigna `hasPrivacyConsent = true`, se muestra `#quiz` y se llama a `renderQuestion()`.

```js
let hasPrivacyConsent = false;

document.getElementById('privacy-consent').addEventListener('change', event => {
  document.getElementById('btn-consent-continue').disabled = !event.target.checked;
});
```

- [ ] **Step 3: Centralizar el descarte local**

Crear `clearPatientData()` para vaciar los campos, las variables de paciente, las respuestas, el temporizador y `hasPrivacyConsent`. Usarla al regresar sin consentimiento, al salir sin consentimiento y al reiniciar la encuesta.

```js
function clearPatientData() {
  if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
  autoAdvanceTimer = null;
  currentQuestion = 0;
  answers = new Array(formData.preguntas.length).fill(null);
  patientName = '';
  patientDate = '';
  patientEmpresa = '';
  patientTelefono = '';
  patientCorreo = '';
  hasPrivacyConsent = false;
  document.getElementById('privacy-consent').checked = false;
  document.getElementById('btn-consent-continue').disabled = true;
  document.getElementById('nombre').value = '';
  document.getElementById('fecha').value = '';
  document.getElementById('empresa').value = '';
  document.getElementById('telefono').value = '';
  document.getElementById('correo').value = '';
}
```

- [ ] **Step 4: Proteger el envío**

Hacer que `sendToSheet` salga antes de construir `URLSearchParams` cuando `hasPrivacyConsent` sea falso.

```js
function sendToSheet(isCandidate) {
  if (!hasPrivacyConsent) {
    console.warn('Consentimiento de privacidad no otorgado. Datos no enviados.');
    return;
  }
  const params = new URLSearchParams({
    id: 'ivc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    fecha_envio: new Date().toISOString().replace('T', ' ').substring(0, 19),
    paciente: patientName,
    fecha_cuestionario: patientDate,
    empresa: patientEmpresa,
    telefono: patientTelefono,
    correo: patientCorreo,
    resultado: isCandidate ? 'Candidato' : 'No candidato'
  });
}
```

- [ ] **Step 5: Confirmar el flujo bloqueado**

En el navegador local, capturar datos válidos y llegar a `#consent`. Intentar continuar sin marcar la casilla. Expected: permanece en el aviso y no aparece ninguna solicitud hacia el endpoint.

### Task 3: Verificar resultados y limpiar residuos de interfaz obsoleta

**Files:**
- Modify: `index.html:169-206,220-237`
- Modify: `app.js:313-325`
- Test: navegador local con Playwright CLI

**Interfaces:**
- Consumes: el aviso de privacidad reubicado y la función `clearPatientData()`.
- Produces: resultado sin aviso duplicado y carga sin el error de `btn-close-tab` inexistente.

- [ ] **Step 1: Reproducir el error de carga actual**

Run el sitio local y revisar la consola. Expected actual: `Cannot read properties of null (reading 'addEventListener')` en `app.js:314`.

- [ ] **Step 2: Retirar el aviso duplicado y los controles sin flujo activo**

Eliminar el bloque `#privacy-notice` de resultado y el manejador de `#btn-close-tab`, que no existe en el HTML. Conservar el botón de salida de resultado actual.

- [ ] **Step 3: Confirmar el flujo con consentimiento sin tocar datos reales**

Temporalmente, abrir la aplicación desde un servidor local y sustituir el endpoint en el contexto de prueba por una URL local que sólo registre solicitudes. Completar los ocho reactivos tras aceptar el aviso. Expected: una sola solicitud y sólo después del consentimiento.

- [ ] **Step 4: Confirmar que regresar o salir sin consentimiento no transmite nada**

Desde la pantalla de consentimiento, probar “Regresar” y “Salir” con la casilla desmarcada. Expected: los datos se limpian, no se llama al endpoint local y no queda consentimiento al volver a empezar.

- [ ] **Step 5: Ejecutar comprobaciones finales**

Run:

```bash
node --check app.js
cp code.gs /tmp/cuestionario-code.js
node --check /tmp/cuestionario-code.js
rm /tmp/cuestionario-code.js
git diff --check
```

Expected: todos los comandos terminan sin errores.
