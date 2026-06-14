'use strict';

require('dotenv').config();

const { admin } = require('../src/config/firebase');

const allowedRoles = ['admin', 'gerant'];

async function main() {
  const [, , uid, role] = process.argv;

  if (!uid || !role) {
    console.error('Usage: node scripts/setRoles.js <uid> <role>');
    console.error('Roles autorisés: admin, gerant');
    process.exit(1);
  }

  if (!allowedRoles.includes(role)) {
    console.error('Role invalide. Roles autorisés: admin, gerant');
    process.exit(1);
  }

  await admin.auth().setCustomUserClaims(uid, { role });

  console.log(`✅ Rôle "${role}" attribué à l'utilisateur ${uid}`);
}

main().catch(err => {
  console.error('❌ Erreur lors de l’attribution du rôle:', err.message);
  process.exit(1);
});