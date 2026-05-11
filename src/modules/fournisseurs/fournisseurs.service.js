'use strict';

const { db } = require('../../config/database');

const COLUMNS = [
  'b.id', 'b.dateCreation', 'b.dateModification', 'b.version',
  'f.nom', 'f.telephone', 'f.email', 'f.actif',
];

function baseQuery() {
  return db('BaseEntity as b').join('Fournisseur as f', 'f.id', 'b.id');
}

async function findAll({ page = 1, limit = 20, search, actif = true } = {}) {
  const offset = (page - 1) * limit;

  let query = baseQuery().where('f.actif', actif);

  if (search) {
    query = query.where(function () {
      this.whereRaw('LOWER(f.nom) LIKE ?',   [`%${search.toLowerCase()}%`])
          .orWhereRaw('LOWER(f.email) LIKE ?', [`%${search.toLowerCase()}%`]);
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

async function findById(id) {
  const fournisseur = await baseQuery()
    .select(COLUMNS)
    .where('b.id', id)
    .first();
  return fournisseur || null;
}

async function create(data) {
  const id = await db.raw('SELECT gen_random_uuid() as id')
    .then(r => r.rows[0].id);

  await db('BaseEntity').insert({ id });
  await db('Fournisseur').insert({ id, ...data });

  return findById(id);
}

async function update(id, data) {
  const fournisseur = await findById(id);
  if (!fournisseur) return null;

  await db('Fournisseur').where('id', id).update(data);
  await db('BaseEntity').where('id', id).update({
    dateModification: db.fn.now(),
    version:          fournisseur.version + 1,
  });

  return findById(id);
}

async function remove(id) {
  const fournisseur = await findById(id);
  if (!fournisseur) return null;

  await db('Fournisseur').where('id', id).update({ actif: false });
  await db('BaseEntity').where('id', id).update({
    dateModification: db.fn.now(),
    version:          fournisseur.version + 1,
  });

  return true;
}

module.exports = { findAll, findById, create, update, remove };