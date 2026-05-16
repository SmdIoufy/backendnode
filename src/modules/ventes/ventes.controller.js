'use strict';

const service     = require('./ventes.service');
const recuService = require('./vente.recu.service');
const AppError    = require('../../utils/AppError');
const { createVenteSchema, updateStatutSchema } = require('./ventes.validation');

async function list(req, res, next) {
  try {
    const { page, limit, statut, Cli_id } = req.query;
    const result = await service.findAll({
      page:  parseInt(page)  || 1,
      limit: parseInt(limit) || 20,
      statut, Cli_id,
    });
    return res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const vente = await service.findById(req.params.id);
    if (!vente) throw new AppError('Vente introuvable', 404, 'NOT_FOUND');
    return res.json({ success: true, data: vente });
  } catch (err) { next(err); }
}

async function recu(req, res, next) {
  try {
    const result = await recuService.getRecuVente(req.params.id);
    return res.json({ success: true, data: result });
  } catch (err) {
    if (err === 'VENTE_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'Vente introuvable',
      });
    }
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { error, value } = createVenteSchema.validate(req.body);
    if (error) throw Object.assign(error, { isJoi: true });

    const vente = await service.create(value, req.user.uid);
    return res.status(201).json({ success: true, data: vente });
  } catch (err) { next(err); }
}

async function updateStatut(req, res, next) {
  try {
    const { error, value } = updateStatutSchema.validate(req.body);
    if (error) throw Object.assign(error, { isJoi: true });

    const vente = await service.updateStatut(
      req.params.id,
      value.statut,
      req.user.uid
    );
    if (!vente) throw new AppError('Vente introuvable', 404, 'NOT_FOUND');
    return res.json({ success: true, data: vente });
  } catch (err) { next(err); }
}

module.exports = { list, getById, recu, create, updateStatut };