'use strict';

exports.up = async function (knex) {
  await knex.schema.createTable('Stock', (table) => {
    table.uuid('id').primary();
    table.integer('quantiteDisponible').notNullable().defaultTo(0);
    table.integer('quantiteReservee').notNullable().defaultTo(0);
    table.integer('seuilMinimum').notNullable().defaultTo(0);
    table.string('emplacement', 254).nullable();

    table.foreign('id')
         .references('id')
         .inTable('BaseEntity')
         .onDelete('CASCADE')
         .onUpdate('RESTRICT');
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('Stock');
};