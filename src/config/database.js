'use strict';

const knex = require('knex');
const path = require('path');

const db = knex({
  client: 'pg',
  connection: {
    host:     process.env.DB_HOST     || 'localhost',
    port:     process.env.DB_PORT     || 5432,
    database: process.env.DB_NAME     || 'GESTquiCK',
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },
  pool: {
    min: 2,
    max: 10,
  },
});

// Test de connexion
async function testConnection() {
  try {
    await db.raw('SELECT 1');
    console.log('✅ PostgreSQL connecté — base:', process.env.DB_NAME);
  } catch (err) {
    console.error('❌ Erreur connexion PostgreSQL:', err.message);
    process.exit(1);
  }
}

module.exports = { db, testConnection };