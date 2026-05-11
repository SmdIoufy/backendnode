'use strict';

const { db }   = require('../../config/database');
const AppError = require('../../utils/AppError');

const COLUMNS = [
  'b.id', 'b.dateCreation', 'b.dateModification', 'b.version',
  'c.nom', 'c.telephone', 'c.email', 'c.actif',
];

function baseQuery() {
  return db('BaseEntity as b').join('Client as c', 'c.id', 'b.id');
}

// ── Lister ────────────────────────────────────────────────────
async function findAll({ page = 1, limit = 20, search, actif = true } = {}) {
  const offset = (page - 1) * limit;

  let query = baseQuery().where('c.actif', actif);

  if (search) {
    query = query.where(function () {
      this.whereRaw('LOWER(c.nom) LIKE ?',   [`%${search.toLowerCase()}%`])
          .orWhereRaw('LOWER(c.email) LIKE ?', [`%${search.toLowerCase()}%`]);
    });
  }

  const [{ count }] = await query.clone().count('b.id as count');
  const total       = parseInt(count, 10);
  const data        = await query.clone()
    .select(COLUMNS)
    .orderBy('b.dateCreation', 'desc')
    .limit(limit)
    .offset(offset);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// ── Trouver par ID ────────────────────────────────────────────
async function findById(id) {
  const client = await baseQuery()
    .select(COLUMNS)
    .where('b.id', id)
    .first();
  return client || null;
}

// ── Créer ─────────────────────────────────────────────────────
async function create(data) {
  const id = await db.raw('SELECT gen_random_uuid() as id')
    .then(r => r.rows[0].id);

  await db('BaseEntity').insert({ id });
  await db('Client').insert({ id, ...data });

  return findById(id);
}

// ── Modifier ──────────────────────────────────────────────────
async function update(id, data) {
  const client = await findById(id);
  if (!client) return null;

  await db('Client').where('id', id).update(data);
  await db('BaseEntity').where('id', id).update({
    dateModification: db.fn.now(),
    version:          client.version + 1,
  });

  return findById(id);
}

// ── Soft delete ───────────────────────────────────────────────
async function remove(id) {
  const client = await findById(id);
  if (!client) return null;

  await db('Client').where('id', id).update({ actif: false });
  await db('BaseEntity').where('id', id).update({
    dateModification: db.fn.now(),
    version:          client.version + 1,
  });

  return true;
}

module.exports = { findAll, findById, create, update, remove };