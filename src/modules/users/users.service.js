'use strict';

const { db } = require('../../config/database');

// ── Lister les utilisateurs ────────────────────────────────────
async function findAll({ page = 1, limit = 20, search } = {}) {
  const offset = (page - 1) * limit;

  // Query de base sans select
  let baseQuery = db('BaseEntity as b')
    .join('User as u', 'u.id', 'b.id');

  if (search) {
    baseQuery = baseQuery.where(function () {
      this.whereILike('u.email', `%${search}%`)
          .orWhereILike('u.displayName', `%${search}%`);
    });
  }

  // Count séparé
  const [{ count }] = await baseQuery.clone().count('b.id as count');
  const total       = parseInt(count, 10);

  // Data avec select
  const data = await baseQuery.clone()
    .select(
      'b.id',
      'b.dateCreation',
      'b.dateModification',
      'b.version',
      'u.firebaseUid',
      'u.email',
      'u.displayName',
      'u.phoneNumber',
      'u.role',
      'u.isActive',
      'u.isBlocked',
      'u.loginCount',
      'u.lastLoginAt'
    )
    .orderBy('b.dateCreation', 'desc')
    .limit(limit)
    .offset(offset);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ── Récupérer un utilisateur par ID ───────────────────────────
async function findById(id) {
  const user = await db('BaseEntity as b')
    .join('User as u', 'u.id', 'b.id')
    .select(
      'b.id', 'b.dateCreation', 'b.dateModification', 'b.version',
      'u.firebaseUid', 'u.email', 'u.displayName', 'u.phoneNumber',
      'u.role', 'u.isActive', 'u.isBlocked', 'u.loginCount', 'u.lastLoginAt'
    )
    .where('b.id', id)
    .first();

  return user || null;
}

// ── Modifier un utilisateur ────────────────────────────────────
async function update(id, data) {
  const user = await findById(id);
  if (!user) return null;

  await db('User').where('id', id).update({ ...data });

  await db('BaseEntity').where('id', id).update({
    dateModification: db.fn.now(),
    version:          user.version + 1,
  });

  return findById(id);
}

module.exports = { findAll, findById, update };