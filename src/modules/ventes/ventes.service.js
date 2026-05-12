'use strict';

const { db }   = require('../../config/database');
const AppError = require('../../utils/AppError');

// ── Générer une référence unique ───────────────────────────────
async function genererReference() {
  const annee  = new Date().getFullYear();
  const result = await db('Vente')
    .whereRaw(`EXTRACT(YEAR FROM date) = ?`, [annee])
    .count('id as count')
    .first();
  const num = String(parseInt(result.count) + 1).padStart(5, '0');
  return `VNT-${annee}-${num}`;
}

// ── Récupérer les lignes d'une vente ───────────────────────────
async function getLignes(venteId, trx = db) {
  return trx.raw(`
    SELECT
      lv.id, lv."Var_id", lv.quantite,
      lv."prixUnitaire", lv."coutUnitaire", lv.remise,
      v.dimension, f.nom as "familleNom"
    FROM "LigneVente" lv
    JOIN "VarianteProduit" v ON v.id = lv."Var_id"
    JOIN "FamilleProduit" f  ON f.id = v."Fam_id"
    WHERE lv."Ven_id" = ?
  `, [venteId]).then(r => r.rows);
}

// ── Trouver une vente par ID ───────────────────────────────────
async function findById(id, trx = db) {
  const result = await trx.raw(`
    SELECT
      b.id, b."dateCreation", b."dateModification", b.version,
      v."Cli_id", v.reference, v.date, v."montantTotal", v.statut,
      c.nom as "clientNom"
    FROM "BaseEntity" b
    JOIN "Auditable" a ON a.id = b.id
    JOIN "Vente" v     ON v.id = a.id
    JOIN "Client" c    ON c.id = v."Cli_id"
    WHERE b.id = ?
  `, [id]);

  const vente = result.rows[0] || null;
  if (!vente) return null;

  vente.lignes = await getLignes(id, trx);
  return vente;
}

