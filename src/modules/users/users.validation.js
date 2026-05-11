'use strict';

const Joi = require('joi');

const updateUserSchema = Joi.object({
  displayName: Joi.string().min(2).max(100),
  phoneNumber: Joi.string().max(20),
  role:        Joi.string().valid('GERANT', 'ADMIN'),
  isActive:    Joi.boolean(),
  isBlocked:   Joi.boolean(),
}).min(1); // Au moins un champ requis

module.exports = { updateUserSchema };