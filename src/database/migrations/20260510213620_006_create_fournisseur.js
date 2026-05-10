'use strict';

exports.up = async function (knex) {
  await knex.schema.createTable('Fournisseur', (table) => {
    table.uuid('id').primary();
    table.string('nom', 254).notNullable();
    table.string('telephone', 254).nullable();
    table.string('email', 254).nullable();
    table.boolean('actif').notNullable().defaultTo(true);

    table.foreign('id')
         .references('id')
         .inTable('BaseEntity')
         .onDelete('CASCADE')
         .onUpdate('RESTRICT');
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('Fournisseur');
};