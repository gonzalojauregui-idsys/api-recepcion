const express = require('express');
const { google } = require('googleapis');

const app = express();
const port = process.env.PORT || 8080;

const auth = new google.auth.GoogleAuth({
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets.readonly',
  ],
});

const sheets = google.sheets({
  version: 'v4',
  auth,
});

app.get('/', (req, res) => {
  res.json({ mensaje: 'API Recepción funcionando' });
});

app.get('/datos', async (req, res) => {
  const spreadsheetId = process.env.SPREADSHEET_ID;

  if (!spreadsheetId) {
    return res.status(500).json({
      error: 'Falta configurar SPREADSHEET_ID',
    });
  }

  try {
    const respuesta = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "'Hoja 1'!A4:F51",
      majorDimension: 'ROWS',
    });

    res.set('Cache-Control', 'no-store');

    res.json({
      filas: respuesta.data.values || [],
    });
  } catch (error) {
    console.error('Error al consultar Sheets', {
      codigo: error.code,
    });

    res.status(502).json({
      error: 'No se pudo consultar la planilla',
    });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`API iniciada en el puerto ${port}`);
});