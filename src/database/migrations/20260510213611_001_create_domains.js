'use strict';

exports.up = async function (knex) {
  await knex.raw(`
    CREATE DOMAIN ModeReglement AS VARCHAR(20)
      CHECK (VALUE IN ('ESPECES','MOBILE_MONEY','CHEQUE','VIREMENT'));

    CREATE DOMAIN Role AS VARCHAR(20)
      CHECK (VALUE IN ('GERANT','ADMIN'));

    CREATE DOMAIN StatutAppro AS VARCHAR(20)
      CHECK (VALUE IN ('BROUILLON','VALIDEE','ANNULEE'));

    CREATE DOMAIN StatutInventaire AS VARCHAR(20)
      CHECK (VALUE IN ('EN_COURS','VALIDE','ANNULE'));

    CREATE DOMAIN StatutVente AS VARCHAR(20)
      CHECK (VALUE IN ('BROUILLON','VALIDEE','ANNULEE'));

    CREATE DOMAIN TypeMouvement AS VARCHAR(20)
      CHECK (VALUE IN ('ENTREE','SORTIE','AJUSTEMENT'));
  `);
};

exports.down = async function (knex) {
  await knex.raw(`
    DROP DOMAIN IF EXISTS ModeReglement;
    DROP DOMAIN IF EXISTS Role;
    DROP DOMAIN IF EXISTS StatutAppro;
    DROP DOMAIN IF EXISTS StatutInventaire;
    DROP DOMAIN IF EXISTS StatutVente;
    DROP DOMAIN IF EXISTS TypeMouvement;
  `);
};