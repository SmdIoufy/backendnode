'use strict';

exports.up = async function (knex) {
  await knex.schema.createTable('Paiement', (table) => {
    table.uuid('id').primary();
    table.uuid('Ven_id').notNullable();
    table.decimal('montant', 15, 2).notNullable().defaultTo(0);
    table.string('reference', 254).nullable().unique();
    table.timestamp('date').notNullable().defaultTo(knex.fn.now());

    table.foreign('id')
         .references('id')
         .inTable('BaseEntity')
         .onDelete('CASCADE')
         .onUpdate('RESTRICT');

    table.foreign('Ven_id')
         .references('id')
         .inTable('Vente')
         .onDelete('CASCADE')
         .onUpdate('RESTRICT');
  });

  await knex.raw(`
    ALTER TABLE "Paiement"
      ADD COLUMN mode ModeReglement NOT NULL DEFAULT 'ESPECES';
  `);
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('Paiement');
};