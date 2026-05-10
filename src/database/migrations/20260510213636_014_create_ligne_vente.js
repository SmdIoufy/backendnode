'use strict';

exports.up = async function (knex) {
  await knex.schema.createTable('LigneVente', (table) => {
    table.uuid('id').primary();
    table.uuid('Ven_id').notNullable();
    table.uuid('Var_id').notNullable();
    table.integer('quantite').notNullable().defaultTo(1);
    table.decimal('prixUnitaire', 15, 2).notNullable().defaultTo(0);
    table.decimal('coutUnitaire', 15, 2).notNullable().defaultTo(0);
    table.decimal('remise', 5, 2).notNullable().defaultTo(0);

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

    table.foreign('Var_id')
         .references('id')
         .inTable('VarianteProduit')
         .onDelete('RESTRICT')
         .onUpdate('RESTRICT');
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('LigneVente');
};