'use strict';

const express    = require('express');
const router     = express.Router();
const controller = require('./ventes.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

router.use(authenticate);

router.get('/',            controller.list);
router.post('/',           controller.create);
router.get('/:id',         controller.getById);
router.patch('/:id/statut', controller.updateStatut);

module.exports = router;