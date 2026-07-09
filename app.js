// ===================== DATOS DEL CUESTIONARIO =====================
const formData = {
  titulo: "¿Necesito una prueba de IVC?",
  descripcion: "La Insuficiencia Venosa Crónica (IVC) es un problema circulatorio grave en el cual las venas de las piernas no pueden bombear suficiente sangre de regreso al corazón. Afecta a más de 65 millones de mexicanos, es decir que 7 de cada 10 adultos padecen esta enfermedad, la mayoría mayores de 40 años.",
  instrucciones: "Ponga una Palomita \"Sí\" o \"No\".",
  preguntas: [
    { id: 1, pregunta: "¿Tiene las piernas hinchadas, con dolor, rojas o calientes al tacto?" },
    { id: 2, pregunta: "¿Ha tenido algún coágulo de sangre en una vena que le haya causado inflamación, dolor o irritación?" },
    { id: 3, pregunta: "¿Tiene várices, venas ensanchadas o hinchadas que sobresalen de la superficie de la piel, en las piernas?" },
    { id: 4, pregunta: "¿Ha tenido una Trombosis Venosa Profunda (TVP) en el pasado y presenta dolor, hinchazón, cambios en el color de la piel, celulitis o úlceras que no sanan?" },
    { id: 5, pregunta: "¿Siente las piernas pesadas, cansadas, inquietas o con dolor?" },
    { id: 6, pregunta: "Si presiona su pie, tobillo o pierna hinchada por 10 segundos y suelta, ¿su huella deja un hundimiento o marca?" },
    { id: 7, pregunta: "Si sus pies, tobillos y piernas están hinchados, ¿la piel se ve estirada o brillosa?" },
    { id: 8, pregunta: "¿Tiene alguna úlcera en la parte interna del tobillo?" }
  ]
};

// ===================== ENDPOINT GOOGLE SHEET =====================
// Pega aquí la URL del Web App de Apps Script después de implementarlo
const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxRzRXX8biPJiYZuKNBFkK4xTbbvnVpm-IsFEtUSS0M91xqo32tkde0HbGuPfhM91Gx/exec';

// ===================== PONDERACIÓN =====================
// Cualquier respuesta "Sí" → candidato a evaluación
const UMBRAL_CANDIDATO = 1;

// ===================== ESTADO =====================
let currentQuestion = 0;
let answers = new Array(formData.preguntas.length).fill(null);
let patientName = "";
let patientDate = "";
let patientEmpresa = "";
let patientTelefono = "";
let patientCorreo = "";
let autoAdvanceTimer = null;

// ===================== NAVEGACIÓN =====================
function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

// ===================== INICIO =====================
document.getElementById('btn-start').addEventListener('click', () => {
  showSection('patient');
  document.getElementById('fecha').valueAsDate = new Date();
});

document.getElementById('btn-back-patient').addEventListener('click', () => {
  showSection('info');
});

document.getElementById('btn-start-test').addEventListener('click', () => {
  patientName = document.getElementById('nombre').value.trim();
  patientDate = document.getElementById('fecha').value;
  patientEmpresa = document.getElementById('empresa').value.trim();
  patientTelefono = document.getElementById('telefono').value.trim();
  patientCorreo = document.getElementById('correo').value.trim();

  if (!patientName) {
    alert('Por favor escriba su nombre completo.');
    return;
  }
  if (!patientDate) {
    alert('Por favor seleccione la fecha.');
    return;
  }

  // Validar teléfono si fue capturado
  if (patientTelefono && !/^[0-9]{10}$/.test(patientTelefono)) {
    alert('El número de teléfono debe tener 10 dígitos.');
    return;
  }

  // Validar correo si fue capturado
  if (patientCorreo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientCorreo)) {
    alert('Por favor ingrese un correo electrónico válido.');
    return;
  }

  currentQuestion = 0;
  answers = new Array(formData.preguntas.length).fill(null);
  showSection('quiz');
  renderQuestion();
});

