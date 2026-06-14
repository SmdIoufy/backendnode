'use strict';

const { admin } = require('../config/firebase');
const usersService = require('../modules/users/users.service');

async function authenticate(req, res, next) {
  try {
    if (req.user?.uid && req.user?.email && req.user?.id && req.user?.role) {
      return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token manquant ou format invalide',
        code:    'MISSING_TOKEN',
      });
    }

    const token = authHeader.split('Bearer ')[1];

    const decodedToken = await admin.auth().verifyIdToken(token);

    const user = await usersService.findByFirebaseUid(decodedToken.uid);

    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé : utilisateur non enregistré',
        code:    'USER_NOT_REGISTERED',
      });
    }

    req.user = {
      uid:   decodedToken.uid,
      email: decodedToken.email,
      id:    user.id,
      role:  user.role,
    };

    next();

  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré',
      code:    'INVALID_TOKEN',
    });
  }
}

module.exports = { authenticate };