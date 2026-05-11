'use strict';

exports.seed = async function (knex) {
  // Vide les tables dans le bon ordre (FK oblige)
  await knex('User').del();
  await knex('BaseEntity').del();

  // 1. Insérer dans BaseEntity d'abord
  const id = '550e8400-e29b-41d4-a716-446655440000';

  await knex('BaseEntity').insert({
    id,
    dateCreation:     new Date(),
    dateModification: new Date(),
    version:          0,
  });

  // 2. Insérer dans User ensuite
  await knex('User').insert({
    id,
    firebaseUid:  'test-firebase-uid-admin',
    email:        'admin@gestquick.com',
    displayName:  'Samba Admin',
    phoneNumber:  '+221 77 000 00 00',
    role:         'ADMIN',
    isActive:     true,
    isBlocked:    false,
    loginCount:   0,
    lastLoginAt:  null,
  });

  console.log('✅ Seed users OK');
};