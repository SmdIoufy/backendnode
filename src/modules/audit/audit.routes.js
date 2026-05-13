'use strict';

const express    = require('express');
const router     = express.Router();
const controller = require('./audit.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

router.use(authenticate);

router.get('/activites',                        controller.activites);
router.get('/mouvements-stock',                 controller.mouvementsStock);
router.get('/activites/utilisateur/:firebaseUid', controller.activitesUtilisateur);

module.exports = router;