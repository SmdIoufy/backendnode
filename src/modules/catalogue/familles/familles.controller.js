'use strict';

const service  = require('./familles.service');
const AppError = require('../../../utils/AppError');
const { createFamilleSchema, updateFamilleSchema } = require('./familles.validation');

async function list(req, res, next) {
  try {
    const { page, limit, search, actif, Cat_id } = req.query;
    const result = await service.findAll({
      page:   parseInt(page)  || 1,
      limit:  parseInt(limit) || 20,
      search, Cat_id,
      actif: actif === 'false' ? false : true,
    });
    return res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const famille = await service.findById(req.params.id);
    if (!famille) throw new AppError('Famille introuvable', 404, 'NOT_FOUND');
    return res.json({ success: true, data: famille });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { error, value } = createFamilleSchema.validate(req.body);
    if (error) throw Object.assign(error, { isJoi: true });

    const famille = await service.create(value);
    return res.status(201).json({ success: true, data: famille });
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const { error, value } = updateFamilleSchema.validate(req.body);
    if (error) throw Object.assign(error, { isJoi: true });

    const famille = await service.update(req.params.id, value);
    if (!famille) throw new AppError('Famille introuvable', 404, 'NOT_FOUND');
    return res.json({ success: true, data: famille });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const result = await service.remove(req.params.id);
    if (!result) throw new AppError('Famille introuvable', 404, 'NOT_FOUND');
    return res.json({ success: true, message: 'Famille désactivée avec succès' });
  } catch (err) { next(err); }
}

module.exports = { list, getById, create, update, remove };