'use strict';

exports.up = async function (knex) {
  await knex.schema.createTable('MouvementStock', (table) => {
    table.uuid('id').primary();
    table.uuid('Var_id').notNullable();
    table.uuid('Ven_id').nullable();
    table.uuid('App_id').nullable();
    table.uuid('Inv_id').nullable();
    table.integer('quantite').notNullable();
    table.date('date').notNullable().defaultTo(knex.fn.now());
    table.string('raison', 254).nullable();
    table.integer('quantiteAvant').notNullable().defaultTo(0);
    table.integer('quantiteApres').notNullable().defaultTo(0);
    table.string('refAuteur', 254).notNullable();

    table.foreign('id')
         .references('id')
         .inTable('BaseEntity')
         .onDelete('CASCADE')
         .onUpdate('RESTRICT');

    table.foreign('Var_id')
         .references('id')
         .inTable('VarianteProduit')
         .onDelete('RESTRICT')
         .onUpdate('RESTRICT');

    table.foreign('Ven_id')
         .references('id')
         .inTable('Vente')
         .onDelete('SET NULL')
         .onUpdate('RESTRICT');

    table.foreign('App_id')
         .references('id')
         .inTable('Approvisionnement')
         .onDelete('SET NULL')
         .onUpdate('RESTRICT');

    table.foreign('Inv_id')
         .references('id')
         .inTable('Inventaire')
         .onDelete('SET NULL')
         .onUpdate('RESTRICT');
  });

  await knex.raw(`
    ALTER TABLE "MouvementStock"
      ADD COLUMN "typeMouvement" TypeMouvement NOT NULL;
  `);
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('MouvementStock');
};