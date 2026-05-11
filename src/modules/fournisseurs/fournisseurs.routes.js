'use strict';

const express    = require('express');
const router     = express.Router();
const controller = require('./fournisseurs.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

router.use(authenticate);

router.get('/',      controller.list);
router.post('/',     controller.create);
router.get('/:id',   controller.getById);
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;