// ===================== CUESTIONARIO =====================
function renderQuestion() {
  const q = formData.preguntas[currentQuestion];
  const container = document.getElementById('question-container');

  container.innerHTML = `
    <div class="question-card">
      <div class="question-meta">
        <div class="question-number">${q.id}</div>
        <span class="question-label">Pregunta ${q.id} de ${formData.preguntas.length}</span>
      </div>
      <div class="question-text">${q.pregunta}</div>
      <div class="options">
        <button class="option-btn ${answers[currentQuestion] === true ? 'selected-yes' : ''}"
                onclick="selectAnswer(true)">Sí</button>
        <button class="option-btn ${answers[currentQuestion] === false ? 'selected-no' : ''}"
                onclick="selectAnswer(false)">No</button>
      </div>
    </div>
  `;

  // Actualizar barra de progreso
  const pct = ((currentQuestion) / formData.preguntas.length) * 100;
  document.getElementById('progress-bar').style.width = pct + '%';
  document.getElementById('progress-text').textContent =
    `Pregunta ${currentQuestion + 1} de ${formData.preguntas.length}`;

  // Botones
  document.getElementById('btn-prev').disabled = currentQuestion === 0;

  const btnNext = document.getElementById('btn-next');
  btnNext.textContent = currentQuestion === formData.preguntas.length - 1 ? 'Ver resultado' : 'Siguiente';
  btnNext.disabled = answers[currentQuestion] === null;
}

function selectAnswer(value) {
  // Cancelar cualquier auto-avance pendiente
  if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);

  answers[currentQuestion] = value;
  renderQuestion();

  // Auto-avanzar después de 450ms (tiempo para ver la selección)
  autoAdvanceTimer = setTimeout(() => {
    if (currentQuestion < formData.preguntas.length - 1) {
      currentQuestion++;
      renderQuestion();
    } else {
      showResult();
    }
  }, 450);
}

document.getElementById('btn-prev').addEventListener('click', () => {
  if (autoAdvanceTimer) {
    clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = null;
  }
  if (currentQuestion > 0) {
    currentQuestion--;
    renderQuestion();
  }
});

document.getElementById('btn-next').addEventListener('click', () => {
  if (autoAdvanceTimer) {
    clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = null;
  }
  if (answers[currentQuestion] === null) return;

  if (currentQuestion < formData.preguntas.length - 1) {
    currentQuestion++;
    renderQuestion();
  } else {
    showResult();
  }
});

// ===================== RESULTADO =====================
function showResult() {
  const yesCount = answers.filter(a => a === true).length;
  const isCandidate = yesCount >= UMBRAL_CANDIDATO;

  // Mostrar datos del paciente
  document.getElementById('patient-name-display').textContent = patientName || '—';
  const [yyyy, mm, dd] = patientDate.split('-');
  document.getElementById('patient-date-display').textContent = `${dd}/${mm}/${yyyy}`;
  document.getElementById('patient-empresa-display').textContent = patientEmpresa || '—';
  document.getElementById('patient-telefono-display').textContent = patientTelefono || '—';
  document.getElementById('patient-correo-display').textContent = patientCorreo || '—';

  const resultCard = document.getElementById('result-card');
  resultCard.className = 'card result-card ' + (isCandidate ? 'candidate' : 'not-candidate');

  resultCard.innerHTML = `
    <div class="result-icon">${isCandidate ? '✓' : '!'}</div>
    <div class="result-title">
      ${isCandidate ? 'Usted es candidato para una prueba vascular' : 'Sin indicadores suficientes por el momento'}
    </div>
    <div class="result-message">
      ${isCandidate
        ? 'Con base en sus respuestas, se recomienda realizar un examen vascular para evaluar su estado de salud venosa. Contacte a nuestros especialistas para agendar su cita.'
        : 'Con base en sus respuestas, no se detectan indicadores suficientes de IVC en este momento. Si presenta síntomas en el futuro, consulte a su médico.'}
    </div>
    <div class="result-score">
      Respuestas afirmativas: ${yesCount} de ${formData.preguntas.length}
    </div>
  `;

  // Resumen de respuestas
  const summaryDiv = document.getElementById('answers-summary');
  summaryDiv.innerHTML = formData.preguntas.map((q, i) => `
    <div class="summary-item">
      <span class="summary-question">${q.id}. ${q.pregunta}</span>
      <span class="summary-answer ${answers[i] ? 'si' : 'no'}">${answers[i] ? 'Sí' : 'No'}</span>
    </div>
  `).join('');

  // Desglose: respuestas positivas y negativas
  const positiveAnswers = formData.preguntas
    .map((q, i) => ({ ...q, answer: answers[i] }))
    .filter(item => item.answer === true);
  const negativeAnswers = formData.preguntas
    .map((q, i) => ({ ...q, answer: answers[i] }))
    .filter(item => item.answer === false);

  const breakdownDiv = document.getElementById('response-breakdown');
  breakdownDiv.innerHTML = `
    <div class="breakdown-col breakdown-positive">
      <h3 class="breakdown-title">
        <span class="breakdown-icon">✓</span>
        Respuestas positivas (${positiveAnswers.length})
      </h3>
      <ul class="breakdown-list">
        ${positiveAnswers.length > 0
          ? positiveAnswers.map(q => `<li><strong>${q.id}.</strong> ${q.pregunta}</li>`).join('')
          : '<li class="breakdown-empty">Ninguna</li>'}
      </ul>
    </div>
    <div class="breakdown-col breakdown-negative">
      <h3 class="breakdown-title">
        <span class="breakdown-icon">−</span>
        Respuestas negativas (${negativeAnswers.length})
      </h3>
      <ul class="breakdown-list">
        ${negativeAnswers.length > 0
          ? negativeAnswers.map(q => `<li><strong>${q.id}.</strong> ${q.pregunta}</li>`).join('')
          : '<li class="breakdown-empty">Ninguna</li>'}
      </ul>
    </div>
  `;

  // Barra al 100%
  document.getElementById('progress-bar').style.width = '100%';

  // Enviar a Google Sheet
  sendToSheet(isCandidate);

  showSection('result');
}

