// ftp-server.js
const FTPSrv = require('ftp-srv');
const path = require('path');

const ftpServer = new FTPSrv({
  url: "ftp://127.0.0.1:21",
  anonymous: true, // Permite acceso anónimo
  greeting: ["Bienvenido al servidor FTP de prueba."]
});

ftpServer.on('login', ({ connection, username, password }, resolve, reject) => {
  // Permite el login anónimo y define la carpeta raíz
  const ftpRoot = path.join(__dirname, 'ftp-root');
  resolve({ root: ftpRoot });
});

ftpServer.listen()
  .then(() => {
    console.log("Servidor FTP escuchando en ftp://127.0.0.1:21");
  })
  .catch(err => {
    console.error("Error al iniciar el servidor FTP:", err);
  });
