'use strict';

const { db }   = require('../../config/database');
const AppError = require('../../utils/AppError');

// ── Générer une référence ──────────────────────────────────────
async function genererReference() {
  const annee  = new Date().getFullYear();
  const result = await db('Approvisionnement')
    .whereRaw(`EXTRACT(YEAR FROM date) = ?`, [annee])
    .count('id as count')
    .first();
  const num = String(parseInt(result.count) + 1).padStart(5, '0');
  return `APP-${annee}-${num}`;
}

// ── Lignes d'un approvisionnement ──────────────────────────────
async function getLignes(approId, trx = db) {
  return trx.raw(`
    SELECT
      la.id, la."Var_id", la.quantite,
      la."prixAchat", la.remise,
      v.dimension, f.nom as "familleNom"
    FROM "LigneApprovisionnement" la
    JOIN "VarianteProduit" v ON v.id = la."Var_id"
    JOIN "FamilleProduit" f  ON f.id = v."Fam_id"
    WHERE la."App_id" = ?
  `, [approId]).then(r => r.rows);
}

// ── Trouver par ID ─────────────────────────────────────────────
async function findById(id, trx = db) {
  const result = await trx.raw(`
    SELECT
      b.id, b."dateCreation", b."dateModification", b.version,
      a2."Four_id", a2.reference, a2.date, a2.frais,
      a2."noteInterne", a2.statut,
      f.nom as "fournisseurNom"
    FROM "BaseEntity" b
    JOIN "Auditable" a  ON a.id = b.id
    JOIN "Approvisionnement" a2 ON a2.id = a.id
    JOIN "Fournisseur" f        ON f.id = a2."Four_id"
    WHERE b.id = ?
  `, [id]);

  const appro = result.rows[0] || null;
  if (!appro) return null;

  appro.lignes = await getLignes(id, trx);
  return appro;
}

// ── Lister ────────────────────────────────────────────────────
async function findAll({ page = 1, limit = 20, statut, Four_id } = {}) {
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE 1=1';
  const bindings  = [];

  if (statut) {
    whereClause += ' AND a2.statut = ?';
    bindings.push(statut);
  }
  if (Four_id) {
    whereClause += ' AND a2."Four_id" = ?';
    bindings.push(Four_id);
  }

  const countResult = await db.raw(`
    SELECT COUNT(b.id) as count
    FROM "BaseEntity" b
    JOIN "Auditable" a  ON a.id = b.id
    JOIN "Approvisionnement" a2 ON a2.id = a.id
    JOIN "Fournisseur" f        ON f.id = a2."Four_id"
    ${whereClause}
  `, bindings).then(r => r.rows[0]);

  const total = parseInt(countResult.count, 10);

  const dataBindings = [...bindings, limit, offset];
  const data = await db.raw(`
    SELECT
      b.id, b."dateCreation", b."dateModification", b.version,
      a2."Four_id", a2.reference, a2.date, a2.frais,
      a2."noteInterne", a2.statut,
      f.nom as "fournisseurNom"
    FROM "BaseEntity" b
    JOIN "Auditable" a  ON a.id = b.id
    JOIN "Approvisionnement" a2 ON a2.id = a.id
    JOIN "Fournisseur" f        ON f.id = a2."Four_id"
    ${whereClause}
    ORDER BY b."dateCreation" DESC
    LIMIT ? OFFSET ?
  `, dataBindings).then(r => r.rows);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// ── Créer ─────────────────────────────────────────────────────
async function create(data, userId) {
  const { Four_id, lignes, frais = 0, noteInterne } = data;

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

    const reference = await genererReference();

    await trx('Approvisionnement').insert({
      id,
      Four_id,
      reference,
      frais,
      noteInterne: noteInterne || null,
      statut: 'BROUILLON',
    });

    for (const ligne of lignes) {
      const ligneId = await trx.raw('SELECT gen_random_uuid() as id')
        .then(r => r.rows[0].id);

      await trx('BaseEntity').insert({ id: ligneId });
      await trx('LigneApprovisionnement').insert({
        id:       ligneId,
        App_id:   id,
        Var_id:   ligne.Var_id,
        quantite: ligne.quantite,
        prixAchat: ligne.prixAchat,
        remise:   ligne.remise || 0,
      });
    }

    return findById(id, trx);
  });
}

