'use strict';

exports.up = async function (knex) {
  await knex.raw(`
    CREATE INDEX idx_auditable_user      ON "Auditable"("Use_id");
    CREATE INDEX idx_famille_categorie   ON "FamilleProduit"("Cat_id");
    CREATE INDEX idx_variante_famille    ON "VarianteProduit"("Fam_id");
    CREATE INDEX idx_variante_stock      ON "VarianteProduit"("Sto_id");
    CREATE INDEX idx_vente_client        ON "Vente"("Cli_id");
    CREATE INDEX idx_vente_date          ON "Vente"(date);
    CREATE INDEX idx_lignevente_vente    ON "LigneVente"("Ven_id");
    CREATE INDEX idx_lignevente_variante ON "LigneVente"("Var_id");
    CREATE INDEX idx_paiement_vente      ON "Paiement"("Ven_id");
    CREATE INDEX idx_appro_fournisseur   ON "Approvisionnement"("Four_id");
    CREATE INDEX idx_ligneappro_appro    ON "LigneApprovisionnement"("App_id");
    CREATE INDEX idx_ligneappro_variante ON "LigneApprovisionnement"("Var_id");
    CREATE INDEX idx_ligneinv_inventaire ON "LigneInventaire"("Inv_id");
    CREATE INDEX idx_ligneinv_variante   ON "LigneInventaire"("Var_id");
    CREATE INDEX idx_mvt_variante        ON "MouvementStock"("Var_id");
    CREATE INDEX idx_mvt_date            ON "MouvementStock"(date);
    CREATE INDEX idx_mvt_vente           ON "MouvementStock"("Ven_id");
    CREATE INDEX idx_mvt_appro           ON "MouvementStock"("App_id");
    CREATE INDEX idx_mvt_inventaire      ON "MouvementStock"("Inv_id");
    CREATE INDEX idx_user_firebase       ON "User"("firebaseUid");
  `);
};

exports.down = async function (knex) {
  await knex.raw(`
    DROP INDEX IF EXISTS idx_auditable_user;
    DROP INDEX IF EXISTS idx_famille_categorie;
    DROP INDEX IF EXISTS idx_variante_famille;
    DROP INDEX IF EXISTS idx_variante_stock;
    DROP INDEX IF EXISTS idx_vente_client;
    DROP INDEX IF EXISTS idx_vente_date;
    DROP INDEX IF EXISTS idx_lignevente_vente;
    DROP INDEX IF EXISTS idx_lignevente_variante;
    DROP INDEX IF EXISTS idx_paiement_vente;
    DROP INDEX IF EXISTS idx_appro_fournisseur;
    DROP INDEX IF EXISTS idx_ligneappro_appro;
    DROP INDEX IF EXISTS idx_ligneappro_variante;
    DROP INDEX IF EXISTS idx_ligneinv_inventaire;
    DROP INDEX IF EXISTS idx_ligneinv_variante;
    DROP INDEX IF EXISTS idx_mvt_variante;
    DROP INDEX IF EXISTS idx_mvt_date;
    DROP INDEX IF EXISTS idx_mvt_vente;
    DROP INDEX IF EXISTS idx_mvt_appro;
    DROP INDEX IF EXISTS idx_mvt_inventaire;
    DROP INDEX IF EXISTS idx_user_firebase;
  `);
};