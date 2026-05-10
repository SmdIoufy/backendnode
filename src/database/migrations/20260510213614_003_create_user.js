'use strict';

exports.up = async function (knex) {
  await knex.schema.createTable('User', (table) => {
    table.uuid('id').primary();
    table.string('firebaseUid', 254).notNullable().unique();
    table.string('email', 254).notNullable().unique();
    table.string('displayName', 254).nullable();
    table.string('phoneNumber', 254).nullable();
    table.boolean('isActive').notNullable().defaultTo(true);
    table.boolean('isBlocked').notNullable().defaultTo(false);
    table.integer('loginCount').notNullable().defaultTo(0);
    table.timestamp('lastLoginAt').nullable();

    table.foreign('id')
         .references('id')
         .inTable('BaseEntity')
         .onDelete('CASCADE')
         .onUpdate('RESTRICT');
  });

  await knex.raw(`
    ALTER TABLE "User"
      ADD COLUMN role Role NOT NULL DEFAULT 'GERANT';
  `);
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('User');
};