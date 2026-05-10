'use strict';

exports.up = async function (knex) {
  await knex.schema.createTable('Inventaire', (table) => {
    table.uuid('id').primary();
    table.date('date').notNullable().defaultTo(knex.fn.now());
    table.string('description', 254).nullable();
    table.integer('totalQuantiteTheorique').notNullable().defaultTo(0);
    table.integer('totalQuantitePhysique').notNullable().defaultTo(0);
    table.integer('ecartTotal').notNullable().defaultTo(0);
    table.decimal('valeurStockPhysique', 15, 2).notNullable().defaultTo(0);
    table.decimal('valeurStockTheorique', 15, 2).notNullable().defaultTo(0);

    table.foreign('id')
         .references('id')
         .inTable('Auditable')
         .onDelete('CASCADE')
         .onUpdate('RESTRICT');
  });

  await knex.raw(`
    ALTER TABLE "Inventaire"
      ADD COLUMN statut StatutInventaire NOT NULL DEFAULT 'EN_COURS';
  `);
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('Inventaire');
};