'use strict';

const Joi = require('joi');

const createInventaireSchema = Joi.object({
  description: Joi.string().max(254).allow(null, '').optional(),
  lignes: Joi.array().items(
    Joi.object({
      Var_id:           Joi.string().uuid().required(),
      quantitePhysique: Joi.number().integer().min(0).required(),
      observation:      Joi.string().max(254).allow(null, '').optional(),
    })
  ).min(1).required(),
});

const updateStatutSchema = Joi.object({
  statut: Joi.string().valid('VALIDE', 'ANNULE').required(),
});

module.exports = { createInventaireSchema, updateStatutSchema };