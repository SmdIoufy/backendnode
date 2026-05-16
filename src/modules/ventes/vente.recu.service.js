'use strict';

const { db } = require('../../config/database');

async function getVenteAvecClient(venteId) {
  const result = await db.raw(`
    SELECT
      b.id,
      b."dateCreation",
      b."dateModification",
      b.version,
      v."Cli_id",
      v.reference,
      v.date,
      v."montantTotal",
      v.statut,
      c.id as "clientId",
      c.nom as "clientNom",
      c.telephone as "clientTelephone",
      c.email as "clientEmail",
      c.actif as "clientActif"
    FROM "BaseEntity" b
    JOIN "Auditable" a ON a.id = b.id
    JOIN "Vente" v     ON v.id = a.id
    JOIN "Client" c    ON c.id = v."Cli_id"
    WHERE b.id = ?
  `, [venteId]);

  return result.rows[0] || null;
}

async function getLignesRecu(venteId) {
  const result = await db.raw(`
    SELECT
      lv.id,
      lv."Ven_id",
      lv."Var_id",
      lv.quantite,
      lv."prixUnitaire",
      lv."coutUnitaire",
      lv.remise,
      v.dimension,
      v.epaisseur,
      v."prixVente",
      v."prixAchatMoyen",
      f.id as "familleId",
      f.nom as "familleNom",
      f.description as "familleDescription"
    FROM "LigneVente" lv
    JOIN "VarianteProduit" v ON v.id = lv."Var_id"
    JOIN "FamilleProduit" f  ON f.id = v."Fam_id"
    WHERE lv."Ven_id" = ?
    ORDER BY lv.id
  `, [venteId]);

  return result.rows;
}

async function getRecuVente(venteId) {
  const vente = await getVenteAvecClient(venteId);

  if (!vente) {
    throw 'VENTE_NOT_FOUND';
  }

  const lignes = await getLignesRecu(venteId);

  const lignesFormatees = lignes.map((ligne) => {
    const quantite = Number(ligne.quantite || 0);
    const prixUnitaire = Number(ligne.prixUnitaire || 0);
    const remise = Number(ligne.remise || 0);
    const montantBrut = quantite * prixUnitaire;
    const montantRemise = (montantBrut * remise) / 100;
    const montantNet = montantBrut - montantRemise;

    return {
      ...ligne,
      montantBrut,
      montantRemise,
      montantNet,
      produit: {
        id: ligne.Var_id,
        dimension: ligne.dimension,
        epaisseur: ligne.epaisseur,
        prixVente: ligne.prixVente,
        prixAchatMoyen: ligne.prixAchatMoyen,
        famille: {
          id: ligne.familleId,
          nom: ligne.familleNom,
          description: ligne.familleDescription,
        },
      },
    };
  });

  const totaux = lignesFormatees.reduce((acc, ligne) => {
    acc.montantBrut += ligne.montantBrut;
    acc.montantRemise += ligne.montantRemise;
    acc.montantNet += ligne.montantNet;
    return acc;
  }, {
    montantBrut: 0,
    montantRemise: 0,
    montantNet: 0,
  });

  return {
    vente: {
      id: vente.id,
      dateCreation: vente.dateCreation,
      dateModification: vente.dateModification,
      version: vente.version,
      Cli_id: vente.Cli_id,
      reference: vente.reference,
      date: vente.date,
      montantTotal: vente.montantTotal,
      statut: vente.statut,
      client: {
        id: vente.clientId,
        nom: vente.clientNom,
        telephone: vente.clientTelephone,
        email: vente.clientEmail,
        actif: vente.clientActif,
      },
      totals: {
        montantBrut: totaux.montantBrut,
        montantRemise: totaux.montantRemise,
        montantNet: Number(vente.montantTotal ?? totaux.montantNet),
      },
    },
    lignes: lignesFormatees,
  };
}

module.exports = { getRecuVente };