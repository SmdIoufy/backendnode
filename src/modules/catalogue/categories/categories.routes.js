'use strict';

const express    = require('express');
const router     = express.Router();
const controller = require('./categories.controller');
const { authenticate } = require('../../../middlewares/auth.middleware');
const { requireRole } = require('../../../middlewares/requireRole');

// Le catalogue est accessible aux rôles admin et gérant.
router.use(authenticate);
router.use(requireRole('admin', 'gerant'));

router.get('/',       controller.list);
router.post('/',      controller.create);
router.get('/:id',    controller.getById);
router.patch('/:id',  controller.update);
router.delete('/:id', controller.remove);

module.exports = router;