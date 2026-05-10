'use strict';

exports.up = async function (knex) {
  await knex.schema.createTable('LigneApprovisionnement', (table) => {
    table.uuid('id').primary();
    table.uuid('App_id').notNullable();
    table.uuid('Var_id').notNullable();
    table.integer('quantite').notNullable().defaultTo(1);
    table.decimal('prixAchat', 15, 2).notNullable().defaultTo(0);
    table.decimal('remise', 5, 2).notNullable().defaultTo(0);

    table.foreign('id')
         .references('id')
         .inTable('BaseEntity')
         .onDelete('CASCADE')
         .onUpdate('RESTRICT');

    table.foreign('App_id')
         .references('id')
         .inTable('Approvisionnement')
         .onDelete('CASCADE')
         .onUpdate('RESTRICT');

    table.foreign('Var_id')
         .references('id')
         .inTable('VarianteProduit')
         .onDelete('RESTRICT')
         .onUpdate('RESTRICT');
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('LigneApprovisionnement');
};