// ===================== ENVIAR A GOOGLE SHEET =====================
function sendToSheet(isCandidate) {
  if (!SHEET_ENDPOINT) {
    console.warn('SHEET_ENDPOINT no configurado. Datos no enviados.');
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

  const url = SHEET_ENDPOINT + '?' + params.toString();

  // sendBeacon es más confiable: funciona aunque la página se cierre
  if (navigator.sendBeacon) {
    const sent = navigator.sendBeacon(url);
    if (sent) {
      console.log('Datos enviados via sendBeacon');
      return;
    }
  }

  // Fallback con fetch
  fetch(url, { method: 'GET', mode: 'no-cors' })
    .then(() => console.log('Datos enviados via fetch'))
    .catch(err => console.error('Error enviando al Sheet:', err));
}

// ===================== REINICIAR (volver a la encuesta) =====================
document.getElementById('btn-restart').addEventListener('click', () => {
  if (autoAdvanceTimer) {
    clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = null;
  }
  currentQuestion = 0;
  answers = new Array(formData.preguntas.length).fill(null);
  patientName = '';
  patientDate = '';
  patientEmpresa = '';
  patientTelefono = '';
  patientCorreo = '';
  document.getElementById('nombre').value = '';
  document.getElementById('fecha').value = '';
  document.getElementById('empresa').value = '';
  document.getElementById('telefono').value = '';
  document.getElementById('correo').value = '';
  showSection('info');
});

// ===================== SALIR =====================
const INSTAGRAM_URL = 'https://www.instagram.com/hospitalsandiegodealcala/?hl=es';
let redirectTimer = null;
let countdownInterval = null;

document.getElementById('btn-exit').addEventListener('click', () => {
  // Mostrar pantalla de despedida
  showSection('goodbye');

  // Countdown de 5 segundos
  let seconds = 5;
  const countdownEl = document.getElementById('countdown');
  if (countdownEl) countdownEl.textContent = seconds;

  countdownInterval = setInterval(() => {
    seconds--;
    if (countdownEl) countdownEl.textContent = seconds;
    if (seconds <= 0) clearInterval(countdownInterval);
  }, 1000);

  // Después de 5 segundos, redirigir a Instagram
  redirectTimer = setTimeout(() => {
    window.location.href = INSTAGRAM_URL;
  }, 5000);
});

// Cancelar redirección si el usuario quiere quedarse
document.getElementById('btn-cancel-redirect')?.addEventListener('click', () => {
  if (redirectTimer) { clearTimeout(redirectTimer); redirectTimer = null; }
  if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }
  const counter = document.querySelector('.goodbye-counter');
  if (counter) counter.style.display = 'none';
  document.getElementById('btn-cancel-redirect').textContent = 'Cerrar ventana';
  document.getElementById('btn-cancel-redirect').onclick = () => window.close();
});

// ===================== CERRAR PESTAÑA =====================
document.getElementById('btn-close-tab').addEventListener('click', () => {
  window.close();
  // Fallback: si window.close no funciona (no abierta por script),
  // el usuario verá el botón y la nota para cerrar manualmente
  setTimeout(() => {
    document.querySelector('.goodbye-container').innerHTML += `
      <p class="goodbye-fallback">
        Si la ventana no se cerró, use Ctrl+W (Cmd+W en Mac) o cierre la pestaña manualmente.
      </p>
    `;
  }, 200);
});