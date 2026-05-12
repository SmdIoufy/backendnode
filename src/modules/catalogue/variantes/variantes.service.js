'use strict';

const { db } = require('../../../config/database');

const COLUMNS = [
  'b.id', 'b.dateCreation', 'b.dateModification', 'b.version',
  'v.Fam_id', 'v.Sto_id', 'v.dimension', 'v.epaisseur',
  'v.prixVente', 'v.prixAchatMoyen', 'v.seuilAlerte', 'v.actif',
  'f.nom as familleNom',
  's.quantiteDisponible', 's.quantiteReservee', 's.seuilMinimum',
];

function baseQuery() {
  return db('BaseEntity as b')
    .join('VarianteProduit as v', 'v.id', 'b.id')
    .join('FamilleProduit as f',  'f.id', 'v.Fam_id')
    .join('Stock as s',           's.id', 'v.Sto_id');
}

async function findAll({ page = 1, limit = 20, search, actif = true, Fam_id } = {}) {
  const offset = (page - 1) * limit;

  let query = baseQuery().where('v.actif', actif);

  if (Fam_id) query = query.where('v.Fam_id', Fam_id);
  if (search) {
    query = query.where(function () {
      this.whereRaw('LOWER(v.dimension) LIKE ?', [`%${search.toLowerCase()}%`])
          .orWhereRaw('LOWER(f.nom) LIKE ?',     [`%${search.toLowerCase()}%`]);
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
  return baseQuery().select(COLUMNS).where('b.id', id).first() || null;
}

async function create(data) {
  // Créer le stock d'abord
  const stoId = await db.raw('SELECT gen_random_uuid() as id')
    .then(r => r.rows[0].id);
  const id = await db.raw('SELECT gen_random_uuid() as id')
    .then(r => r.rows[0].id);

  await db('BaseEntity').insert({ id: stoId });
  await db('Stock').insert({ id: stoId });

  await db('BaseEntity').insert({ id });
  await db('VarianteProduit').insert({ id, Sto_id: stoId, ...data });

  return findById(id);
}

async function update(id, data) {
  const variante = await findById(id);
  if (!variante) return null;

  await db('VarianteProduit').where('id', id).update(data);
  await db('BaseEntity').where('id', id).update({
    dateModification: db.fn.now(),
    version:          variante.version + 1,
  });

  return findById(id);
}

async function remove(id) {
  const variante = await findById(id);
  if (!variante) return null;

  await db('VarianteProduit').where('id', id).update({ actif: false });
  await db('BaseEntity').where('id', id).update({
    dateModification: db.fn.now(),
    version:          variante.version + 1,
  });

  return true;
}

module.exports = { findAll, findById, create, update, remove };