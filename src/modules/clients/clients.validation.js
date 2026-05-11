'use strict';

const Joi = require('joi');

const createClientSchema = Joi.object({
  nom:       Joi.string().min(2).max(254).required(),
  telephone: Joi.string().max(254).allow(null, '').optional(),
  email:     Joi.string().email().max(254).allow(null, '').optional(),
});

const updateClientSchema = Joi.object({
  nom:       Joi.string().min(2).max(254).optional(),
  telephone: Joi.string().max(254).allow(null, '').optional(),
  email:     Joi.string().email().max(254).allow(null, '').optional(),
  actif:     Joi.boolean().optional(),
}).min(1);

module.exports = { createClientSchema, updateClientSchema };