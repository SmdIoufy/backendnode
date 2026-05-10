'use strict';

exports.up = async function (knex) {
  await knex.schema.createTable('Vente', (table) => {
    table.uuid('id').primary();
    table.uuid('Cli_id').notNullable();
    table.string('reference', 254).nullable().unique();
    table.date('date').notNullable().defaultTo(knex.fn.now());
    table.decimal('montantTotal', 15, 2).notNullable().defaultTo(0);

    table.foreign('id')
         .references('id')
         .inTable('Auditable')
         .onDelete('CASCADE')
         .onUpdate('RESTRICT');

    table.foreign('Cli_id')
         .references('id')
         .inTable('Client')
         .onDelete('RESTRICT')
         .onUpdate('RESTRICT');
  });

  await knex.raw(`
    ALTER TABLE "Vente"
      ADD COLUMN statut StatutVente NOT NULL DEFAULT 'BROUILLON';
  `);
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('Vente');
};