'use strict';

const Joi = require('joi');

const updateUserSchema = Joi.object({
  displayName: Joi.string().min(2).max(100),
  phoneNumber: Joi.string().max(20),
  role:        Joi.string().valid('GERANT', 'ADMIN'),
  isActive:    Joi.boolean(),
  isBlocked:   Joi.boolean(),
}).min(1);

const setUserRoleSchema = Joi.object({
  role: Joi.string().valid('GERANT', 'ADMIN').required(),
});

const createUserSchema = Joi.object({
  email:       Joi.string().email().required(),
  displayName: Joi.string().min(2).max(100),
  phoneNumber: Joi.string().max(20),
  password:    Joi.string().min(6).required(),
});

module.exports = { updateUserSchema, setUserRoleSchema, createUserSchema };