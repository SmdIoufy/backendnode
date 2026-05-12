'use strict';

const Joi = require('joi');

const createVenteSchema = Joi.object({
  Cli_id: Joi.string().uuid().required(),
  lignes: Joi.array().items(
    Joi.object({
      Var_id:       Joi.string().uuid().required(),
      quantite:     Joi.number().integer().min(1).required(),
      prixUnitaire: Joi.number().min(0).required(),
      remise:       Joi.number().min(0).max(100).default(0),
    })
  ).min(1).required(),
});

const updateStatutSchema = Joi.object({
  statut: Joi.string().valid('VALIDEE', 'ANNULEE').required(),
});

module.exports = { createVenteSchema, updateStatutSchema };