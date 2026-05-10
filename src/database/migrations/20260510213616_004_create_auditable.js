'use strict';

exports.up = async function (knex) {
  await knex.schema.createTable('Auditable', (table) => {
    table.uuid('id').primary();
    table.uuid('Use_id').nullable();
    table.string('creePar', 254).nullable();
    table.string('modifiePar', 254).nullable();

    table.foreign('id')
         .references('id')
         .inTable('BaseEntity')
         .onDelete('CASCADE')
         .onUpdate('RESTRICT');

    table.foreign('Use_id')
         .references('id')
         .inTable('User')
         .onDelete('SET NULL')
         .onUpdate('RESTRICT');
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('Auditable');
};