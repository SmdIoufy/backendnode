'use strict';

const Joi = require('joi');

const createApproSchema = Joi.object({
  Four_id:     Joi.string().uuid().required(),
  frais:       Joi.number().min(0).default(0),
  noteInterne: Joi.string().max(254).allow(null, '').optional(),
  lignes: Joi.array().items(
    Joi.object({
      Var_id:   Joi.string().uuid().required(),
      quantite: Joi.number().integer().min(1).required(),
      prixAchat: Joi.number().min(0).required(),
      remise:   Joi.number().min(0).max(100).default(0),
    })
  ).min(1).required(),
});

const updateStatutSchema = Joi.object({
  statut: Joi.string().valid('VALIDEE', 'ANNULEE').required(),
});

module.exports = { createApproSchema, updateStatutSchema };