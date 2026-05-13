'use strict';

const { db }   = require('../../config/database');
const AppError = require('../../utils/AppError');

// ── Récupérer les lignes d'un inventaire ───────────────────────
async function getLignes(inventaireId, trx = db) {
  return trx.raw(`
    SELECT
      li.id, li."Var_id", li."quantiteTheorique", li."quantitePhysique",
      li.ecart, li."prixAchatSnapshot", li."prixVenteSnapshot", li.observation,
      v.dimension, f.nom as "familleNom"
    FROM "LigneInventaire" li
    JOIN "VarianteProduit" v ON v.id = li."Var_id"
    JOIN "FamilleProduit" f  ON f.id = v."Fam_id"
    WHERE li."Inv_id" = ?
  `, [inventaireId]).then(r => r.rows);
}

// ── Trouver un inventaire par ID ───────────────────────────────
async function findById(id, trx = db) {
  const result = await trx.raw(`
    SELECT
      b.id, b."dateCreation", b."dateModification", b.version,
      i.date, i.description, i."totalQuantiteTheorique",
      i."totalQuantitePhysique", i."ecartTotal",
      i."valeurStockPhysique", i."valeurStockTheorique", i.statut
    FROM "BaseEntity" b
    JOIN "Auditable" a  ON a.id = b.id
    JOIN "Inventaire" i ON i.id = a.id
    WHERE b.id = ?
  `, [id]);

  const inventaire = result.rows[0] || null;
  if (!inventaire) return null;

  inventaire.lignes = await getLignes(id, trx);
  return inventaire;
}

