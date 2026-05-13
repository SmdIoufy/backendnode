'use strict';

const { db } = require('../../config/database');

// ── Familles les plus vendues ──────────────────────────────────
async function famillesPlusVendues({ limit = 10, dateDebut, dateFin } = {}) {
  let whereClause = `WHERE v.statut = 'VALIDEE'`;
  const bindings  = [];

  if (dateDebut) {
    whereClause += ' AND v.date >= ?';
    bindings.push(dateDebut);
  }
  if (dateFin) {
    whereClause += ' AND v.date <= ?';
    bindings.push(dateFin);
  }

  bindings.push(limit);

  const result = await db.raw(`
    SELECT
      f.id        as "familleId",
      f.nom       as "familleNom",
      c.nom       as "categorieNom",
      SUM(lv.quantite)                          as "totalQuantiteVendue",
      SUM(lv.quantite * lv."prixUnitaire" * (1 - lv.remise / 100)) as "totalMontantVente",
      COUNT(DISTINCT v.id)                      as "nombreVentes"
    FROM "LigneVente" lv
    JOIN "VarianteProduit" vp ON vp.id = lv."Var_id"
    JOIN "FamilleProduit" f   ON f.id  = vp."Fam_id"
    JOIN "Categorie" c        ON c.id  = f."Cat_id"
    JOIN "Vente" v            ON v.id  = lv."Ven_id"
    ${whereClause}
    GROUP BY f.id, f.nom, c.nom
    ORDER BY "totalQuantiteVendue" DESC
    LIMIT ?
  `, bindings);

  return result.rows;
}

// ── Variantes les plus vendues ─────────────────────────────────
async function variantesPlusVendues({ limit = 10, dateDebut, dateFin } = {}) {
  let whereClause = `WHERE v.statut = 'VALIDEE'`;
  const bindings  = [];

  if (dateDebut) {
    whereClause += ' AND v.date >= ?';
    bindings.push(dateDebut);
  }
  if (dateFin) {
    whereClause += ' AND v.date <= ?';
    bindings.push(dateFin);
  }

  bindings.push(limit);

  const result = await db.raw(`
    SELECT
      vp.id           as "varianteId",
      vp.dimension    as "dimension",
      vp."prixVente"  as "prixVente",
      f.nom           as "familleNom",
      c.nom           as "categorieNom",
      SUM(lv.quantite) as "totalQuantiteVendue",
      SUM(lv.quantite * lv."prixUnitaire" * (1 - lv.remise / 100)) as "totalMontantVente",
      COUNT(DISTINCT v.id) as "nombreVentes"
    FROM "LigneVente" lv
    JOIN "VarianteProduit" vp ON vp.id = lv."Var_id"
    JOIN "FamilleProduit" f   ON f.id  = vp."Fam_id"
    JOIN "Categorie" c        ON c.id  = f."Cat_id"
    JOIN "Vente" v            ON v.id  = lv."Ven_id"
    ${whereClause}
    GROUP BY vp.id, vp.dimension, vp."prixVente", f.nom, c.nom
    ORDER BY "totalQuantiteVendue" DESC
    LIMIT ?
  `, bindings);

  return result.rows;
}

// ── Dashboard général ──────────────────────────────────────────
async function dashboard() {
  const [
    totalClients,
    totalFournisseurs,
    totalVariantes,
    ventesAujourdhui,
    ventesMois,
    stockEnAlerte,
    ventesParStatut,
  ] = await Promise.all([

    // Total clients actifs
    db.raw(`SELECT COUNT(*) as count FROM "Client" WHERE actif = true`)
      .then(r => parseInt(r.rows[0].count, 10)),

    // Total fournisseurs actifs
    db.raw(`SELECT COUNT(*) as count FROM "Fournisseur" WHERE actif = true`)
      .then(r => parseInt(r.rows[0].count, 10)),

    // Total variantes actives
    db.raw(`SELECT COUNT(*) as count FROM "VarianteProduit" WHERE actif = true`)
      .then(r => parseInt(r.rows[0].count, 10)),

    // Ventes aujourd'hui (montant total)
    db.raw(`
      SELECT COALESCE(SUM("montantTotal"), 0) as total
      FROM "Vente"
      WHERE statut = 'VALIDEE'
      AND date = CURRENT_DATE
    `).then(r => parseFloat(r.rows[0].total)),

    // Ventes ce mois
    db.raw(`
      SELECT COALESCE(SUM("montantTotal"), 0) as total
      FROM "Vente"
      WHERE statut = 'VALIDEE'
      AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR  FROM date) = EXTRACT(YEAR  FROM CURRENT_DATE)
    `).then(r => parseFloat(r.rows[0].total)),

    // Stock en alerte (quantiteDisponible < seuilAlerte)
    db.raw(`
      SELECT COUNT(*) as count
      FROM "VarianteProduit" vp
      JOIN "Stock" s ON s.id = vp."Sto_id"
      WHERE vp.actif = true
      AND s."quantiteDisponible" <= vp."seuilAlerte"
    `).then(r => parseInt(r.rows[0].count, 10)),

    // Ventes par statut
    db.raw(`
      SELECT statut, COUNT(*) as count, COALESCE(SUM("montantTotal"), 0) as total
      FROM "Vente"
      GROUP BY statut
    `).then(r => {
      const result = {};
      r.rows.forEach(row => {
        result[row.statut] = {
          count: parseInt(row.count, 10),
          total: parseFloat(row.total),
        };
      });
      return result;
    }),
  ]);

  return {
    totalClients,
    totalFournisseurs,
    totalVariantes,
    totalVentesAujourdhui: ventesAujourdhui,
    totalVentesMois:       ventesMois,
    stockEnAlerte,
    ventesParStatut,
  };
}

module.exports = { famillesPlusVendues, variantesPlusVendues, dashboard };