'use strict';

const usersService = require('./users.service');
const { updateUserSchema, setUserRoleSchema, createUserSchema } = require('./users.validation');

async function list(req, res, next) {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 20;
    const search = req.query.search || undefined;
    const result = await usersService.findAll({ page, limit, search });
    return res.status(200).json({ success: true, ...result });
  } catch (err) { next(err); }
}

async function getMe(req, res, next) {
  try {
    const user = await usersService.findByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé : utilisateur non enregistré',
        code: 'USER_NOT_FOUND',
      });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const user = await usersService.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable',
        code: 'USER_NOT_FOUND',
      });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { error, value } = createUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        code: 'VALIDATION_ERROR',
        errors: error.details.map(d => ({ field: d.path.join('.'), message: d.message })),
      });
    }
    const user = await usersService.createUser(value);
    return res.status(201).json({ success: true, data: user });
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const { error, value } = updateUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        code: 'VALIDATION_ERROR',
        errors: error.details.map(d => ({ field: d.path.join('.'), message: d.message })),
      });
    }
    const user = await usersService.update(req.params.id, value);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable',
        code: 'USER_NOT_FOUND',
      });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (err) { next(err); }
}

async function setRole(req, res, next) {
  try {
    const { error, value } = setUserRoleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        code: 'VALIDATION_ERROR',
        errors: error.details.map(d => ({ field: d.path.join('.'), message: d.message })),
      });
    }
    await usersService.setFirebaseRole(req.params.uid, value.role);
    return res.status(200).json({
      success: true,
      message: 'Rôle mis à jour avec succès',
    });
  } catch (err) { next(err); }
}

module.exports = { list, getMe, getById, create, update, setRole };