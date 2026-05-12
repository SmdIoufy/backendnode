'use strict';

const service  = require('./variantes.service');
const AppError = require('../../../utils/AppError');
const { createVarianteSchema, updateVarianteSchema } = require('./variantes.validation');

async function list(req, res, next) {
  try {
    const { page, limit, search, actif, Fam_id } = req.query;
    const result = await service.findAll({
      page:  parseInt(page)  || 1,
      limit: parseInt(limit) || 20,
      search, Fam_id,
      actif: actif === 'false' ? false : true,
    });
    return res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const variante = await service.findById(req.params.id);
    if (!variante) throw new AppError('Variante introuvable', 404, 'NOT_FOUND');
    return res.json({ success: true, data: variante });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { error, value } = createVarianteSchema.validate(req.body);
    if (error) throw Object.assign(error, { isJoi: true });

    const variante = await service.create(value);
    return res.status(201).json({ success: true, data: variante });
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const { error, value } = updateVarianteSchema.validate(req.body);
    if (error) throw Object.assign(error, { isJoi: true });

    const variante = await service.update(req.params.id, value);
    if (!variante) throw new AppError('Variante introuvable', 404, 'NOT_FOUND');
    return res.json({ success: true, data: variante });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const result = await service.remove(req.params.id);
    if (!result) throw new AppError('Variante introuvable', 404, 'NOT_FOUND');
    return res.json({ success: true, message: 'Variante désactivée avec succès' });
  } catch (err) { next(err); }
}

module.exports = { list, getById, create, update, remove };