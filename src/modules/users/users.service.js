'use strict';

const { db } = require('../../config/database');

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

async function update(id, data) {
  const user = await findById(id);
  await db('User').where('id', id).update({ ...data });
  await db('BaseEntity').where('id', id).update({
    dateModification: db.fn.now(),
    version: user.version + 1,
  });
  return findById(id);
}

module.exports = { findAll, findById, findByFirebaseUid, update };
