'use strict';

const { db } = require('../../config/database');

// ── Journal des activités ──────────────────────────────────────
async function getActivites({ page = 1, limit = 20, dateDebut, dateFin } = {}) {
  const offset = (page - 1) * limit;

  let dateFilter = '';
  const bindings = [];

  if (dateDebut) {
    dateFilter += ' AND b."dateCreation" >= ?';
    bindings.push(dateDebut);
  }
  if (dateFin) {
    dateFilter += ' AND b."dateCreation" <= ?';
    bindings.push(dateFin);
  }

  const query = `
    SELECT
      b.id,
      b."dateCreation",
      b."dateModification",
      a."creePar",
      a."modifiePar",
      'VENTE' as "typeEntite",
      v.reference,
      v.statut,
      c.nom as "clientOuFournisseur"
    FROM "BaseEntity" b
    JOIN "Auditable" a ON a.id = b.id
    JOIN "Vente" v     ON v.id = a.id
    JOIN "Client" c    ON c.id = v."Cli_id"
    WHERE 1=1 ${dateFilter}

    UNION ALL

    SELECT
      b.id,
      b."dateCreation",
      b."dateModification",
      a."creePar",
      a."modifiePar",
      'APPROVISIONNEMENT' as "typeEntite",
      ap.reference,
      ap.statut,
      f.nom as "clientOuFournisseur"
    FROM "BaseEntity" b
    JOIN "Auditable" a       ON a.id = b.id
    JOIN "Approvisionnement" ap ON ap.id = a.id
    JOIN "Fournisseur" f     ON f.id = ap."Four_id"
    WHERE 1=1 ${dateFilter}

    UNION ALL

    SELECT
      b.id,
      b."dateCreation",
      b."dateModification",
      a."creePar",
      a."modifiePar",
      'INVENTAIRE' as "typeEntite",
      CONCAT('INV-', TO_CHAR(inv.date, 'YYYY-MM-DD')) as reference,
      inv.statut,
      NULL as "clientOuFournisseur"
    FROM "BaseEntity" b
    JOIN "Auditable" a   ON a.id = b.id
    JOIN "Inventaire" inv ON inv.id = a.id
    WHERE 1=1 ${dateFilter}

    ORDER BY "dateCreation" DESC
    LIMIT ? OFFSET ?
  `;

  const allBindings = [...bindings, ...bindings, ...bindings, limit, offset];

  const result = await db.raw(query, allBindings);

  // Count total
  const countQuery = `
    SELECT COUNT(*) as count FROM (
      SELECT b.id FROM "BaseEntity" b JOIN "Auditable" a ON a.id = b.id JOIN "Vente" v ON v.id = a.id WHERE 1=1 ${dateFilter}
      UNION ALL
      SELECT b.id FROM "BaseEntity" b JOIN "Auditable" a ON a.id = b.id JOIN "Approvisionnement" ap ON ap.id = a.id WHERE 1=1 ${dateFilter}
      UNION ALL
      SELECT b.id FROM "BaseEntity" b JOIN "Auditable" a ON a.id = b.id JOIN "Inventaire" inv ON inv.id = a.id WHERE 1=1 ${dateFilter}
    ) sub
  `;

  const countBindings = [...bindings, ...bindings, ...bindings];
  const countResult = await db.raw(countQuery, countBindings);
  const total = parseInt(countResult.rows[0].count, 10);

  return {
    data: result.rows,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// ── Journal des mouvements de stock ───────────────────────────
async function getMouvementsStock({
  page = 1, limit = 20,
  typeMouvement, Var_id,
  dateDebut, dateFin,
} = {}) {
  const offset = (page - 1) * limit;

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
    SELECT COUNT(*) as count
    FROM "MouvementStock" m
    ${whereClause}
  `, bindings).then(r => r.rows[0]);

  const total = parseInt(countResult.count, 10);

  const dataBindings = [...bindings, limit, offset];
  const data = await db.raw(`
    SELECT
      m.id,
      m."typeMouvement",
      m.quantite,
      m."quantiteAvant",
      m."quantiteApres",
      m."refAuteur",
      m.date,
      m.raison,
      vp.dimension,
      f.nom       as "familleNom",
      CASE
        WHEN m."Ven_id" IS NOT NULL THEN 'VENTE'
        WHEN m."App_id" IS NOT NULL THEN 'APPROVISIONNEMENT'
        WHEN m."Inv_id" IS NOT NULL THEN 'INVENTAIRE'
        ELSE 'MANUEL'
      END as "sourceType",
      COALESCE(v.reference, ap.reference) as "sourceReference"
    FROM "MouvementStock" m
    JOIN "VarianteProduit" vp ON vp.id = m."Var_id"
    JOIN "FamilleProduit" f   ON f.id  = vp."Fam_id"
    LEFT JOIN "Vente" v               ON v.id  = m."Ven_id"
    LEFT JOIN "Approvisionnement" ap  ON ap.id = m."App_id"
    ${whereClause}
    ORDER BY m.date DESC, m.id DESC
    LIMIT ? OFFSET ?
  `, dataBindings);

  return {
    data: data.rows,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// ── Activités d'un utilisateur ─────────────────────────────────
async function getActivitesUtilisateur(firebaseUid, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;

  const query = `
    SELECT
      b.id,
      b."dateCreation",
      b."dateModification",
      a."creePar",
      a."modifiePar",
      'VENTE' as "typeEntite",
      v.reference,
      v.statut,
      c.nom as "clientOuFournisseur"
    FROM "BaseEntity" b
    JOIN "Auditable" a ON a.id = b.id
    JOIN "Vente" v     ON v.id = a.id
    JOIN "Client" c    ON c.id = v."Cli_id"
    WHERE a."creePar" = ? OR a."modifiePar" = ?

    UNION ALL

    SELECT
      b.id,
      b."dateCreation",
      b."dateModification",
      a."creePar",
      a."modifiePar",
      'APPROVISIONNEMENT' as "typeEntite",
      ap.reference,
      ap.statut,
      f.nom as "clientOuFournisseur"
    FROM "BaseEntity" b
    JOIN "Auditable" a          ON a.id = b.id
    JOIN "Approvisionnement" ap ON ap.id = a.id
    JOIN "Fournisseur" f        ON f.id = ap."Four_id"
    WHERE a."creePar" = ? OR a."modifiePar" = ?

    UNION ALL

    SELECT
      b.id,
      b."dateCreation",
      b."dateModification",
      a."creePar",
      a."modifiePar",
      'INVENTAIRE' as "typeEntite",
      CONCAT('INV-', TO_CHAR(inv.date, 'YYYY-MM-DD')) as reference,
      inv.statut,
      NULL as "clientOuFournisseur"
    FROM "BaseEntity" b
    JOIN "Auditable" a    ON a.id = b.id
    JOIN "Inventaire" inv ON inv.id = a.id
    WHERE a."creePar" = ? OR a."modifiePar" = ?

    ORDER BY "dateCreation" DESC
    LIMIT ? OFFSET ?
  `;

  const bindings = [
    firebaseUid, firebaseUid,
    firebaseUid, firebaseUid,
    firebaseUid, firebaseUid,
    limit, offset,
  ];

  const result = await db.raw(query, bindings);

  const countResult = await db.raw(`
    SELECT COUNT(*) as count FROM (
      SELECT b.id FROM "BaseEntity" b JOIN "Auditable" a ON a.id = b.id JOIN "Vente" v ON v.id = a.id WHERE a."creePar" = ? OR a."modifiePar" = ?
      UNION ALL
      SELECT b.id FROM "BaseEntity" b JOIN "Auditable" a ON a.id = b.id JOIN "Approvisionnement" ap ON ap.id = a.id WHERE a."creePar" = ? OR a."modifiePar" = ?
      UNION ALL
      SELECT b.id FROM "BaseEntity" b JOIN "Auditable" a ON a.id = b.id JOIN "Inventaire" inv ON inv.id = a.id WHERE a."creePar" = ? OR a."modifiePar" = ?
    ) sub
  `, [firebaseUid, firebaseUid, firebaseUid, firebaseUid, firebaseUid, firebaseUid]);

  const total = parseInt(countResult.rows[0].count, 10);

  return {
    data: result.rows,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

module.exports = { getActivites, getMouvementsStock, getActivitesUtilisateur };