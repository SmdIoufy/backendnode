'use strict';

const { admin } = require('../config/firebase');

async function authenticate(req, res, next) {
  try {
    // 1. Récupérer le token dans le header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token manquant ou format invalide',
        code:    'MISSING_TOKEN',
      });
    }

    // 2. Extraire le token
    const token = authHeader.split('Bearer ')[1];

    // 3. Vérifier le token avec Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);

    // 4. Attacher l'utilisateur à la requête
    req.user = {
      uid:   decodedToken.uid,
      email: decodedToken.email,
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