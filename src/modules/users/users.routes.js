'use strict';

const express    = require('express');
const router     = express.Router();
const controller = require('./users.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

router.use(authenticate);

// ⚠️ /me DOIT être avant /:id sinon Express croit que "me" est un id
router.get('/me',    controller.getMe);
router.get('/',      controller.list);
router.get('/:id',   controller.getById);
router.patch('/:id', controller.update);

module.exports = router;