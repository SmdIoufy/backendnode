'use strict';

const service  = require('./clients.service');
const AppError = require('../../utils/AppError');
const { createClientSchema, updateClientSchema } = require('./clients.validation');

// ── Lister ────────────────────────────────────────────────────
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

// ── Récupérer par ID ──────────────────────────────────────────
async function getById(req, res, next) {
  try {
    const client = await service.findById(req.params.id);
    if (!client) throw new AppError('Client introuvable', 404, 'NOT_FOUND');
    return res.json({ success: true, data: client });
  } catch (err) { next(err); }
}

// ── Créer ─────────────────────────────────────────────────────
async function create(req, res, next) {
  try {
    const { error, value } = createClientSchema.validate(req.body);
    if (error) throw Object.assign(error, { isJoi: true });

    const client = await service.create(value);
    return res.status(201).json({ success: true, data: client });
  } catch (err) { next(err); }
}

// ── Modifier ──────────────────────────────────────────────────
async function update(req, res, next) {
  try {
    const { error, value } = updateClientSchema.validate(req.body);
    if (error) throw Object.assign(error, { isJoi: true });

    const client = await service.update(req.params.id, value);
    if (!client) throw new AppError('Client introuvable', 404, 'NOT_FOUND');
    return res.json({ success: true, data: client });
  } catch (err) { next(err); }
}

// ── Désactiver ────────────────────────────────────────────────
async function remove(req, res, next) {
  try {
    const result = await service.remove(req.params.id);
    if (!result) throw new AppError('Client introuvable', 404, 'NOT_FOUND');
    return res.json({ success: true, message: 'Client désactivé avec succès' });
  } catch (err) { next(err); }
}

module.exports = { list, getById, create, update, remove };