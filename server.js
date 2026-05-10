require('dotenv').config(); // ← LIGNE 1, avant tout le reste

const app  = require('./index');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  ✅  Serveur démarré avec succès`);
  console.log(`  🌍  http://localhost:${PORT}`);
  console.log(`  🌿  Environnement : ${process.env.NODE_ENV}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});