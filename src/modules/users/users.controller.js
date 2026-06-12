'use strict';

const usersService = require('./users.service');
const { updateUserSchema } = require('./users.validation');

// GET /users
async function list(req, res, next) {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 20;
    const search = req.query.search || undefined;
    const result = await usersService.findAll({ page, limit, search });
    return res.status(200).json({ success: true, ...result });
  } catch (err) { next(err); }
}

// GET /users/me  ← MODIFIÉ : auto-création si l'utilisateur n'existe pas encore
async function getMe(req, res, next) {
  try {
    const user = await usersService.findOrCreateByFirebaseUid(
      req.user.uid,
      req.user.email
    );
    return res.status(200).json({ success: true, data: user });
  } catch (err) { next(err); }
}

// GET /users/:id
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

// PATCH /users/:id
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

module.exports = { list, getMe, getById, update };