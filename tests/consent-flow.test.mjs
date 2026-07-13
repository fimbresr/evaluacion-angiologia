import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('requiere una pantalla y una casilla de consentimiento antes del cuestionario', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(html, /id="consent"/);
  assert.match(html, /id="privacy-consent"/);
  assert.match(html, /id="btn-consent-continue"[^>]*disabled/);
});

test('bloquea el envío al endpoint cuando no hay consentimiento', async () => {
  const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');
  const backend = await readFile(new URL('../code.gs', import.meta.url), 'utf8');

  assert.match(app, /let hasPrivacyConsent = false/);
  assert.match(
    app,
    /function sendToSheet\(isCandidate\)\s*\{\s*if \(!hasPrivacyConsent\)\s*\{[\s\S]*?return;/
  );
  assert.match(app, /consentimiento:\s*hasPrivacyConsent \? 'si' : ''/);
  assert.match(backend, /params\.consentimiento !== 'si'/);
});
