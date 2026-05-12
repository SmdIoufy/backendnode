'use strict';

const { db } = require('../../../config/database');

const COLUMNS = [
  'b.id', 'b.dateCreation', 'b.dateModification', 'b.version',
  'c.nom', 'c.description', 'c.actif',
];

function baseQuery() {
  return db('BaseEntity as b').join('Categorie as c', 'c.id', 'b.id');
}

async function findAll({ page = 1, limit = 20, search, actif = true } = {}) {
  const offset = (page - 1) * limit;

  let query = baseQuery().where('c.actif', actif);

  if (search) {
    query = query.whereRaw('LOWER(c.nom) LIKE ?', [`%${search.toLowerCase()}%`]);
  }

  const [{ count }] = await query.clone().count('b.id as count');
  const total       = parseInt(count, 10);
  const data        = await query.clone()
    .select(COLUMNS)
    .orderBy('c.nom', 'asc')
    .limit(limit)
    .offset(offset);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function findById(id) {
  return baseQuery().select(COLUMNS).where('b.id', id).first() || null;
}

async function create(data) {
  const id = await db.raw('SELECT gen_random_uuid() as id')
    .then(r => r.rows[0].id);

  await db('BaseEntity').insert({ id });
  await db('Categorie').insert({ id, ...data });

  return findById(id);
}

async function update(id, data) {
  const categorie = await findById(id);
  if (!categorie) return null;

  await db('Categorie').where('id', id).update(data);
  await db('BaseEntity').where('id', id).update({
    dateModification: db.fn.now(),
    version:          categorie.version + 1,
  });

  return findById(id);
}

async function remove(id) {
  const categorie = await findById(id);
  if (!categorie) return null;

  await db('Categorie').where('id', id).update({ actif: false });
  await db('BaseEntity').where('id', id).update({
    dateModification: db.fn.now(),
    version:          categorie.version + 1,
  });

  return true;
}

module.exports = { findAll, findById, create, update, remove };