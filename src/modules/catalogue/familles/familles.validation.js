'use strict';

const Joi = require('joi');

const createFamilleSchema = Joi.object({
  nom:         Joi.string().min(2).max(254).required(),
  Cat_id:      Joi.string().uuid().required(),
  description: Joi.string().max(254).allow(null, '').optional(),
  uniteMesure: Joi.string().max(254).allow(null, '').optional(),
});

const updateFamilleSchema = Joi.object({
  nom:         Joi.string().min(2).max(254).optional(),
  Cat_id:      Joi.string().uuid().optional(),
  description: Joi.string().max(254).allow(null, '').optional(),
  uniteMesure: Joi.string().max(254).allow(null, '').optional(),
  actif:       Joi.boolean().optional(),
}).min(1);

module.exports = { createFamilleSchema, updateFamilleSchema };