// ── Lister les ventes ──────────────────────────────────────────
async function findAll({ page = 1, limit = 20, statut, Cli_id } = {}) {
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE 1=1';
  const bindings  = [];

  if (statut) {
    whereClause += ' AND v.statut = ?';
    bindings.push(statut);
  }
  if (Cli_id) {
    whereClause += ' AND v."Cli_id" = ?';
    bindings.push(Cli_id);
  }

  const countResult = await db.raw(`
    SELECT COUNT(b.id) as count
    FROM "BaseEntity" b
    JOIN "Auditable" a ON a.id = b.id
    JOIN "Vente" v     ON v.id = a.id
    JOIN "Client" c    ON c.id = v."Cli_id"
    ${whereClause}
  `, bindings).then(r => r.rows[0]);

  const total = parseInt(countResult.count, 10);

  const dataBindings = [...bindings, limit, offset];
  const data = await db.raw(`
    SELECT
      b.id, b."dateCreation", b."dateModification", b.version,
      v."Cli_id", v.reference, v.date, v."montantTotal", v.statut,
      c.nom as "clientNom"
    FROM "BaseEntity" b
    JOIN "Auditable" a ON a.id = b.id
    JOIN "Vente" v     ON v.id = a.id
    JOIN "Client" c    ON c.id = v."Cli_id"
    ${whereClause}
    ORDER BY b."dateCreation" DESC
    LIMIT ? OFFSET ?
  `, dataBindings).then(r => r.rows);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// ── Créer une vente ────────────────────────────────────────────
async function create(data, userId) {
  const { Cli_id, lignes } = data;

  return db.transaction(async (trx) => {
    // 1. Créer BaseEntity + Auditable
    const id = await trx.raw('SELECT gen_random_uuid() as id')
      .then(r => r.rows[0].id);

    await trx('BaseEntity').insert({ id });

    // Trouver le User par firebaseUid
    const user = await trx('User')
      .where('firebaseUid', userId)
      .select('id')
      .first();

    await trx('Auditable').insert({
      id,
      Use_id:  user?.id || null,
      creePar: userId,
    });

    // 2. Calculer le montant total
    let montantTotal = 0;
    for (const ligne of lignes) {
      montantTotal += ligne.quantite * ligne.prixUnitaire * (1 - (ligne.remise || 0) / 100);
    }

    // 3. Créer la vente
    const reference = await genererReference();
    await trx('Vente').insert({
      id,
      Cli_id,
      reference,
      montantTotal,
      statut: 'BROUILLON',
    });

    // 4. Créer les lignes
    for (const ligne of lignes) {
      const ligneId = await trx.raw('SELECT gen_random_uuid() as id')
        .then(r => r.rows[0].id);

      const variante = await trx('VarianteProduit')
        .where('id', ligne.Var_id)
        .select('prixAchatMoyen')
        .first();

      await trx('BaseEntity').insert({ id: ligneId });
      await trx('LigneVente').insert({
        id:           ligneId,
        Ven_id:       id,
        Var_id:       ligne.Var_id,
        quantite:     ligne.quantite,
        prixUnitaire: ligne.prixUnitaire,
        coutUnitaire: variante?.prixAchatMoyen || 0,
        remise:       ligne.remise || 0,
      });
    }

    // ← trx passé ici
    return findById(id, trx);
  });
}

// ── Changer le statut ──────────────────────────────────────────
async function updateStatut(id, statut, userId) {
  const vente = await findById(id);
  if (!vente) return null;

  const transitions = {
    BROUILLON: ['VALIDEE', 'ANNULEE'],
    VALIDEE:   ['ANNULEE'],
    ANNULEE:   [],
  };

  if (!transitions[vente.statut]?.includes(statut)) {
    throw new AppError(
      `Transition ${vente.statut} → ${statut} non autorisée`,
      409,
      'INVALID_STATUS_TRANSITION'
    );
  }

  return db.transaction(async (trx) => {
    if (statut === 'VALIDEE') {
      for (const ligne of vente.lignes) {
        const stock = await trx('Stock as s')
          .join('VarianteProduit as v', 'v.Sto_id', 's.id')
          .where('v.id', ligne.Var_id)
          .select('s.id', 's.quantiteDisponible')
          .first();

        if (stock.quantiteDisponible < ligne.quantite) {
          throw new AppError(
            `Stock insuffisant pour la variante ${ligne.Var_id}`,
            400,
            'STOCK_INSUFFISANT'
          );
        }

        await trx('Stock').where('id', stock.id).update({
          quantiteDisponible: stock.quantiteDisponible - ligne.quantite,
        });

        const mvtId = await trx.raw('SELECT gen_random_uuid() as id')
          .then(r => r.rows[0].id);
        await trx('BaseEntity').insert({ id: mvtId });
        await trx('MouvementStock').insert({
          id:            mvtId,
          Var_id:        ligne.Var_id,
          Ven_id:        id,
          typeMouvement: 'SORTIE',
          quantite:      ligne.quantite,
          quantiteAvant: stock.quantiteDisponible,
          quantiteApres: stock.quantiteDisponible - ligne.quantite,
          refAuteur:     userId,
        });
      }
    }

    if (statut === 'ANNULEE' && vente.statut === 'VALIDEE') {
      for (const ligne of vente.lignes) {
        const stock = await trx('Stock as s')
          .join('VarianteProduit as v', 'v.Sto_id', 's.id')
          .where('v.id', ligne.Var_id)
          .select('s.id', 's.quantiteDisponible')
          .first();

        await trx('Stock').where('id', stock.id).update({
          quantiteDisponible: stock.quantiteDisponible + ligne.quantite,
        });

        const mvtId = await trx.raw('SELECT gen_random_uuid() as id')
          .then(r => r.rows[0].id);
        await trx('BaseEntity').insert({ id: mvtId });
        await trx('MouvementStock').insert({
          id:            mvtId,
          Var_id:        ligne.Var_id,
          Ven_id:        id,
          typeMouvement: 'ENTREE',
          quantite:      ligne.quantite,
          quantiteAvant: stock.quantiteDisponible,
          quantiteApres: stock.quantiteDisponible + ligne.quantite,
          refAuteur:     userId,
        });
      }
    }

    await trx('Vente').where('id', id).update({ statut });
    await trx('Auditable').where('id', id).update({ modifiePar: userId });
    await trx('BaseEntity').where('id', id).update({
      dateModification: trx.fn.now(),
      version:          vente.version + 1,
    });

    // ← trx passé ici
    return findById(id, trx);
  });
}

module.exports = { findAll, findById, create, updateStatut };