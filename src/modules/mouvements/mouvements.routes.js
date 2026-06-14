'use strict';

const express    = require('express');
const router     = express.Router();
const controller = require('./mouvements.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/requireRole');

// Les mouvements de stock sont réservés aux rôles admin et gérant.
router.use(authenticate);
router.use(requireRole('admin', 'gerant'));

router.get('/',     controller.list);
router.get('/:id',  controller.getById);

module.exports = router;