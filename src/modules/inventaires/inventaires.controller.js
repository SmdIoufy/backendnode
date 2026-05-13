'use strict';

const service  = require('./inventaires.service');
const AppError = require('../../utils/AppError');
const { createInventaireSchema, updateStatutSchema } = require('./inventaires.validation');

async function list(req, res, next) {
  try {
    const { page, limit, statut } = req.query;
    const result = await service.findAll({
      page:  parseInt(page)  || 1,
      limit: parseInt(limit) || 20,
      statut,
    });
    return res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const inventaire = await service.findById(req.params.id);
    if (!inventaire) throw new AppError('Inventaire introuvable', 404, 'NOT_FOUND');
    return res.json({ success: true, data: inventaire });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { error, value } = createInventaireSchema.validate(req.body);
    if (error) throw Object.assign(error, { isJoi: true });

    const inventaire = await service.create(value, req.user.uid);
    return res.status(201).json({ success: true, data: inventaire });
  } catch (err) { next(err); }
}

async function updateStatut(req, res, next) {
  try {
    const { error, value } = updateStatutSchema.validate(req.body);
    if (error) throw Object.assign(error, { isJoi: true });

    const inventaire = await service.updateStatut(
      req.params.id,
      value.statut,
      req.user.uid
    );
    if (!inventaire) throw new AppError('Inventaire introuvable', 404, 'NOT_FOUND');
    return res.json({ success: true, data: inventaire });
  } catch (err) { next(err); }
}

module.exports = { list, getById, create, updateStatut };