'use strict';

const service  = require('./approvisionnements.service');
const AppError = require('../../utils/AppError');
const { createApproSchema, updateStatutSchema } = require('./approvisionnements.validation');

async function list(req, res, next) {
  try {
    const { page, limit, statut, Four_id } = req.query;
    const result = await service.findAll({
      page:  parseInt(page)  || 1,
      limit: parseInt(limit) || 20,
      statut, Four_id,
    });
    return res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const appro = await service.findById(req.params.id);
    if (!appro) throw new AppError('Approvisionnement introuvable', 404, 'NOT_FOUND');
    return res.json({ success: true, data: appro });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { error, value } = createApproSchema.validate(req.body);
    if (error) throw Object.assign(error, { isJoi: true });

    const appro = await service.create(value, req.user.uid);
    return res.status(201).json({ success: true, data: appro });
  } catch (err) { next(err); }
}

async function updateStatut(req, res, next) {
  try {
    const { error, value } = updateStatutSchema.validate(req.body);
    if (error) throw Object.assign(error, { isJoi: true });

    const appro = await service.updateStatut(
      req.params.id,
      value.statut,
      req.user.uid
    );
    if (!appro) throw new AppError('Approvisionnement introuvable', 404, 'NOT_FOUND');
    return res.json({ success: true, data: appro });
  } catch (err) { next(err); }
}

module.exports = { list, getById, create, updateStatut };