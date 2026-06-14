'use strict';

const { db } = require('../../config/database');
const { v4: uuidv4 } = require('uuid');

async function findAll({ page = 1, limit = 20, search } = {}) {
  const offset = (page - 1) * limit;
  let baseQuery = db('BaseEntity as b').join('User as u', 'u.id', 'b.id');
  if (search) {
    baseQuery = baseQuery.where(function () {
      this.whereILike('u.email', `%${search}%`)
          .orWhereILike('u.displayName', `%${search}%`);
    });
  }
  const [{ count }] = await baseQuery.clone().count('b.id as count');
  const total = parseInt(count, 10);
  const data = await baseQuery.clone()
    .select('b.id','b.dateCreation','b.dateModification','b.version',
            'u.firebaseUid','u.email','u.displayName','u.phoneNumber',
            'u.role','u.isActive','u.isBlocked','u.loginCount','u.lastLoginAt')
    .orderBy('b.dateCreation', 'desc')
    .limit(limit).offset(offset);
  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

async function findById(id) {
  const user = await db('BaseEntity as b')
    .join('User as u', 'u.id', 'b.id')
    .select('b.id','b.dateCreation','b.dateModification','b.version',
            'u.firebaseUid','u.email','u.displayName','u.phoneNumber',
            'u.role','u.isActive','u.isBlocked','u.loginCount','u.lastLoginAt')
    .where('b.id', id).first();
  return user || null;
}

async function findByFirebaseUid(firebaseUid) {
  const user = await db('BaseEntity as b')
    .join('User as u', 'u.id', 'b.id')
    .select('b.id','b.dateCreation','b.dateModification','b.version',
            'u.firebaseUid','u.email','u.displayName','u.phoneNumber',
            'u.role','u.isActive','u.isBlocked','u.loginCount','u.lastLoginAt')
    .where('u.firebaseUid', firebaseUid).first();
  return user || null;
}

async function createUser({ email, password, displayName, phoneNumber }) {
  const { admin } = require('../../config/firebase');

  const firebaseUser = await admin.auth().createUser({
    email,
    password,
    displayName: displayName || email.split('@')[0],
  });

  await admin.auth().setCustomUserClaims(firebaseUser.uid, { role: 'GERANT' });

  const id = uuidv4();

  await db('BaseEntity').insert({
    id,
    dateCreation:     db.fn.now(),
    dateModification: db.fn.now(),
    version:          1,
  });

  await db('User').insert({
    id,
    firebaseUid:  firebaseUser.uid,
    email,
    displayName:  displayName || email.split('@')[0],
    phoneNumber:  phoneNumber || null,
    role:         'GERANT',
    isActive:     true,
    isBlocked:    false,
    loginCount:   0,
    lastLoginAt:  null,
  });

  return findById(id);
}

async function update(id, data) {
  const user = await findById(id);
  await db('User').where('id', id).update({ ...data });
  await db('BaseEntity').where('id', id).update({
    dateModification: db.fn.now(),
    version: user.version + 1,
  });
  return findById(id);
}

async function setFirebaseRole(uid, role) {
  const { admin } = require('../../config/firebase');
  await admin.auth().setCustomUserClaims(uid, { role });
  return { uid, role };
}

module.exports = {
  findAll,
  findById,
  findByFirebaseUid,
  createUser,
  update,
  setFirebaseRole,
};