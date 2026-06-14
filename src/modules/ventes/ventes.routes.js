'use strict';

const express    = require('express');
const router     = express.Router();
const controller = require('./ventes.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/requireRole');

// Les ventes sont accessibles aux rôles admin et gérant.
router.use(authenticate);
router.use(requireRole('admin', 'gerant'));

router.get('/',            controller.list);
router.post('/',           controller.create);
router.get('/:id/recu',    controller.recu);
router.get('/:id',         controller.getById);
router.patch('/:id/statut', controller.updateStatut);

module.exports = router;