'use strict';

require('dotenv').config();

const app  = require('./index');
const { testConnection } = require('./src/config/database');
require('./src/config/firebase');
const PORT = process.env.PORT || 3000;

async function bootstrap() {
  // 1. Tester la connexion DB
  await testConnection();

  // 2. Démarrer le serveur
  app.listen(PORT, () => {
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  🚀  Serveur démarré avec succès`);
    console.log(`  🌍  http://localhost:${PORT}`);
    console.log(`  🌿  Environnement : ${process.env.NODE_ENV}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  });
}

bootstrap();