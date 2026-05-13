'use strict';

const { db } = require('../../config/database');

const SELECT_COLUMNS = `
  b.id, b."dateCreation", b."dateModification", b.version,
  m."Var_id", m."Ven_id", m."App_id", m."Inv_id",
  m."typeMouvement", m.quantite, m.date, m.raison,
  m."quantiteAvant", m."quantiteApres", m."refAuteur",
  v.dimension, f.nom as "familleNom"
`;

// ── Trouver par ID ─────────────────────────────────────────────
async function findById(id) {
  const result = await db.raw(`
    SELECT ${SELECT_COLUMNS}
    FROM "BaseEntity" b
    JOIN "MouvementStock" m  ON m.id = b.id
    JOIN "VarianteProduit" v ON v.id = m."Var_id"
    JOIN "FamilleProduit" f  ON f.id = v."Fam_id"
    WHERE b.id = ?
  `, [id]);

  return result.rows[0] || null;
}

// ── Lister ────────────────────────────────────────────────────
async function findAll({
  page = 1, limit = 20,
  typeMouvement, Var_id, dateDebut, dateFin
} = {}) {
  const offset   = (page - 1) * limit;
  let whereClause = 'WHERE 1=1';
  const bindings  = [];

  if (typeMouvement) {
    whereClause += ' AND m."typeMouvement" = ?';
    bindings.push(typeMouvement);
  }
  if (Var_id) {
    whereClause += ' AND m."Var_id" = ?';
    bindings.push(Var_id);
  }
  if (dateDebut) {
    whereClause += ' AND m.date >= ?';
    bindings.push(dateDebut);
  }
  if (dateFin) {
    whereClause += ' AND m.date <= ?';
    bindings.push(dateFin);
  }

  const countResult = await db.raw(`
    SELECT COUNT(b.id) as count
    FROM "BaseEntity" b
    JOIN "MouvementStock" m  ON m.id = b.id
    JOIN "VarianteProduit" v ON v.id = m."Var_id"
    JOIN "FamilleProduit" f  ON f.id = v."Fam_id"
    ${whereClause}
  `, bindings).then(r => r.rows[0]);

  const total = parseInt(countResult.count, 10);

  const dataBindings = [...bindings, limit, offset];
  const data = await db.raw(`
    SELECT ${SELECT_COLUMNS}
    FROM "BaseEntity" b
    JOIN "MouvementStock" m  ON m.id = b.id
    JOIN "VarianteProduit" v ON v.id = m."Var_id"
    JOIN "FamilleProduit" f  ON f.id = v."Fam_id"
    ${whereClause}
    ORDER BY m.date DESC, b."dateCreation" DESC
    LIMIT ? OFFSET ?
  `, dataBindings).then(r => r.rows);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

module.exports = { findAll, findById };