'use strict';

const express    = require('express');
const router     = express.Router();
const controller = require('./statistiques.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

router.use(authenticate);

router.get('/dashboard',              controller.getDashboard);
router.get('/familles-plus-vendues',  controller.getFamillesPlusVendues);
router.get('/variantes-plus-vendues', controller.getVariantesPlusVendues);

module.exports = router;