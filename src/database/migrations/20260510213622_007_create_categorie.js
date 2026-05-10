'use strict';

exports.up = async function (knex) {
  await knex.schema.createTable('Categorie', (table) => {
    table.uuid('id').primary();
    table.string('nom', 254).notNullable();
    table.string('description', 254).nullable();
    table.boolean('actif').notNullable().defaultTo(true);

    table.foreign('id')
         .references('id')
         .inTable('BaseEntity')
         .onDelete('CASCADE')
         .onUpdate('RESTRICT');
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('Categorie');
};