'use strict';

const Joi = require('joi');

const createVarianteSchema = Joi.object({
  Fam_id:        Joi.string().uuid().required(),
  dimension:     Joi.string().max(254).allow(null, '').optional(),
  epaisseur:     Joi.string().max(254).allow(null, '').optional(),
  prixVente:     Joi.number().min(0).required(),
  prixAchatMoyen: Joi.number().min(0).default(0),
  seuilAlerte:   Joi.number().integer().min(0).default(0),
});

const updateVarianteSchema = Joi.object({
  dimension:     Joi.string().max(254).allow(null, '').optional(),
  epaisseur:     Joi.string().max(254).allow(null, '').optional(),
  prixVente:     Joi.number().min(0).optional(),
  prixAchatMoyen: Joi.number().min(0).optional(),
  seuilAlerte:   Joi.number().integer().min(0).optional(),
  actif:         Joi.boolean().optional(),
}).min(1);

module.exports = { createVarianteSchema, updateVarianteSchema };