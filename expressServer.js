// express-server.js
const express = require('express');
const ftp = require('ftp');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configuración de multer para guardar archivos temporalmente
const upload = multer({ dest: 'uploads/' });

const app = express();
const port = 3000;

// Servir archivos estáticos (HTML, CSS, etc.)
app.use(express.static('public'));

/**
 * Endpoint para subir un archivo:
 * - Recibe un archivo desde el formulario.
 * - Se conecta al servidor FTP y sube el archivo.
 */
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No se ha subido ningún archivo.');
  }
  
  const client = new ftp();
  client.on('ready', () => {
    const localPath = req.file.path;
    const remoteFileName = req.file.originalname; // Se guarda con el nombre original
    client.put(localPath, remoteFileName, err => {
      // Eliminar el archivo temporal
      fs.unlink(localPath, () => {});
      if (err) {
        client.end();
        return res.status(500).send('Error al subir el archivo.');
      }
      client.end();
      res.send('Archivo subido correctamente.');
    });
  });
  client.connect({
    host: '127.0.0.1',
    port: 21,
    user: 'anonymous',
    password: 'anonymous@'
  });
});

/**
 * Endpoint para descargar un archivo:
 * - El cliente indica el nombre del archivo a descargar.
 * - Se conecta al servidor FTP, obtiene el archivo y lo envía en la respuesta.
 */
app.get('/download/:filename', (req, res) => {
  const remoteFileName = req.params.filename;
  const client = new ftp();
  client.on('ready', () => {
    client.get(remoteFileName, (err, stream) => {
      if (err) {
        client.end();
        return res.status(500).send('Error al descargar el archivo.');
      }
      res.setHeader('Content-Disposition', `attachment; filename=${remoteFileName}`);
      stream.once('close', () => { client.end(); });
      stream.pipe(res);
    });
  });
  client.connect({
    host: '127.0.0.1',
    port: 21,
    user: 'anonymous',
    password: 'anonymous@'
  });
});

app.listen(port, () => {
  console.log(`Servidor Express escuchando en http://localhost:${port}`);
});
