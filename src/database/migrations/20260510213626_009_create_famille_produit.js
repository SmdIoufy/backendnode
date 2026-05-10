'use strict';

exports.up = async function (knex) {
  await knex.schema.createTable('FamilleProduit', (table) => {
    table.uuid('id').primary();
    table.uuid('Cat_id').notNullable();
    table.string('nom', 254).notNullable();
    table.string('description', 254).nullable();
    table.string('uniteMesure', 254).nullable();
    table.boolean('actif').notNullable().defaultTo(true);

    table.foreign('id')
         .references('id')
         .inTable('BaseEntity')
         .onDelete('CASCADE')
         .onUpdate('RESTRICT');

    table.foreign('Cat_id')
         .references('id')
         .inTable('Categorie')
         .onDelete('RESTRICT')
         .onUpdate('RESTRICT');
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('FamilleProduit');
};