// ── Changer le statut ──────────────────────────────────────────
async function updateStatut(id, statut, userId) {
  const appro = await findById(id);
  if (!appro) return null;

  const transitions = {
    BROUILLON: ['VALIDEE', 'ANNULEE'],
    VALIDEE:   ['ANNULEE'],
    ANNULEE:   [],
  };

  if (!transitions[appro.statut]?.includes(statut)) {
    throw new AppError(
      `Transition ${appro.statut} → ${statut} non autorisée`,
      409,
      'INVALID_STATUS_TRANSITION'
    );
  }

  return db.transaction(async (trx) => {

    // VALIDEE → crédit stock + recalcul prixAchatMoyen
    if (statut === 'VALIDEE') {
      for (const ligne of appro.lignes) {
        const stock = await trx('Stock as s')
          .join('VarianteProduit as v', 'v.Sto_id', 's.id')
          .where('v.id', ligne.Var_id)
          .select('s.id', 's.quantiteDisponible', 'v.id as varianteId', 'v.prixAchatMoyen')
          .first();

        const nouvelleQte   = stock.quantiteDisponible + ligne.quantite;
        const prixAchatNet  = ligne.prixAchat * (1 - (ligne.remise || 0) / 100);

        // Recalcul prix achat moyen pondéré
        const nouveauPam = stock.quantiteDisponible === 0
          ? prixAchatNet
          : ((stock.quantiteDisponible * stock.prixAchatMoyen) + (ligne.quantite * prixAchatNet)) / nouvelleQte;

        // Mise à jour stock
        await trx('Stock').where('id', stock.id).update({
          quantiteDisponible: nouvelleQte,
        });

        // Mise à jour prixAchatMoyen
        await trx('VarianteProduit').where('id', ligne.Var_id).update({
          prixAchatMoyen: nouveauPam.toFixed(2),
        });

        // Mouvement ENTREE
        const mvtId = await trx.raw('SELECT gen_random_uuid() as id')
          .then(r => r.rows[0].id);
        await trx('BaseEntity').insert({ id: mvtId });
        await trx('MouvementStock').insert({
          id:            mvtId,
          Var_id:        ligne.Var_id,
          App_id:        id,
          typeMouvement: 'ENTREE',
          quantite:      ligne.quantite,
          quantiteAvant: stock.quantiteDisponible,
          quantiteApres: nouvelleQte,
          refAuteur:     userId,
        });
      }
    }

    // ANNULEE depuis VALIDEE → débit stock
    if (statut === 'ANNULEE' && appro.statut === 'VALIDEE') {
      for (const ligne of appro.lignes) {
        const stock = await trx('Stock as s')
          .join('VarianteProduit as v', 'v.Sto_id', 's.id')
          .where('v.id', ligne.Var_id)
          .select('s.id', 's.quantiteDisponible')
          .first();

        const nouvelleQte = Math.max(0, stock.quantiteDisponible - ligne.quantite);

        await trx('Stock').where('id', stock.id).update({
          quantiteDisponible: nouvelleQte,
        });

        const mvtId = await trx.raw('SELECT gen_random_uuid() as id')
          .then(r => r.rows[0].id);
        await trx('BaseEntity').insert({ id: mvtId });
        await trx('MouvementStock').insert({
          id:            mvtId,
          Var_id:        ligne.Var_id,
          App_id:        id,
          typeMouvement: 'SORTIE',
          quantite:      ligne.quantite,
          quantiteAvant: stock.quantiteDisponible,
          quantiteApres: nouvelleQte,
          refAuteur:     userId,
        });
      }
    }

    await trx('Approvisionnement').where('id', id).update({ statut });
    await trx('Auditable').where('id', id).update({ modifiePar: userId });
    await trx('BaseEntity').where('id', id).update({
      dateModification: trx.fn.now(),
      version:          appro.version + 1,
    });

    return findById(id, trx);
  });
}

module.exports = { findAll, findById, create, updateStatut };