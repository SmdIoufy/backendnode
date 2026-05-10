'use strict';

exports.up = async function (knex) {
  await knex.raw(`
    CREATE TABLE "LigneInventaire" (
      id                  UUID            NOT NULL,
      "Inv_id"            UUID            NOT NULL,
      "Var_id"            UUID            NOT NULL,
      "quantiteTheorique" INTEGER         NOT NULL DEFAULT 0,
      "quantitePhysique"  INTEGER         NOT NULL DEFAULT 0,
      ecart               INTEGER         GENERATED ALWAYS AS ("quantitePhysique" - "quantiteTheorique") STORED,
      "prixAchatSnapshot" NUMERIC(15,2)   NOT NULL DEFAULT 0,
      "prixVenteSnapshot" NUMERIC(15,2)   NOT NULL DEFAULT 0,
      observation         VARCHAR(254)    NULL,

      CONSTRAINT PK_LIGNEINVENTAIRE PRIMARY KEY (id),
      CONSTRAINT FK_LIGNEINV_BASEENTITY FOREIGN KEY (id)
        REFERENCES "BaseEntity"(id) ON DELETE CASCADE ON UPDATE RESTRICT,
      CONSTRAINT FK_LIGNEINV_INVENTAIRE FOREIGN KEY ("Inv_id")
        REFERENCES "Inventaire"(id) ON DELETE CASCADE ON UPDATE RESTRICT,
      CONSTRAINT FK_LIGNEINV_VARIANTE FOREIGN KEY ("Var_id")
        REFERENCES "VarianteProduit"(id) ON DELETE RESTRICT ON UPDATE RESTRICT
    );
  `);
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('LigneInventaire');
};