'use strict';

const express    = require('express');
const router     = express.Router();
const controller = require('./approvisionnements.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/requireRole');

// Les approvisionnements modifient le stock, donc admin et gérant uniquement.
router.use(authenticate);
router.use(requireRole('admin', 'gerant'));

router.get('/',              controller.list);
router.post('/',             controller.create);
router.get('/:id',           controller.getById);
router.patch('/:id/statut',  controller.updateStatut);

module.exports = router;