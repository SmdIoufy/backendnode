'use strict';

exports.up = async function (knex) {
  await knex.schema.createTable('BaseEntity', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.timestamp('dateCreation').notNullable().defaultTo(knex.fn.now());
    table.timestamp('dateModification').notNullable().defaultTo(knex.fn.now());
    table.integer('version').notNullable().defaultTo(0);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('BaseEntity');
};