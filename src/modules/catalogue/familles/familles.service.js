'use strict';

const { db } = require('../../../config/database');

const COLUMNS = [
  'b.id', 'b.dateCreation', 'b.dateModification', 'b.version',
  'f.Cat_id', 'f.nom', 'f.description', 'f.uniteMesure', 'f.actif',
  'c.nom as categorieNom',
];

function baseQuery() {
  return db('BaseEntity as b')
    .join('FamilleProduit as f', 'f.id', 'b.id')
    .join('Categorie as c', 'c.id', 'f.Cat_id');
}

async function findAll({ page = 1, limit = 20, search, actif = true, Cat_id } = {}) {
  const offset = (page - 1) * limit;

  let query = baseQuery().where('f.actif', actif);

  if (Cat_id) query = query.where('f.Cat_id', Cat_id);
  if (search) {
    query = query.whereRaw('LOWER(f.nom) LIKE ?', [`%${search.toLowerCase()}%`]);
  }

  const [{ count }] = await query.clone().count('b.id as count');
  const total       = parseInt(count, 10);
  const data        = await query.clone()
    .select(COLUMNS)
    .orderBy('f.nom', 'asc')
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
  await db('FamilleProduit').insert({ id, ...data });

  return findById(id);
}

async function update(id, data) {
  const famille = await findById(id);
  if (!famille) return null;

  await db('FamilleProduit').where('id', id).update(data);
  await db('BaseEntity').where('id', id).update({
    dateModification: db.fn.now(),
    version:          famille.version + 1,
  });

  return findById(id);
}

async function remove(id) {
  const famille = await findById(id);
  if (!famille) return null;

  await db('FamilleProduit').where('id', id).update({ actif: false });
  await db('BaseEntity').where('id', id).update({
    dateModification: db.fn.now(),
    version:          famille.version + 1,
  });

  return true;
}

module.exports = { findAll, findById, create, update, remove };