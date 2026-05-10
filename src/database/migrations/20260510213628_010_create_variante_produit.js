'use strict';

exports.up = async function (knex) {
  await knex.schema.createTable('VarianteProduit', (table) => {
    table.uuid('id').primary();
    table.uuid('Fam_id').notNullable();
    table.uuid('Sto_id').notNullable().unique();
    table.string('dimension', 254).nullable();
    table.string('epaisseur', 254).nullable();
    table.decimal('prixVente', 15, 2).notNullable().defaultTo(0);
    table.decimal('prixAchatMoyen', 15, 2).notNullable().defaultTo(0);
    table.integer('seuilAlerte').notNullable().defaultTo(0);
    table.boolean('actif').notNullable().defaultTo(true);

    table.foreign('id')
         .references('id')
         .inTable('BaseEntity')
         .onDelete('CASCADE')
         .onUpdate('RESTRICT');

    table.foreign('Fam_id')
         .references('id')
         .inTable('FamilleProduit')
         .onDelete('RESTRICT')
         .onUpdate('RESTRICT');

    table.foreign('Sto_id')
         .references('id')
         .inTable('Stock')
         .onDelete('RESTRICT')
         .onUpdate('RESTRICT');
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('VarianteProduit');
};