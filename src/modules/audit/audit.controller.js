'use strict';

const service = require('./audit.service');

async function activites(req, res, next) {
  try {
    const { page, limit, dateDebut, dateFin } = req.query;
    const result = await service.getActivites({
      page:  parseInt(page)  || 1,
      limit: parseInt(limit) || 20,
      dateDebut, dateFin,
    });
    return res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

async function mouvementsStock(req, res, next) {
  try {
    const { page, limit, typeMouvement, Var_id, dateDebut, dateFin } = req.query;
    const result = await service.getMouvementsStock({
      page:  parseInt(page)  || 1,
      limit: parseInt(limit) || 20,
      typeMouvement, Var_id, dateDebut, dateFin,
    });
    return res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

async function activitesUtilisateur(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await service.getActivitesUtilisateur(
      req.params.firebaseUid,
      { page: parseInt(page) || 1, limit: parseInt(limit) || 20 }
    );
    return res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

module.exports = { activites, mouvementsStock, activitesUtilisateur };