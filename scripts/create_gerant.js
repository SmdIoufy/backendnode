'use strict';

require('dotenv').config({ path: '../.env' });

const { admin } = require('../src/config/firebase');
const { db }    = require('../src/config/database');
const { v4: uuidv4 } = require('uuid');

async function main() {
  const email       = 'sambamoussa.diouf@uadb.edu.sn';
  const password    = 'gerant1608';
  const displayName = 'samba gerant';
  const role        = 'GERANT';

  const firebaseUser = await admin.auth().createUser({
    email,
    password,
    displayName,
  });

  console.log('✅ Firebase user créé :', firebaseUser.uid);

  await admin.auth().setCustomUserClaims(firebaseUser.uid, { role });
  console.log('✅ Custom claim GERANT assigné');

  const id = uuidv4();

  await db('BaseEntity').insert({
    id,
    dateCreation:     new Date(),
    dateModification: new Date(),
    version:          1,
  });

  await db('User').insert({
    id,
    firebaseUid:  firebaseUser.uid,
    email,
    displayName,
    phoneNumber:  null,
    role,
    isActive:     true,
    isBlocked:    false,
    loginCount:   0,
    lastLoginAt:  null,
  });

  console.log('✅ User inséré en base PostgreSQL');
  console.log('🎉 Gérant prêt :', email);

  process.exit(0);
}

main().catch(err => {
  console.error('❌ Erreur :', err);
  process.exit(1);
});