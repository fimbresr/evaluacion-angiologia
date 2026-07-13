/**
 * ============================================================
 * CUESTIONARIO IVC — Backend Google Apps Script
 * Recibe los datos del cuestionario web y los inserta en Sheet
 * ============================================================
 *
 * INSTRUCCIONES DE INSTALACIÓN:
 * 1. Abre tu Google Sheet
 * 2. Ve a Extensiones → Apps Script
 * 3. Borra el contenido por defecto y pega este código
 * 4. Guarda (Ctrl+S) con el nombre "Cuestionario IVC"
 * 5. Click en "Implementar" → "Nueva implementación"
 * 6. Tipo: "Aplicación web"
 * 7. Ejecutar como: "Yo"
 * 8. Quién tiene acceso: "Cualquier persona"
 * 9. Click "Implementar" → Copia la URL
 * 10. Pega la URL en app.js (variable SHEET_ENDPOINT)
 *
 * IMPORTANTE: Cada vez que modifiques el script debes crear
 * una NUEVA implementación (no solo guardar).
 */

const SHEET_NAME = 'Hoja 1'; // ← Nombre de tu pestaña en el Sheet

/**
 * Maneja peticiones GET.
 * Si recibe parámetros (id, paciente, resultado, etc.) los inserta en el Sheet.
 * Si NO recibe parámetros, devuelve status OK (útil para probar).
 *
 * Uso desde la app:
 *   fetch(URL + '?paciente=X&resultado=Y&...')
 */
function doGet(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};

    // Si no hay parámetros, devolver status (modo prueba)
    if (Object.keys(params).length === 0 || !params.paciente) {
      return _jsonResponse({
        status: 'ok',
        message: 'Servicio activo. Envía datos como query params.',
        sheet: SHEET_NAME,
        ejemplo: '?paciente=Juan&resultado=Candidato&telefono=6621234567'
      });
    }

    // Validar campos requeridos
    if (!params.paciente || !params.resultado) {
      throw new Error('Faltan campos requeridos: paciente y resultado');
    }

    if (params.consentimiento !== 'si') {
      throw new Error('Se requiere consentimiento de privacidad para guardar los datos');
    }

    // Insertar fila
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error('No se encontró la hoja "' + SHEET_NAME + '". Créala primero o cambia SHEET_NAME.');
    }

    const row = [
      params.id                 || _generateId(),
      params.fecha_envio        || _formatDateTime(new Date()),
      params.paciente           || '',
      params.fecha_cuestionario || '',
      params.empresa            || '',
      params.telefono           || '',
      params.correo             || '',
      params.resultado          || ''
    ];

    sheet.appendRow(row);

    // Aplicar formato condicional solo la primera vez
    _ensureConditionalFormatting(sheet);

    return _jsonResponse({
      status: 'ok',
      message: 'Datos guardados correctamente',
      id: row[0]
    });

  } catch (err) {
    return _jsonResponse({
      status: 'error',
      message: err.message
    });
  }
}

/**
 * Maneja peticiones POST con los datos del cuestionario (JSON)
 * Mantenido por compatibilidad, pero se recomienda GET
 */
function doPost(e) {
  try {
    let data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      data = e.parameter;
    } else {
      throw new Error('No se recibieron datos');
    }

    // Reutilizar la lógica de doGet
    const fakeEvent = { parameter: data };
    return doGet(fakeEvent);

  } catch (err) {
    return _jsonResponse({
      status: 'error',
      message: err.message
    });
  }
}

/**
 * Devuelve una respuesta JSON con headers CORS
 */
function _jsonResponse(payload, status) {
  const output = ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);

  return output;
}

/**
 * Genera un ID único tipo ivc-<timestamp>-<random>
 */
function _generateId() {
  const ts = Date.now();
  const rnd = Math.random().toString(36).substring(2, 7);
  return 'ivc-' + ts + '-' + rnd;
}

/**
 * Formatea fecha/hora actual en formato legible
 */
function _formatDateTime(date) {
  const pad = n => String(n).padStart(2, '0');
  return date.getFullYear() + '-' +
         pad(date.getMonth() + 1) + '-' +
         pad(date.getDate()) + ' ' +
         pad(date.getHours()) + ':' +
         pad(date.getMinutes()) + ':' +
         pad(date.getSeconds());
}

/**
 * Aplica formato condicional a la columna H (resultado)
 * Solo se ejecuta si no se ha aplicado antes
 */
function _ensureConditionalFormatting(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return; // Solo encabezados

  // Verificar si ya hay formato condicional
  const rules = sheet.getConditionalFormatRules();
  if (rules.length > 0) return;

  const range = sheet.getRange('H2:H' + lastRow);

  // Regla: Candidato → verde
  const candidatoRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Candidato')
    .setBackground('#E8F5E9')
    .setFontColor('#2E7D32')
    .setRanges([range])
    .build();

  // Regla: No candidato → gris
  const noCandidatoRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('No candidato')
    .setBackground('#F5F5F5')
    .setFontColor('#757575')
    .setRanges([range])
    .build();

  sheet.setConditionalFormatRules([candidatoRule, noCandidatoRule]);
}

/**
 * FUNCIÓN OPCIONAL: Crear encabezados automáticamente
 * Ejecuta esta función UNA VEZ desde el editor para crear
 * los encabezados y formato de la hoja.
 */
function inicializarHoja() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  const headers = [
    'id', 'fecha_envio', 'paciente', 'fecha_cuestionario',
    'empresa', 'telefono', 'correo', 'resultado'
  ];

  // Limpiar hoja (excepto si tiene datos)
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // Formato del encabezado
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange
      .setBackground('#3C5775')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold')
      .setHorizontalAlignment('center');

    sheet.setFrozenRows(1);

    // Anchos de columna
    sheet.setColumnWidth(1, 200); // id
    sheet.setColumnWidth(2, 160); // fecha_envio
    sheet.setColumnWidth(3, 240); // paciente
    sheet.setColumnWidth(4, 140); // fecha_cuestionario
    sheet.setColumnWidth(5, 180); // empresa
    sheet.setColumnWidth(6, 130); // telefono
    sheet.setColumnWidth(7, 260); // correo
    sheet.setColumnWidth(8, 160); // resultado

    Logger.log('Hoja "' + SHEET_NAME + '" inicializada con encabezados');
  } else {
    Logger.log('La hoja ya tiene datos. No se modificó.');
  }
}
