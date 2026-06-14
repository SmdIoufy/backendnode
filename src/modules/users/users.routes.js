'use strict';

const express    = require('express');
const router     = express.Router();
const controller = require('./users.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requireRole }  = require('../../middlewares/requireRole');

router.use(authenticate);

router.get('/me', controller.getMe);

router.get('/',      requireRole('ADMIN'), controller.list);
router.post('/',     requireRole('ADMIN'), controller.create);
router.get('/:id',   requireRole('ADMIN'), controller.getById);
router.patch('/:id', requireRole('ADMIN'), controller.update);

router.post('/:uid/role', requireRole('ADMIN'), controller.setRole);

module.exports = router;