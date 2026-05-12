'use strict';

const Joi = require('joi');

const createCategorieSchema = Joi.object({
  nom:         Joi.string().min(2).max(254).required(),
  description: Joi.string().max(254).allow(null, '').optional(),
});

const updateCategorieSchema = Joi.object({
  nom:         Joi.string().min(2).max(254).optional(),
  description: Joi.string().max(254).allow(null, '').optional(),
  actif:       Joi.boolean().optional(),
}).min(1);

module.exports = { createCategorieSchema, updateCategorieSchema };