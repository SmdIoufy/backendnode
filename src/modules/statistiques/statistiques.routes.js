'use strict';

const express    = require('express');
const router     = express.Router();
const controller = require('./statistiques.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/requireRole');

// Statistiques réservées aux administrateurs.
router.use(authenticate);
router.use(requireRole('admin'));

router.get('/dashboard',              controller.getDashboard);
router.get('/familles-plus-vendues',  controller.getFamillesPlusVendues);
router.get('/variantes-plus-vendues', controller.getVariantesPlusVendues);

module.exports = router;