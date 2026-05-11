'use strict';

const service  = require('./fournisseurs.service');
const AppError = require('../../utils/AppError');
const { createFournisseurSchema, updateFournisseurSchema } = require('./fournisseurs.validation');

async function list(req, res, next) {
  try {
    const { page, limit, search, actif } = req.query;
    const result = await service.findAll({
      page:  parseInt(page)  || 1,
      limit: parseInt(limit) || 20,
      search,
      actif: actif === 'false' ? false : true,
    });
    return res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const fournisseur = await service.findById(req.params.id);
    if (!fournisseur) throw new AppError('Fournisseur introuvable', 404, 'NOT_FOUND');
    return res.json({ success: true, data: fournisseur });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { error, value } = createFournisseurSchema.validate(req.body);
    if (error) throw Object.assign(error, { isJoi: true });

    const fournisseur = await service.create(value);
    return res.status(201).json({ success: true, data: fournisseur });
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const { error, value } = updateFournisseurSchema.validate(req.body);
    if (error) throw Object.assign(error, { isJoi: true });

    const fournisseur = await service.update(req.params.id, value);
    if (!fournisseur) throw new AppError('Fournisseur introuvable', 404, 'NOT_FOUND');
    return res.json({ success: true, data: fournisseur });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const result = await service.remove(req.params.id);
    if (!result) throw new AppError('Fournisseur introuvable', 404, 'NOT_FOUND');
    return res.json({ success: true, message: 'Fournisseur désactivé avec succès' });
  } catch (err) { next(err); }
}

module.exports = { list, getById, create, update, remove };