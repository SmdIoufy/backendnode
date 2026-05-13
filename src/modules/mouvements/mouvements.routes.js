'use strict';

const express    = require('express');
const router     = express.Router();
const controller = require('./mouvements.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

router.use(authenticate);

router.get('/',     controller.list);
router.get('/:id',  controller.getById);

module.exports = router;