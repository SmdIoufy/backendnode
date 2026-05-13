'use strict';

const service  = require('./mouvements.service');
const AppError = require('../../utils/AppError');

async function list(req, res, next) {
  try {
    const { page, limit, typeMouvement, Var_id, dateDebut, dateFin } = req.query;
    const result = await service.findAll({
      page:  parseInt(page)  || 1,
      limit: parseInt(limit) || 20,
      typeMouvement, Var_id, dateDebut, dateFin,
    });
    return res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const mouvement = await service.findById(req.params.id);
    if (!mouvement) throw new AppError('Mouvement introuvable', 404, 'NOT_FOUND');
    return res.json({ success: true, data: mouvement });
  } catch (err) { next(err); }
}

module.exports = { list, getById };