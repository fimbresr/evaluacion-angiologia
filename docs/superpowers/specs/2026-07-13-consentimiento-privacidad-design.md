# Consentimiento previo al cuestionario

## Objetivo

Evitar que se inicie o se envíe un cuestionario sin que la persona haya leído el aviso de privacidad y autorizado el tratamiento de sus datos.

## Flujo

1. La persona ingresa sus datos y pulsa "Continuar".
2. La aplicación muestra una sección exclusiva de aviso de privacidad.
3. El botón para comenzar el cuestionario permanece deshabilitado hasta que se marque la casilla de consentimiento.
4. Con consentimiento, comienza el cuestionario y, al terminar, se envían los datos a Google Sheets.
5. Sin consentimiento, la persona puede regresar a corregir datos o salir. Ambas acciones descartan los datos que sólo estaban en memoria y no envían nada.

## Defensa de envío

`sendToSheet` verificará de nuevo que exista consentimiento antes de construir una solicitud. Esta comprobación evita un envío si se intenta invocar la función fuera del flujo normal de interfaz.

## Alcance

- Reutilizar el aviso de privacidad existente en la nueva sección.
- Eliminarlo de la pantalla de resultado para que no aparezca después de que los datos ya fueron enviados.
- No cambiar preguntas, criterio clínico ni estructura de Google Sheets.

## Criterios verificables

- Sin marcar la casilla, no es posible acceder al cuestionario.
- Salir o regresar sin consentimiento no genera solicitudes al endpoint.
- Con la casilla marcada, se puede completar el cuestionario y se realiza una única solicitud al endpoint.
- Al reiniciar o salir, se borra el consentimiento y los datos locales.