// ── Lister les inventaires ─────────────────────────────────────
async function findAll({ page = 1, limit = 20, statut } = {}) {
  const offset   = (page - 1) * limit;
  let whereClause = 'WHERE 1=1';
  const bindings  = [];

  if (statut) {
    whereClause += ' AND i.statut = ?';
    bindings.push(statut);
  }

  const countResult = await db.raw(`
    SELECT COUNT(b.id) as count
    FROM "BaseEntity" b
    JOIN "Auditable" a  ON a.id = b.id
    JOIN "Inventaire" i ON i.id = a.id
    ${whereClause}
  `, bindings).then(r => r.rows[0]);

  const total = parseInt(countResult.count, 10);

  const dataBindings = [...bindings, limit, offset];
  const data = await db.raw(`
    SELECT
      b.id, b."dateCreation", b."dateModification", b.version,
      i.date, i.description, i."totalQuantiteTheorique",
      i."totalQuantitePhysique", i."ecartTotal",
      i."valeurStockPhysique", i."valeurStockTheorique", i.statut
    FROM "BaseEntity" b
    JOIN "Auditable" a  ON a.id = b.id
    JOIN "Inventaire" i ON i.id = a.id
    ${whereClause}
    ORDER BY b."dateCreation" DESC
    LIMIT ? OFFSET ?
  `, dataBindings).then(r => r.rows);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// ── Créer un inventaire ────────────────────────────────────────
async function create(data, userId) {
  const { description, lignes } = data;

  const enCours = await db.raw(`
    SELECT i.id FROM "Inventaire" i WHERE i.statut = 'EN_COURS' LIMIT 1
  `).then(r => r.rows[0]);

  if (enCours) {
    throw new AppError(
      'Un inventaire EN_COURS existe déjà',
      409,
      'INVENTAIRE_EN_COURS'
    );
  }

  return db.transaction(async (trx) => {
    const id = await trx.raw('SELECT gen_random_uuid() as id')
      .then(r => r.rows[0].id);

    await trx('BaseEntity').insert({ id });

    const user = await trx('User')
      .where('firebaseUid', userId)
      .select('id')
      .first();

    await trx('Auditable').insert({
      id,
      Use_id:  user?.id || null,
      creePar: userId,
    });

    // ── Créer Inventaire EN PREMIER (avant les lignes) ─────────
    await trx('Inventaire').insert({
      id,
      description:            description || null,
      totalQuantiteTheorique: 0,
      totalQuantitePhysique:  0,
      ecartTotal:             0,
      valeurStockPhysique:    0,
      valeurStockTheorique:   0,
      statut:                 'EN_COURS',
    });

    // ── Créer les lignes ───────────────────────────────────────
    let totalQuantiteTheorique = 0;
    let totalQuantitePhysique  = 0;
    let valeurStockPhysique    = 0;
    let valeurStockTheorique   = 0;

    for (const ligne of lignes) {
      const ligneId = await trx.raw('SELECT gen_random_uuid() as id')
        .then(r => r.rows[0].id);

      const variante = await trx.raw(`
        SELECT v."prixAchatMoyen", v."prixVente", s."quantiteDisponible"
        FROM "VarianteProduit" v
        JOIN "Stock" s ON s.id = v."Sto_id"
        WHERE v.id = ?
      `, [ligne.Var_id]).then(r => r.rows[0]);

      const quantiteTheorique = variante?.quantiteDisponible || 0;
      const quantitePhysique  = ligne.quantitePhysique;

      totalQuantiteTheorique += quantiteTheorique;
      totalQuantitePhysique  += quantitePhysique;
      valeurStockPhysique    += quantitePhysique  * (variante?.prixAchatMoyen || 0);
      valeurStockTheorique   += quantiteTheorique * (variante?.prixAchatMoyen || 0);

      await trx('BaseEntity').insert({ id: ligneId });
      await trx('LigneInventaire').insert({
        id:                ligneId,
        Inv_id:            id,
        Var_id:            ligne.Var_id,
        quantiteTheorique,
        quantitePhysique,
        prixAchatSnapshot: variante?.prixAchatMoyen || 0,
        prixVenteSnapshot: variante?.prixVente      || 0,
        observation:       ligne.observation || null,
      });
    }

    // ── Mettre à jour les totaux ───────────────────────────────
    await trx('Inventaire').where('id', id).update({
      totalQuantiteTheorique,
      totalQuantitePhysique,
      ecartTotal:          totalQuantitePhysique - totalQuantiteTheorique,
      valeurStockPhysique,
      valeurStockTheorique,
    });

    return findById(id, trx);
  });
}

// ── Changer le statut ──────────────────────────────────────────
async function updateStatut(id, statut, userId) {
  const inventaire = await findById(id);
  if (!inventaire) return null;

  const transitions = {
    EN_COURS: ['VALIDE', 'ANNULE'],
    VALIDE:   [],
    ANNULE:   [],
  };

  if (!transitions[inventaire.statut]?.includes(statut)) {
    throw new AppError(
      `Transition ${inventaire.statut} → ${statut} non autorisée`,
      409,
      'INVALID_STATUS_TRANSITION'
    );
  }

  return db.transaction(async (trx) => {
    // Si VALIDE → créer MouvementStock AJUSTEMENT pour chaque écart
    if (statut === 'VALIDE') {
      for (const ligne of inventaire.lignes) {
        if (ligne.ecart === 0) continue;

        const stock = await trx.raw(`
          SELECT s.id, s."quantiteDisponible"
          FROM "Stock" s
          JOIN "VarianteProduit" v ON v."Sto_id" = s.id
          WHERE v.id = ?
        `, [ligne.Var_id]).then(r => r.rows[0]);

        const nouvelleQuantite = stock.quantiteDisponible + ligne.ecart;

        await trx('Stock').where('id', stock.id).update({
          quantiteDisponible: nouvelleQuantite,
        });

        const mvtId = await trx.raw('SELECT gen_random_uuid() as id')
          .then(r => r.rows[0].id);
        await trx('BaseEntity').insert({ id: mvtId });
        await trx('MouvementStock').insert({
          id:            mvtId,
          Var_id:        ligne.Var_id,
          Inv_id:        id,
          typeMouvement: 'AJUSTEMENT',
          quantite:      Math.abs(ligne.ecart),
          quantiteAvant: stock.quantiteDisponible,
          quantiteApres: nouvelleQuantite,
          raison:        `Inventaire ${id}`,
          refAuteur:     userId,
        });
      }
    }

    await trx('Inventaire').where('id', id).update({ statut });
    await trx('Auditable').where('id', id).update({ modifiePar: userId });
    await trx('BaseEntity').where('id', id).update({
      dateModification: trx.fn.now(),
      version:          inventaire.version + 1,
    });

    return findById(id, trx);
  });
}

module.exports = { findAll, findById, create, updateStatut };