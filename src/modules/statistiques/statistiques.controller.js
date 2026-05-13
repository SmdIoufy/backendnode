'use strict';

const service = require('./statistiques.service');

async function getFamillesPlusVendues(req, res, next) {
  try {
    const { limit, dateDebut, dateFin } = req.query;
    const data = await service.famillesPlusVendues({
      limit:    parseInt(limit) || 10,
      dateDebut, dateFin,
    });
    return res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function getVariantesPlusVendues(req, res, next) {
  try {
    const { limit, dateDebut, dateFin } = req.query;
    const data = await service.variantesPlusVendues({
      limit:    parseInt(limit) || 10,
      dateDebut, dateFin,
    });
    return res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function getDashboard(req, res, next) {
  try {
    const data = await service.dashboard();
    return res.json({ success: true, data });
  } catch (err) { next(err); }
}

module.exports = {
  getFamillesPlusVendues,
  getVariantesPlusVendues,
  getDashboard,
};