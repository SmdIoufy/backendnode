'use strict';

exports.up = async function (knex) {
  await knex.schema.createTable('Approvisionnement', (table) => {
    table.uuid('id').primary();
    table.uuid('Four_id').notNullable();
    table.string('reference', 254).nullable().unique();
    table.date('date').notNullable().defaultTo(knex.fn.now());
    table.decimal('frais', 15, 2).notNullable().defaultTo(0);
    table.string('noteInterne', 254).nullable();

    table.foreign('id')
         .references('id')
         .inTable('Auditable')
         .onDelete('CASCADE')
         .onUpdate('RESTRICT');

    table.foreign('Four_id')
         .references('id')
         .inTable('Fournisseur')
         .onDelete('RESTRICT')
         .onUpdate('RESTRICT');
  });

  await knex.raw(`
    ALTER TABLE "Approvisionnement"
      ADD COLUMN statut StatutAppro NOT NULL DEFAULT 'BROUILLON';
  `);
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('Approvisionnement');
};